-- Run this in the Supabase SQL editor.
-- Announcement sheet fields, homepage copy, and project media
-- are stored on site_settings.settings_json. No new required columns.
-- This file is what was missing from the last dashboard change.

COMMENT ON COLUMN public.site_settings.settings_json IS
  'Full SiteSettings document. Includes hero layout copy, homepage section copy, announcement sheet fields (announcementMedia, announcementLayout, announcementDate, announcementTime, announcementPlace, announcementClosing), and optional projectRecords.';

ALTER TABLE public.target_announcements
  ADD COLUMN IF NOT EXISTS eyebrow text,
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS detail text,
  ADD COLUMN IF NOT EXISTS cta_label text,
  ADD COLUMN IF NOT EXISTS date_label text,
  ADD COLUMN IF NOT EXISTS time_label text,
  ADD COLUMN IF NOT EXISTS place_label text,
  ADD COLUMN IF NOT EXISTS layout text DEFAULT 'side',
  ADD COLUMN IF NOT EXISTS closing_line text,
  ADD COLUMN IF NOT EXISTS media jsonb DEFAULT '[]'::jsonb;
