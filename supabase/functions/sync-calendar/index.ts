import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ICS_URL =
  'https://outlook.office365.com/owa/calendar/95a186d03b8c45b088d4108dc58d5bdf@wciomaha.org/2be8c96b13d04144a1f4a1c9f0bc13db8316641406026751126/calendar.ics'

const OMAHA_TZ = 'America/Chicago'

type Category = 'worship' | 'prayer' | 'fellowship' | 'outreach'

interface DBEvent {
  uid: string
  source: 'calendar'
  title: string
  date: string
  time: string
  date_end: string | null
  time_end: string | null
  category: Category
  description: string | null
  location: string
}

const DAY_CODE: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
}

// ── ICS helpers ──────────────────────────────────────────────────────────────

function unfold(raw: string): string[] {
  // Join continuation lines (RFC 5545 line folding)
  return raw.replace(/\r\n[ \t]/g, '').replace(/\r/g, '').split('\n')
}

function icsDateToLocal(val: string): { date: string; time: string } {
  // All-day: YYYYMMDD
  if (/^\d{8}$/.test(val)) {
    return {
      date: `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}`,
      time: '9:00 AM',
    }
  }
  // Date-time: YYYYMMDDTHHmmss[Z]
  const isUTC = val.endsWith('Z')
  const clean = val.replace('Z', '')
  const iso =
    `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}` +
    `T${clean.slice(9, 11)}:${clean.slice(11, 13)}:${clean.slice(13, 15)}` +
    (isUTC ? 'Z' : '')
  const d = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: OMAHA_TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
  const parts = Object.fromEntries(fmt.formatToParts(d).map(p => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute} ${parts.dayPeriod}`,
  }
}

function mapCategory(title: string): Category {
  const t = title.toLowerCase()
  if (t.includes('prayer') || t.includes('upper room') || t.includes('covenant hour')) return 'prayer'
  if (t.includes('worship') || t.includes('service') || t.includes('communion')) return 'worship'
  if (t.includes('outreach')) return 'outreach'
  return 'fellowship'
}

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

function nthWeekday(year: number, month: number, weekday: number, n: number): Date | null {
  if (n > 0) {
    const d = new Date(year, month, 1)
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1)
    d.setDate(d.getDate() + (n - 1) * 7)
    return d.getMonth() === month ? d : null
  } else {
    const d = new Date(year, month + 1, 0)
    while (d.getDay() !== weekday) d.setDate(d.getDate() - 1)
    d.setDate(d.getDate() + (n + 1) * 7)
    return d.getMonth() === month ? d : null
  }
}

// ── RRULE expander (covers WEEKLY and MONTHLY patterns) ──────────────────────

function expandRRule(
  rrule: string,
  dtstart: string,
  base: Omit<DBEvent, 'date' | 'date_end' | 'time' | 'time_end'>,
): DBEvent[] {
  const params: Record<string, string> = {}
  rrule.split(';').forEach(p => {
    const [k, v] = p.split('=')
    params[k] = v
  })

  const { date: startStr, time } = icsDateToLocal(dtstart)
  const freq = params.FREQ
  const byDay = (params.BYDAY || '').split(',').filter(Boolean)
  const until = params.UNTIL
    ? new Date(`${params.UNTIL.slice(0, 4)}-${params.UNTIL.slice(4, 6)}-${params.UNTIL.slice(6, 8)}`)
    : null
  const count = params.COUNT ? parseInt(params.COUNT) : null

  const now = new Date(); now.setHours(0, 0, 0, 0)
  const horizon = new Date(); horizon.setMonth(horizon.getMonth() + 6)
  const endBound = until && until < horizon ? until : horizon

  const results: DBEvent[] = []

  if (freq === 'WEEKLY') {
    for (const bd of byDay) {
      const targetDay = DAY_CODE[bd]
      if (targetDay === undefined) continue
      let d = new Date(startStr + 'T00:00:00')
      while (d.getDay() !== targetDay) d.setDate(d.getDate() + 1)
      let i = 0
      while (d <= endBound) {
        if (d >= now && (!count || i < count)) {
          results.push({
            ...base,
            uid: `${base.uid}_${toDateStr(d)}_${bd}`,
            date: toDateStr(d),
            time,
            date_end: null,
            time_end: null,
          })
          i++
        }
        d = new Date(d)
        d.setDate(d.getDate() + 7)
      }
    }
  } else if (freq === 'MONTHLY') {
    for (
      let cur = new Date(now.getFullYear(), now.getMonth(), 1);
      cur <= endBound;
      cur.setMonth(cur.getMonth() + 1)
    ) {
      for (const bd of byDay) {
        const match = bd.match(/^(-?\d+)([A-Z]{2})$/)
        if (!match) continue
        const n = parseInt(match[1])
        const wd = DAY_CODE[match[2]]
        if (wd === undefined) continue
        const d = nthWeekday(cur.getFullYear(), cur.getMonth(), wd, n)
        if (d && d >= now && d <= endBound) {
          results.push({
            ...base,
            uid: `${base.uid}_${toDateStr(d)}_${bd}`,
            date: toDateStr(d),
            time,
            date_end: null,
            time_end: null,
          })
        }
      }
    }
  }

  return results
}

// ── ICS parser ───────────────────────────────────────────────────────────────

function parseICS(raw: string): DBEvent[] {
  const lines = unfold(raw)
  const events: DBEvent[] = []
  let inEvent = false
  let props: Record<string, string> = {}

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true
      props = {}
      continue
    }
    if (line.startsWith('END:VEVENT')) {
      inEvent = false
      const uid = props['UID'] || `ics_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const title = props['SUMMARY'] || 'Event'
      const description =
        props['DESCRIPTION']?.replace(/\\n/g, '\n').replace(/\\,/g, ',').trim() || null
      const location = props['LOCATION'] || 'Winner Chapel Main Hall'
      const dtstart = props['DTSTART'] || ''
      const dtend = props['DTEND'] || ''
      const rrule = props['RRULE']
      if (!dtstart) continue

      const base: Omit<DBEvent, 'date' | 'date_end' | 'time' | 'time_end'> = {
        uid,
        source: 'calendar',
        title,
        category: mapCategory(title),
        description,
        location,
      }

      if (rrule) {
        events.push(...expandRRule(rrule, dtstart, base))
      } else {
        const { date, time } = icsDateToLocal(dtstart)
        const today = new Date().toISOString().split('T')[0]
        if (date < today) continue // skip past one-off events
        const { date: dateEnd, time: timeEnd } = dtend
          ? icsDateToLocal(dtend)
          : { date: '', time: '' }
        events.push({
          ...base,
          date,
          time,
          date_end: dateEnd || null,
          time_end: timeEnd || null,
        })
      }
      continue
    }

    if (!inEvent) continue

    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    // Strip param qualifiers from key: DTSTART;TZID=Central Standard Time → DTSTART
    const baseKey = line.slice(0, colonIdx).split(';')[0]
    const value = line.slice(colonIdx + 1).trim()
    props[baseKey] = value
  }

  return events
}

// ── Entry point ──────────────────────────────────────────────────────────────

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const res = await fetch(ICS_URL)
    if (!res.ok) throw new Error(`ICS fetch failed: ${res.status} ${res.statusText}`)
    const icsText = await res.text()
    const events = parseICS(icsText)

    // Remove past calendar events that are no longer relevant
    const today = new Date().toISOString().split('T')[0]
    await supabase.from('events').delete().eq('source', 'calendar').lt('date', today)

    if (events.length > 0) {
      const { error } = await supabase
        .from('events')
        .upsert(events, { onConflict: 'uid' })
      if (error) throw error
    }

    console.log(`[sync-calendar] Synced ${events.length} events from Outlook`)
    return new Response(
      JSON.stringify({ ok: true, synced: events.length }),
      { headers: { 'Content-Type': 'application/json' } },
    )
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[sync-calendar]', msg)
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
