-- Run this in the Supabase SQL editor.
-- Case-study fields for the selected-work and project detail layouts.
-- The dashboard writes these on site_settings.settings_json -> projectRecords.
-- The columns below keep public.projects ready for the same details.

COMMENT ON COLUMN public.site_settings.settings_json IS
  'Full SiteSettings document. Includes homepage section copy and projectRecords. Each project record may include tagline, period, organization, myRole, highlights, features, learned, quote, quoteBy, caseStudyFile, screenshotCaptions, flourish, screenshots, and videos. Leave quote, duration, live URL, source URL, and file empty until they are verified.';

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS my_role text,
  ADD COLUMN IF NOT EXISTS period text,
  ADD COLUMN IF NOT EXISTS highlights text[],
  ADD COLUMN IF NOT EXISTS features text[],
  ADD COLUMN IF NOT EXISTS learned text,
  ADD COLUMN IF NOT EXISTS quote text,
  ADD COLUMN IF NOT EXISTS quote_by text,
  ADD COLUMN IF NOT EXISTS case_study_file text,
  ADD COLUMN IF NOT EXISTS screenshot_captions text[],
  ADD COLUMN IF NOT EXISTS flourish text,
  ADD COLUMN IF NOT EXISTS challenge text,
  ADD COLUMN IF NOT EXISTS outcome text,
  ADD COLUMN IF NOT EXISTS context text,
  ADD COLUMN IF NOT EXISTS technologies text[],
  ADD COLUMN IF NOT EXISTS screenshots text[],
  ADD COLUMN IF NOT EXISTS videos text[];
