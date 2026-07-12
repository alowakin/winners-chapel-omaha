-- Gallery photos table
CREATE TABLE public.gallery_photos (
  id            uuid        NOT NULL DEFAULT gen_random_uuid(),
  image_url     text        NOT NULL,
  caption       text,
  event_name    text,
  taken_at      date,
  display_order integer     NOT NULL DEFAULT 0,
  created_at    timestamptz          DEFAULT now(),
  CONSTRAINT gallery_photos_pkey PRIMARY KEY (id)
);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery photos"
  ON public.gallery_photos FOR SELECT USING (true);

CREATE POLICY "Anon can insert gallery photos"
  ON public.gallery_photos FOR INSERT WITH CHECK (true);

CREATE POLICY "Anon can update gallery photos"
  ON public.gallery_photos FOR UPDATE USING (true);

CREATE POLICY "Anon can delete gallery photos"
  ON public.gallery_photos FOR DELETE USING (true);

-- Storage bucket (run separately in Supabase Dashboard > Storage, or via API)
-- Bucket name: gallery
-- Public: true
--
-- If using SQL migration for storage policies, uncomment below after creating the bucket in the Dashboard:
--
-- CREATE POLICY "Public read gallery storage"
--   ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
--
-- CREATE POLICY "Anon upload gallery storage"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery');
--
-- CREATE POLICY "Anon delete gallery storage"
--   ON storage.objects FOR DELETE USING (bucket_id = 'gallery');
