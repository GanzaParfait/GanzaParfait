-- Google Calendar booking options normalization.
-- Idempotent. Safe to re-run.
-- Migrates legacy bookingCalendarUrl into bookingOptions[] (max 3).
-- Seeds the confirmed public appointment URL when none is stored.
-- Clarifies Contact phone note so it is not confused with meeting availability.

WITH base AS (
  SELECT id, coalesce(settings_json, '{}'::jsonb) AS sj
  FROM public.site_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
legacy AS (
  SELECT
    id,
    sj,
    nullif(btrim(coalesce(sj->>'bookingCalendarUrl', '')), '') AS legacy_url,
    CASE
      WHEN jsonb_typeof(sj->'bookingOptions') = 'array' THEN sj->'bookingOptions'
      ELSE '[]'::jsonb
    END AS existing_options
  FROM base
),
resolved AS (
  SELECT
    id,
    sj,
    coalesce(
      nullif(btrim(coalesce(existing_options->0->>'url', '')), ''),
      legacy_url,
      'https://calendar.app.google/fiMJ6sPJGvynrgDJ8'
    ) AS primary_url,
    existing_options
  FROM legacy
),
options AS (
  SELECT
    id,
    sj,
    primary_url,
    CASE
      WHEN jsonb_array_length(existing_options) > 0 THEN (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', coalesce(nullif(btrim(coalesce(item->>'id', '')), ''), 'meet-' || (ordinality::text)),
            'label', coalesce(nullif(btrim(coalesce(item->>'label', '')), ''), '30-minute meeting'),
            'durationMinutes', coalesce(nullif(item->>'durationMinutes', '')::int, 30),
            'description', coalesce(
              nullif(btrim(coalesce(item->>'description', '')), ''),
              'Choose an available time that works for you.'
            ),
            'url', CASE
              WHEN ordinality = 1 THEN primary_url
              ELSE coalesce(nullif(btrim(coalesce(item->>'url', '')), ''), '')
            END,
            'meetingType', coalesce(nullif(btrim(coalesce(item->>'meetingType', '')), ''), 'Google Meet'),
            'enabled', coalesce((item->>'enabled')::boolean, true),
            'featured', CASE WHEN ordinality = 1 THEN true ELSE coalesce((item->>'featured')::boolean, false) END
          )
          ORDER BY ordinality
        )
        FROM jsonb_array_elements(existing_options) WITH ORDINALITY AS t(item, ordinality)
        WHERE ordinality <= 3
      )
      ELSE jsonb_build_array(
        jsonb_build_object(
          'id', 'meet-30',
          'label', '30-minute meeting',
          'durationMinutes', 30,
          'description', 'Choose an available time that works for you.',
          'url', primary_url,
          'meetingType', 'Google Meet',
          'enabled', true,
          'featured', true
        )
      )
    END AS booking_options
  FROM resolved
),
contact_patch AS (
  SELECT
    o.id,
    CASE
      WHEN coalesce(o.sj#>>'{contactPage,cards,phoneNote}', '') ~* '^Mon\s*[–-]\s*Fri,?\s*8AM\s*[–-]\s*5PM\s*\(EAT\)$'
        OR coalesce(o.sj#>>'{contactPage,cards,phoneNote}', '') = ''
      THEN jsonb_set(
        coalesce(o.sj->'contactPage', '{}'::jsonb),
        '{cards,phoneNote}',
        to_jsonb('General contact availability · Mon–Fri, 8AM–5PM (EAT)'::text),
        true
      )
      ELSE coalesce(o.sj->'contactPage', '{}'::jsonb)
    END AS contact_page
  FROM options o
),
payload AS (
  SELECT
    o.id,
    o.sj
      || jsonb_build_object(
        'bookingEnabled', coalesce((o.sj->>'bookingEnabled')::boolean, true),
        'bookingCalendarUrl', o.primary_url,
        'bookingOptions', o.booking_options,
        'contactPage', c.contact_page
      ) AS settings_json
  FROM options o
  JOIN contact_patch c ON c.id = o.id
)
UPDATE public.site_settings AS s
SET
  settings_json = payload.settings_json,
  updated_at = now()
FROM payload
WHERE s.id = payload.id;
