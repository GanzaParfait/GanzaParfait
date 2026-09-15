-- Add richer geo fields for analytics (city, region, coordinates).
-- Run in Supabase SQL editor after deploying this migration folder.

ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS region TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_page_views_city ON public.page_views (city);
CREATE INDEX IF NOT EXISTS idx_page_views_lat_lng ON public.page_views (latitude, longitude);
