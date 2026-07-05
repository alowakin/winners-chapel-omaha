CREATE TABLE public.fellowship_join_requests (
  id           uuid                     NOT NULL DEFAULT gen_random_uuid(),
  first_name   text                     NOT NULL,
  last_name    text                     NOT NULL,
  email        text                     NOT NULL,
  phone        text,
  group_name   text                     NOT NULL,
  message      text,
  seen         boolean                  NOT NULL DEFAULT false,
  submitted_at timestamp with time zone          DEFAULT now(),
  CONSTRAINT fellowship_join_requests_pkey PRIMARY KEY (id)
);

ALTER TABLE public.fellowship_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_fj" ON public.fellowship_join_requests
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_select_fj" ON public.fellowship_join_requests
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_update_fj" ON public.fellowship_join_requests
  FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_delete_fj" ON public.fellowship_join_requests
  FOR DELETE TO anon USING (true);
