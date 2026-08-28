-- ============================================================
-- MIGRATION 08: Social links JSON, settings blob, footer image
-- ============================================================

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS navbar_style VARCHAR(20) DEFAULT 'pill',
  ADD COLUMN IF NOT EXISTS settings_json JSONB,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS footer_company_image VARCHAR(500),
  ADD COLUMN IF NOT EXISTS footer_company_image_dark VARCHAR(500),
  ADD COLUMN IF NOT EXISTS footer_company_fit VARCHAR(20) DEFAULT 'contain',
  ADD COLUMN IF NOT EXISTS footer_company_height VARCHAR(20) DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS footer_company_align VARCHAR(20) DEFAULT 'center',
  ADD COLUMN IF NOT EXISTS footer_company_href VARCHAR(500) DEFAULT 'https://lerony.com';

COMMENT ON COLUMN public.site_settings.settings_json IS
  'Full SiteSettings document. Public pages read this so contact, socials, and navbar stay in sync.';
COMMENT ON COLUMN public.site_settings.social_links IS
  'Array of {id, platform, label, url, enabled, header, footer, hero, contact, order}.';
