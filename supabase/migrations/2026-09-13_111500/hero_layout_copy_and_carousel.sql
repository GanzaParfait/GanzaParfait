-- ============================================================
-- Hero carousel and per-layout copy
-- Stored in site_settings.settings_json. No new columns.
-- heroCarouselEnabled, heroCarouselMode, heroCarouselLayouts,
-- heroCarouselInterval, heroLayoutCopy.
-- Missing keys fall back to the shared settings document.
-- ============================================================

COMMENT ON COLUMN public.site_settings.settings_json IS
  'Full SiteSettings document. Includes per-layout hero copy and optional homepage carousel (heroLayoutCopy, heroCarouselEnabled, heroCarouselMode, heroCarouselLayouts, heroCarouselInterval).';
