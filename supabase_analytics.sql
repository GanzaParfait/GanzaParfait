-- ============================================================
-- Analytics setup for Prince Parfait GANZA portfolio
-- Run this entire script in the Supabase SQL editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(255) NOT NULL,
    referrer VARCHAR(500),
    country_code VARCHAR(10) DEFAULT 'RW',
    country_name VARCHAR(100) DEFAULT 'Rwanda',
    country_flag VARCHAR(10) DEFAULT '🇷🇼',
    device VARCHAR(100) DEFAULT 'Desktop',
    device_type VARCHAR(20) DEFAULT 'Desktop',
    ip_address VARCHAR(100),
    visitor_id UUID,
    session_id UUID,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.page_views
ADD COLUMN IF NOT EXISTS visitor_id UUID,
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS user_agent TEXT,
ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) DEFAULT 'Desktop';

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON public.page_views (visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_country_name ON public.page_views (country_name);

GRANT ALL ON public.page_views TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous insert on page_views" ON public.page_views;
CREATE POLICY "Allow anonymous insert on page_views"
ON public.page_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow service role read on page_views" ON public.page_views;
CREATE POLICY "Allow service role read on page_views"
ON public.page_views
FOR SELECT
TO service_role
USING (true);
