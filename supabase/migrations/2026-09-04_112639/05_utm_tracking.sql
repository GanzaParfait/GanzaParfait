-- UTM campaign tracking columns for page_views
ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(120),
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(120),
ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(120),
ADD COLUMN IF NOT EXISTS utm_term VARCHAR(120),
ADD COLUMN IF NOT EXISTS utm_content VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_page_views_utm_source ON public.page_views (utm_source);
CREATE INDEX IF NOT EXISTS idx_page_views_utm_campaign ON public.page_views (utm_campaign);
