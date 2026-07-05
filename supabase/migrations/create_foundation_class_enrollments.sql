CREATE TABLE public.foundation_class_enrollments (
  id            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  first_name    text                     NOT NULL,
  last_name     text                     NOT NULL,
  email         text                     NOT NULL,
  phone         text,
  believer_since text,
  referral      text,
  notes         text,
  seen          boolean                  NOT NULL DEFAULT false,
  enrolled_at   timestamp with time zone          DEFAULT now(),
  CONSTRAINT foundation_class_enrollments_pkey PRIMARY KEY (id)
);

ALTER TABLE public.foundation_class_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_fc" ON public.foundation_class_enrollments
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_fc" ON public.foundation_class_enrollments
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_fc" ON public.foundation_class_enrollments
  FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_fc" ON public.foundation_class_enrollments
  FOR DELETE TO anon USING (true);
