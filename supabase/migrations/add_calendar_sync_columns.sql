-- Step 1: Add uid and source columns to support calendar sync
-- Run this in the Supabase SQL Editor before deploying the edge function.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS uid    text UNIQUE,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

-- Step 2: Enable extensions needed for the scheduled sync
-- (Run these if not already enabled — you can also enable them via the Dashboard > Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 3: Schedule the sync every 6 hours
-- Replace YOUR_ANON_KEY with your Supabase anon key (found in Dashboard > Settings > API)
SELECT cron.schedule(
  'sync-outlook-calendar',
  '0 */6 * * *',
  $$
    SELECT net.http_post(
      url     := 'https://ydgcaquqnetawssqlnkj.supabase.co/functions/v1/sync-calendar',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_ANON_KEY"}'::jsonb,
      body    := '{}'::jsonb
    )
  $$
);

-- To check scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove the schedule if needed:
-- SELECT cron.unschedule('sync-outlook-calendar');
