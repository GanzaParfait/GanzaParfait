-- AskField role grew past frontend/API integration.
-- Idempotent. Patches the existing askfield projectRecords entry only.

WITH patches AS (
  SELECT jsonb_build_object(
    'askfield', jsonb_build_object(
      'description', 'Survey and data-collection platform covering frontend, backend, React Native, DevOps and XLSForm.',
      'longDescription', 'Team contribution to AskField, Ethical Research Solutions’ survey and digital data-collection platform. The recorded role is Frontend Integrator. The work covers frontend and API integration, backend, React Native, DevOps with Docker on a Hostinger VPS, the public website, survey templates and XLSForm, together with survey programming and CAPI, CATI and CAWI research workflows. This is team platform work, not sole product ownership.',
      'solution', 'Product engineering across the web application, backend, React Native and DevOps, with the public website, survey templates, XLSForm and production research-data workflows.',
      'problem', 'The survey platform required product interfaces, APIs, mobile access and reliable operations for live research collection.',
      'whatIBuilt', 'Frontend and API integration, backend, React Native, DevOps, the public website, survey templates and XLSForm on the AskField platform.',
      'contributionSummary', 'Frontend, backend, React Native and DevOps on the AskField survey platform, including the website, templates and XLSForm.',
      'myRole', 'Frontend Integrator · DevOps (team contribution)',
      'technologies', jsonb_build_array(
        'React',
        'React Native',
        'Docker',
        'XLSForm',
        'Redux',
        'API integration',
        'Backend',
        'DevOps',
        'Survey templates',
        'CAPI',
        'CATI',
        'CAWI',
        'GPS / Geolocation'
      ),
      'highlights', jsonb_build_array(
        'Frontend and API integration, then backend',
        'React Native mobile',
        'DevOps with Docker',
        'Public website, survey templates and XLSForm',
        'CAPI, CATI and CAWI collection workflows',
        'Field operations, monitoring and data export'
      ),
      'features', jsonb_build_array(
        'Web application and API integration',
        'Backend work on the platform',
        'React Native mobile',
        'DevOps with Docker on a Hostinger VPS',
        'Public website, survey templates and XLSForm',
        'Multi-mode collection workflows (CAPI / CATI / CAWI)'
      )
    )
  ) AS by_id
),
base AS (
  SELECT id, coalesce(settings_json, '{}'::jsonb) AS sj
  FROM public.site_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
existing AS (
  SELECT coalesce(base.sj->'projectRecords', '[]'::jsonb) AS records
  FROM base
),
patched AS (
  SELECT coalesce(
    (
      SELECT jsonb_agg(
        CASE
          WHEN (SELECT by_id ? (elem->>'id') FROM patches)
            THEN elem || (SELECT by_id -> (elem->>'id') FROM patches)
          ELSE elem
        END
      )
      FROM jsonb_array_elements((SELECT records FROM existing)) elem
    ),
    '[]'::jsonb
  ) AS records
),
payload AS (
  SELECT
    base.id,
    jsonb_set(base.sj, '{projectRecords}', (SELECT records FROM patched), true) AS next_sj
  FROM base
)
UPDATE public.site_settings AS s
SET
  settings_json = payload.next_sj,
  updated_at = now()
FROM payload
WHERE s.id = payload.id;
