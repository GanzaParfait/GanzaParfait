-- Homepage hero descriptor list (hero only; not the global role line).
-- Idempotent. Safe to re-run.
-- Sets heroLayoutCopy.<layout>.heroDescriptors to the five-line set when it is
-- missing, empty, the three-line global role line, or an old multi-role line.
-- Custom descriptor lines are left untouched. siteSubtitle is not modified.

UPDATE public.site_settings s
SET settings_json = jsonb_set(
  s.settings_json,
  '{heroLayoutCopy}',
  (
    SELECT jsonb_object_agg(
      layout,
      CASE
        WHEN jsonb_typeof(copy) = 'object' AND (
          coalesce(trim(copy->>'heroDescriptors'), '') = ''
          OR copy->>'heroDescriptors' IN (
            'Software Engineer · Technology Entrepreneur · Founder',
            'Founder · Entrepreneur · Technologist · Software Engineer · AI Builder',
            'Founder · Entrepreneur · Technologist',
            'Founder • Software Engineer • AI Builder • Speaker • Entrepreneur',
            'Founder • Entrepreneur • Technologist • Software Engineer • AI Builder',
            'Software Engineer • AI Builder • Speaker • Entrepreneur',
            'Founder · Software Engineer · Technologist',
            'Founder · Software Engineer · AI Builder'
          )
        )
        THEN copy || jsonb_build_object(
          'heroDescriptors',
          'Software Engineer · Technology Entrepreneur · Research Technology · Data Systems & Analytics · Founder'
        )
        ELSE copy
      END
    )
    FROM jsonb_each(s.settings_json->'heroLayoutCopy') AS t(layout, copy)
  )
)
WHERE jsonb_typeof(s.settings_json->'heroLayoutCopy') = 'object'
  AND EXISTS (
    SELECT 1 FROM jsonb_each(s.settings_json->'heroLayoutCopy') AS t(layout, copy)
    WHERE jsonb_typeof(copy) = 'object'
      AND coalesce(copy->>'heroDescriptors', '') <> 'Software Engineer · Technology Entrepreneur · Research Technology · Data Systems & Analytics · Founder'
      AND (
        coalesce(trim(copy->>'heroDescriptors'), '') = ''
        OR copy->>'heroDescriptors' IN (
          'Software Engineer · Technology Entrepreneur · Founder',
          'Founder · Entrepreneur · Technologist · Software Engineer · AI Builder',
          'Founder · Entrepreneur · Technologist',
          'Founder • Software Engineer • AI Builder • Speaker • Entrepreneur',
          'Founder • Entrepreneur • Technologist • Software Engineer • AI Builder',
          'Software Engineer • AI Builder • Speaker • Entrepreneur',
          'Founder · Software Engineer · Technologist',
          'Founder · Software Engineer · AI Builder'
        )
      )
  );
