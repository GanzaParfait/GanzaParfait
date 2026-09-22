-- Public copy cleanup: About page + homepage meta-language normalization.
-- Idempotent. Safe to re-run.
-- Forces exactly three specialization cards and natural About hero copy.
-- Does not invent biographical facts.

WITH base AS (
  SELECT id, coalesce(settings_json, '{}'::jsonb) AS sj
  FROM public.site_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
about_patch AS (
  SELECT jsonb_build_object(
    'hero', jsonb_build_object(
      'label', 'About me',
      'title', 'Software engineer and technology entrepreneur.',
      'body', 'Prince Parfait GANZA is a software engineer and technology entrepreneur based in Kigali, Rwanda. He designs and develops software systems, research technology and data platforms for organizations and businesses. He is also the Founder & CEO of LERONY Ltd.',
      'roles', 'Software Engineer · Technology Entrepreneur · Founder'
    ),
    'focus', jsonb_build_object(
      'label', 'Specializations',
      'title', 'Areas of specialization',
      'items', jsonb_build_array(
        jsonb_build_object(
          'icon', 'code',
          'title', 'Software Engineering & Digital Systems',
          'body', 'Production software, business platforms, integrations and operational systems.'
        ),
        jsonb_build_object(
          'icon', 'data',
          'title', 'Research Technology & Digital Data Collection',
          'body', 'Digital surveys, research workflows, field data collection and systems supporting CAPI, CATI and CAWI operations.'
        ),
        jsonb_build_object(
          'icon', 'bulb',
          'title', 'Data Systems, Analytics & Decision Support',
          'body', 'Structured data, indicators, reporting, dashboards and systems that turn operational information into usable insight.'
        )
      )
    ),
    'story', jsonb_build_object(
      'label', 'Background',
      'title', 'My journey'
    ),
    'facts', jsonb_build_object(
      'label', 'Evidence',
      'title', 'Selected experience'
    ),
    'values', jsonb_build_object(
      'label', 'Principles',
      'title', 'How I work'
    ),
    'strengths', jsonb_build_object(
      'label', 'Technologies',
      'title', 'Engineering toolkit'
    )
  ) AS patch
),
homepage_patch AS (
  SELECT jsonb_build_object(
    'work', jsonb_build_object(
      'intro', 'Software systems, research technology and organizational data tools built in Kigali for real operational needs.'
    )
  ) AS patch
),
merged AS (
  SELECT
    base.id,
    jsonb_set(
      jsonb_set(
        base.sj,
        '{aboutPage}',
        coalesce(base.sj->'aboutPage', '{}'::jsonb) || (SELECT patch FROM about_patch),
        true
      ),
      '{homepage}',
      CASE
        WHEN coalesce(base.sj->'homepage'->'work'->>'intro', '') ~* 'evidence first|public identity|canonical identity|titles second'
          THEN coalesce(base.sj->'homepage', '{}'::jsonb) || (SELECT patch FROM homepage_patch)
        ELSE coalesce(base.sj->'homepage', '{}'::jsonb)
      END,
      true
    ) AS next_sj
  FROM base
)
UPDATE public.site_settings AS s
SET
  settings_json = merged.next_sj,
  updated_at = now()
FROM merged
WHERE s.id = merged.id;

-- Force about focus items to the three specialization pillars even when older four-card packs exist.
WITH base AS (
  SELECT id, coalesce(settings_json, '{}'::jsonb) AS sj
  FROM public.site_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
focus_items AS (
  SELECT jsonb_build_array(
    jsonb_build_object(
      'icon', 'code',
      'title', 'Software Engineering & Digital Systems',
      'body', 'Production software, business platforms, integrations and operational systems.'
    ),
    jsonb_build_object(
      'icon', 'data',
      'title', 'Research Technology & Digital Data Collection',
      'body', 'Digital surveys, research workflows, field data collection and systems supporting CAPI, CATI and CAWI operations.'
    ),
    jsonb_build_object(
      'icon', 'bulb',
      'title', 'Data Systems, Analytics & Decision Support',
      'body', 'Structured data, indicators, reporting, dashboards and systems that turn operational information into usable insight.'
    )
  ) AS items
)
UPDATE public.site_settings AS s
SET
  settings_json = jsonb_set(
    coalesce(s.settings_json, '{}'::jsonb),
    '{aboutPage,focus,items}',
    (SELECT items FROM focus_items),
    true
  ),
  updated_at = now()
FROM base
WHERE s.id = base.id;
