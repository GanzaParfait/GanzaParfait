-- ============================================================
-- MIGRATION 04: Real analytics tracking columns & RLS
-- ============================================================

ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS visitor_id UUID,
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) DEFAULT 'Desktop';

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views (visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_country_name ON public.page_views (country_name);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert on page_views" ON public.page_views;
CREATE POLICY "Allow anonymous insert on page_views"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
