-- APN African Marketplace screenshots, plus Caritas Rwanda delivery record.
-- Idempotent. Patches existing site_settings.settings_json.projectRecords.
-- Caritas (systems and website): delivered through LERONY Ltd, built from scratch
-- with a team. Prince Parfait GANZA: Team Leader and Full Stack Software Engineer.
-- Other roles only — no invented personal names.

WITH patches AS (
  SELECT jsonb_build_object(
    'caritas-systems', jsonb_build_object(
      'myRole', 'Team Leader and Full Stack Software Engineer',
      'deliveredThrough', 'LERONY Ltd',
      'longDescription', 'Internal digital systems for Caritas Rwanda, used for organizational indicators, reporting and information management. Delivered through LERONY Ltd and developed from scratch with a team. Prince Parfait GANZA was Team Leader and Full Stack Software Engineer. The team also included a UI/UX designer, a full stack developer, a system analyst, and other roles. The systems support role-based access, dashboards, data management, exports and administrative workflows.',
      'whatIBuilt', 'Developed from scratch with a LERONY Ltd team. Prince Parfait GANZA led the engagement as Team Leader and Full Stack Software Engineer, working with a UI/UX designer, a full stack developer, a system analyst, and other roles. The systems cover role-based access, indicator tracking, dashboards, reporting, data management, exports and administrative workflows.',
      'contributionSummary', 'Team Leader and Full Stack Software Engineer on a LERONY Ltd delivery, developed from scratch with a team that also included a UI/UX designer, a full stack developer, a system analyst, and other roles.'
    ),
    'caritas-website', jsonb_build_object(
      'myRole', 'Team Leader and Full Stack Software Engineer',
      'deliveredThrough', 'LERONY Ltd',
      'longDescription', 'Public-facing website for Caritas Rwanda, kept separate from the internal indicator and information-management systems (CRNIS). Delivered through LERONY Ltd and developed from scratch with a team. Prince Parfait GANZA was Team Leader and Full Stack Software Engineer. The team also included a UI/UX designer, a full stack developer, a system analyst, and other roles.',
      'solution', 'A public website revamp for Caritas Rwanda, delivered through LERONY Ltd.',
      'whatIBuilt', 'Developed from scratch with a LERONY Ltd team. Prince Parfait GANZA led the engagement as Team Leader and Full Stack Software Engineer, working with a UI/UX designer, a full stack developer, a system analyst, and other roles.',
      'contributionSummary', 'Team Leader and Full Stack Software Engineer on a LERONY Ltd delivery, developed from scratch with a team that also included a UI/UX designer, a full stack developer, a system analyst, and other roles.'
    ),
    'apn-african-marketplace', jsonb_build_object(
      'image', '/images/projects/apn/welcome-banner.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/apn/welcome-banner.png',
        '/images/projects/apn/shop.png',
        '/images/projects/apn/product.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/apn/welcome-banner.png',
        '/images/projects/apn/welcome-banner-2.png',
        '/images/projects/apn/navigation.png',
        '/images/projects/apn/shop.png',
        '/images/projects/apn/discover.png',
        '/images/projects/apn/new-arrivals.png',
        '/images/projects/apn/product.png',
        '/images/projects/apn/product-gallery.png',
        '/images/projects/apn/checkout.png',
        '/images/projects/apn/account.png',
        '/images/projects/apn/wishlist.png',
        '/images/projects/apn/product-loading.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Storefront welcome',
        'Collection banner',
        'Category navigation',
        'Shop',
        'Discover more',
        'New arrivals',
        'Product page',
        'Product image gallery',
        'Checkout',
        'Account sign-in',
        'Wishlist',
        'Product loading state'
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
