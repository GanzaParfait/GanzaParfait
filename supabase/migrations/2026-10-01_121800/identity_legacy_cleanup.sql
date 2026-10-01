-- Identity cleanup: replace stored legacy role lines and bios.
-- Idempotent. Safe to re-run. Only exact legacy strings are replaced;
-- customized headlines and copy are left untouched.
--
-- Targets in site_settings.settings_json:
--   heroLayoutCopy.<layout>.siteSubtitle / bio
--   cvConfig.formats.<format>.headline
--   cvLibrary.documents[*].headline.value / sourceValue

CREATE OR REPLACE FUNCTION pg_temp.is_legacy_role(value text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT value IN (
    'Founder · Entrepreneur · Technologist · Software Engineer · AI Builder',
    'Founder · Entrepreneur · Technologist',
    'Founder • Software Engineer • AI Builder • Speaker • Entrepreneur',
    'Founder • Entrepreneur • Technologist • Software Engineer • AI Builder',
    'Software Engineer • AI Builder • Speaker • Entrepreneur',
    'Founder · Software Engineer · Technologist',
    'Founder · Software Engineer · AI Builder'
  )
$$;

CREATE OR REPLACE FUNCTION pg_temp.is_legacy_bio(value text) RETURNS boolean
LANGUAGE sql IMMUTABLE AS $$
  SELECT value IN (
    'Rwandan founder, entrepreneur and technologist. Software engineer and AI builder working from Kigali.',
    'Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.',
    'I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.'
  )
$$;

-- Hero per-layout copy
UPDATE public.site_settings s
SET settings_json = jsonb_set(
  s.settings_json,
  '{heroLayoutCopy}',
  (
    SELECT jsonb_object_agg(
      layout,
      copy
        || CASE WHEN pg_temp.is_legacy_role(copy->>'siteSubtitle')
             THEN jsonb_build_object('siteSubtitle', 'Software Engineer · Technology Entrepreneur · Founder')
             ELSE '{}'::jsonb END
        || CASE WHEN pg_temp.is_legacy_bio(copy->>'bio')
             THEN jsonb_build_object('bio', 'Software engineer and technology entrepreneur building software, research technology and data systems from Kigali.')
             ELSE '{}'::jsonb END
    )
    FROM jsonb_each(s.settings_json->'heroLayoutCopy') AS t(layout, copy)
  )
)
WHERE jsonb_typeof(s.settings_json->'heroLayoutCopy') = 'object'
  AND EXISTS (
    SELECT 1 FROM jsonb_each(s.settings_json->'heroLayoutCopy') AS t(layout, copy)
    WHERE pg_temp.is_legacy_role(copy->>'siteSubtitle') OR pg_temp.is_legacy_bio(copy->>'bio')
  );

-- Legacy cvConfig format headlines
UPDATE public.site_settings
SET settings_json = jsonb_set(settings_json, '{cvConfig,formats,professional,headline}', '"Software Engineer · Digital Systems"')
WHERE pg_temp.is_legacy_role(settings_json#>>'{cvConfig,formats,professional,headline}');

UPDATE public.site_settings
SET settings_json = jsonb_set(settings_json, '{cvConfig,formats,compact,headline}', '"Software Engineer · Technology Entrepreneur"')
WHERE pg_temp.is_legacy_role(settings_json#>>'{cvConfig,formats,compact,headline}');

UPDATE public.site_settings
SET settings_json = jsonb_set(settings_json, '{cvConfig,formats,executive,headline}', '"Founder & CEO · Technology & Innovation"')
WHERE pg_temp.is_legacy_role(settings_json#>>'{cvConfig,formats,executive,headline}');

-- CV library document headlines
UPDATE public.site_settings s
SET settings_json = jsonb_set(
  s.settings_json,
  '{cvLibrary,documents}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN pg_temp.is_legacy_role(doc#>>'{headline,value}') THEN
          jsonb_set(
            doc,
            '{headline}',
            (doc->'headline')
              || jsonb_build_object('value', fallback)
              || CASE WHEN (doc->'headline') ? 'sourceValue'
                   THEN jsonb_build_object('sourceValue', fallback)
                   ELSE '{}'::jsonb END
          )
        ELSE doc
      END
      ORDER BY ord
    )
    FROM (
      SELECT doc, ord,
        CASE doc->>'layoutId'
          WHEN 'professional' THEN 'Software Engineer · Digital Systems'
          WHEN 'compact' THEN 'Software Engineer · Technology Entrepreneur'
          ELSE 'Software Engineer · Technology Entrepreneur · Founder'
        END AS fallback
      FROM jsonb_array_elements(s.settings_json#>'{cvLibrary,documents}') WITH ORDINALITY AS d(doc, ord)
    ) docs
  )
)
WHERE jsonb_typeof(s.settings_json#>'{cvLibrary,documents}') = 'array'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(s.settings_json#>'{cvLibrary,documents}') AS d(doc)
    WHERE pg_temp.is_legacy_role(doc#>>'{headline,value}')
  );
