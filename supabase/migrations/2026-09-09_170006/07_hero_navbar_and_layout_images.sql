-- ============================================================
-- MIGRATION 07: Navbar style + per-layout hero images + copy
-- ============================================================
-- SEO portrait URL must stay:
--   /images/profile/prince-parfait-ganza-kigali-rwanda.webp
-- Layout images can change independently. Do not point Person JSON-LD
-- at hero_image_* columns or media library URLs.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS navbar_style VARCHAR(20) DEFAULT 'pill',
  ADD COLUMN IF NOT EXISTS hero_image_url VARCHAR(500)
    DEFAULT '/images/profile/prince-parfait-ganza-kigali-rwanda.webp',
  ADD COLUMN IF NOT EXISTS hero_image_split VARCHAR(500)
    DEFAULT '/images/profile/prince-parfait-ganza-kigali-rwanda.webp',
  ADD COLUMN IF NOT EXISTS hero_image_centered VARCHAR(500)
    DEFAULT '/images/profile/hero-centered-portrait.webp',
  ADD COLUMN IF NOT EXISTS hero_image_overlay VARCHAR(500)
    DEFAULT '/images/profile/hero-cinematic-overlay.webp',
  ADD COLUMN IF NOT EXISTS hero_greeting VARCHAR(255) DEFAULT 'Hi there, I''m',
  ADD COLUMN IF NOT EXISTS hero_available_text VARCHAR(255) DEFAULT 'Available for new projects',
  ADD COLUMN IF NOT EXISTS hero_headline VARCHAR(255) DEFAULT 'Building software that creates impact.',
  ADD COLUMN IF NOT EXISTS hero_invite_line VARCHAR(255) DEFAULT 'Do you have a project?',
  ADD COLUMN IF NOT EXISTS hero_invite_cta_label VARCHAR(100) DEFAULT 'Let''s Talk',
  ADD COLUMN IF NOT EXISTS hero_invite_cta_href VARCHAR(255) DEFAULT '/contact',
  ADD COLUMN IF NOT EXISTS hero_primary_cta_label VARCHAR(100) DEFAULT 'View selected work',
  ADD COLUMN IF NOT EXISTS hero_primary_cta_href VARCHAR(255) DEFAULT '/projects',
  ADD COLUMN IF NOT EXISTS hero_secondary_cta_label VARCHAR(100) DEFAULT 'Contact',
  ADD COLUMN IF NOT EXISTS hero_secondary_cta_href VARCHAR(255) DEFAULT '/contact',
  ADD COLUMN IF NOT EXISTS hero_card_label VARCHAR(100) DEFAULT 'Welcome',
  ADD COLUMN IF NOT EXISTS hero_card_cta_label VARCHAR(100) DEFAULT 'Discover more',
  ADD COLUMN IF NOT EXISTS hero_card_cta_href VARCHAR(255) DEFAULT '/about',
  ADD COLUMN IF NOT EXISTS hero_stat_1_value VARCHAR(100) DEFAULT 'Founder',
  ADD COLUMN IF NOT EXISTS hero_stat_1_label VARCHAR(255) DEFAULT 'LERONY Ltd · 2025',
  ADD COLUMN IF NOT EXISTS hero_stat_2_value VARCHAR(100) DEFAULT 'Kigali',
  ADD COLUMN IF NOT EXISTS hero_stat_2_label VARCHAR(255) DEFAULT 'Rwanda',
  ADD COLUMN IF NOT EXISTS hero_stat_3_value VARCHAR(100) DEFAULT '2025',
  ADD COLUMN IF NOT EXISTS hero_stat_3_label VARCHAR(255) DEFAULT 'Company founded';

ALTER TABLE public.site_settings
  ALTER COLUMN banner_layout SET DEFAULT 'split_portrait';

UPDATE public.site_settings
SET
  navbar_style = COALESCE(navbar_style, 'pill'),
  banner_layout = CASE
    WHEN banner_layout IN ('split', 'tony_robbins', 'portm') THEN
      CASE banner_layout
        WHEN 'split' THEN 'split_portrait'
        WHEN 'tony_robbins' THEN 'featured_overlay'
        WHEN 'portm' THEN 'full_centered_floating'
        ELSE banner_layout
      END
    ELSE COALESCE(banner_layout, 'split_portrait')
  END,
  hero_image_split = COALESCE(hero_image_split, '/images/profile/prince-parfait-ganza-kigali-rwanda.webp'),
  hero_image_centered = COALESCE(hero_image_centered, '/images/profile/hero-centered-portrait.webp'),
  hero_image_overlay = COALESCE(hero_image_overlay, '/images/profile/hero-cinematic-overlay.webp')
WHERE true;

COMMENT ON COLUMN public.site_settings.hero_image_url IS
  'Legacy fallback only. JSON-LD Person image stays on the static SEO filename.';
COMMENT ON COLUMN public.site_settings.navbar_style IS
  'full = 100% width bar; pill = floating radiused bar.';
