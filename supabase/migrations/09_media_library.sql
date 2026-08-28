-- ============================================================
-- MIGRATION 09: Media library metadata
-- Run this in the Supabase SQL editor.
-- Do not alter storage.objects — that table is owned by Supabase.
-- The app creates the public "media" bucket via the Storage API.
-- ============================================================

ALTER TABLE public.media_assets
  ALTER COLUMN url TYPE TEXT,
  ADD COLUMN IF NOT EXISTS alt TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'upload',
  ADD COLUMN IF NOT EXISTS original_url TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS mime_type VARCHAR(120);

COMMENT ON TABLE public.media_assets IS
  'Dashboard media library. Files live in the public media storage bucket.';

GRANT ALL ON public.media_assets TO service_role;
GRANT SELECT ON public.media_assets TO anon, authenticated;

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read media assets" ON public.media_assets;
CREATE POLICY "Public read media assets"
ON public.media_assets
FOR SELECT
TO public
USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('media', 'media', true, 10485760)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit;
