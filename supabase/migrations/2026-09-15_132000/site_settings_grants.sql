-- Table privileges were missing; RLS alone is not enough for PostgREST.
-- Without these grants, service_role/anon get: permission denied for table site_settings

GRANT SELECT ON TABLE public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_settings TO service_role;
GRANT ALL ON TABLE public.site_settings TO service_role;

-- Ensure the JSON document columns exist for dashboard saves
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS settings_json JSONB,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS navbar_style VARCHAR(20) DEFAULT 'pill';
