-- Create prayer_requests table
-- Run this in the Supabase SQL Editor

CREATE TABLE public.prayer_requests (
  id           uuid    NOT NULL DEFAULT gen_random_uuid(),
  name         text    NOT NULL,
  email        text    NOT NULL,
  type         text    NOT NULL,
  message      text    NOT NULL,
  seen         boolean NOT NULL DEFAULT false,
  responded    boolean NOT NULL DEFAULT false,
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT prayer_requests_pkey PRIMARY KEY (id)
);
