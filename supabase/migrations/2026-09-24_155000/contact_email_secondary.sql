-- Ensure the secondary public contact address exists in settings_json.
-- Idempotent: only rows with a missing/blank contactEmailSecondary are touched,
-- so a value edited in the dashboard is never overwritten.

UPDATE public.site_settings
SET
  settings_json = jsonb_set(
    COALESCE(settings_json, '{}'::jsonb),
    '{contactEmailSecondary}',
    '"ganzaparfait7@gmail.com"'::jsonb,
    true
  ),
  updated_at = now()
WHERE COALESCE(NULLIF(TRIM(COALESCE(settings_json ->> 'contactEmailSecondary', '')), ''), '') = '';
