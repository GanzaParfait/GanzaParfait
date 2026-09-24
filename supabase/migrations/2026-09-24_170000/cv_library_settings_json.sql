-- CV document library lives in site_settings.settings_json.cvLibrary.
-- Documents are migrated from legacy cvConfig on first read in getCvLibrary().
-- This migration is intentionally a no-op seed marker so the key is documented
-- in the migration history; app-side migration avoids overwriting authored CVs.

DO $$
BEGIN
  -- Ensure settings_json exists; do not invent documents here.
  UPDATE public.site_settings
  SET settings_json = coalesce(settings_json, '{}'::jsonb)
  WHERE settings_json IS NULL;
END $$;
