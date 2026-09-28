-- Project screenshots supplied for AskField, Caritas, GOA+, Julia Foundation,
-- KT Computer Supplying, NGAZI, PSTA, StockPro and WAKOW.
-- Idempotent. Patches existing site_settings.settings_json.projectRecords.
-- Featured image is the default cover. Does not insert new projects.

WITH patches AS (
  SELECT jsonb_build_object(
    'askfield', jsonb_build_object(
      'image', '/images/projects/askfield/homepage.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/askfield/homepage.png',
        '/images/projects/askfield/surveys.png',
        '/images/projects/askfield/projects.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/askfield/homepage.png',
        '/images/projects/askfield/login.png',
        '/images/projects/askfield/surveys.png',
        '/images/projects/askfield/projects.png',
        '/images/projects/askfield/survey-preview.png',
        '/images/projects/askfield/search.png',
        '/images/projects/askfield/billing.png',
        '/images/projects/askfield/settings.png',
        '/images/projects/askfield/footer.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'Sign in',
        'Surveys',
        'Projects',
        'Survey preview',
        'Search',
        'Billing',
        'Settings',
        'Footer'
      )
    ),
    'caritas-systems', jsonb_build_object(
      'image', '/images/projects/caritas-systems/dashboard.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/caritas-systems/dashboard.png',
        '/images/projects/caritas-systems/locations.png',
        '/images/projects/caritas-systems/notifications.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/caritas-systems/dashboard.png',
        '/images/projects/caritas-systems/login.png',
        '/images/projects/caritas-systems/auth.png',
        '/images/projects/caritas-systems/locations.png',
        '/images/projects/caritas-systems/notifications.png',
        '/images/projects/caritas-systems/settings.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Dashboard',
        'Sign in',
        'Account access',
        'Locations',
        'Notifications',
        'Profile settings'
      )
    ),
    'caritas-website', jsonb_build_object(
      'image', '/images/projects/caritas-website/welcome.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/caritas-website/welcome.png',
        '/images/projects/caritas-website/programs.png',
        '/images/projects/caritas-website/donation.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/caritas-website/welcome.png',
        '/images/projects/caritas-website/about.png',
        '/images/projects/caritas-website/departments.png',
        '/images/projects/caritas-website/programs.png',
        '/images/projects/caritas-website/project.png',
        '/images/projects/caritas-website/publications.png',
        '/images/projects/caritas-website/impact.png',
        '/images/projects/caritas-website/donation.png',
        '/images/projects/caritas-website/donation-modal.png',
        '/images/projects/caritas-website/footer.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'About',
        'Departments',
        'Programs',
        'Department project',
        'Publications',
        'Impact metrics',
        'Donation',
        'Donation confirmation',
        'Footer'
      )
    ),
    'stockpro', jsonb_build_object(
      'image', '/images/projects/stockpro/dashboard.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/stockpro/dashboard.png',
        '/images/projects/stockpro/products.png',
        '/images/projects/stockpro/invoice.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/stockpro/dashboard.png',
        '/images/projects/stockpro/welcome.png',
        '/images/projects/stockpro/auth.png',
        '/images/projects/stockpro/account.png',
        '/images/projects/stockpro/products.png',
        '/images/projects/stockpro/invoice-create.png',
        '/images/projects/stockpro/invoice.png',
        '/images/projects/stockpro/invoice-standard.png',
        '/images/projects/stockpro/invoice-compact.png',
        '/images/projects/stockpro/invoice-thermal.png',
        '/images/projects/stockpro/verify.png',
        '/images/projects/stockpro/report.png',
        '/images/projects/stockpro/settings.png',
        '/images/projects/stockpro/theme.png',
        '/images/projects/stockpro/docs.png',
        '/images/projects/stockpro/pricing.png',
        '/images/projects/stockpro/notifications.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Dashboard',
        'Public homepage',
        'Sign in',
        'New account',
        'Products',
        'Proforma invoice',
        'Invoice document',
        'Standard invoice',
        'Compact invoice',
        'Thermal invoice',
        'Public invoice check',
        'Reports',
        'Profile settings',
        'Theme settings',
        'Documentation',
        'Pricing',
        'Notification prompt'
      )
    ),
    'psta-accounting', jsonb_build_object(
      'image', '/images/projects/psta/dashboard.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/psta/dashboard.png',
        '/images/projects/psta/tickets.png',
        '/images/projects/psta/report.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/psta/dashboard.png',
        '/images/projects/psta/new-ticket.png',
        '/images/projects/psta/tickets.png',
        '/images/projects/psta/report.png',
        '/images/projects/psta/report-categories.png',
        '/images/projects/psta/activity.png',
        '/images/projects/psta/airline-codes.png',
        '/images/projects/psta/airport-codes.png',
        '/images/projects/psta/settings.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Dashboard',
        'New ticket',
        'Ticket list',
        'Report',
        'Report categories',
        'Activity monitoring',
        'Airline codes',
        'Airport codes',
        'Settings'
      )
    ),
    'wakow-general', jsonb_build_object(
      'image', '/images/projects/wakow/welcome.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/wakow/welcome.png',
        '/images/projects/wakow/about.png',
        '/images/projects/wakow/contact.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/wakow/welcome.png',
        '/images/projects/wakow/about.png',
        '/images/projects/wakow/contact.png',
        '/images/projects/wakow/footer.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'About',
        'Contact',
        'Footer'
      )
    ),
    'ngazi-construction', jsonb_build_object(
      'image', '/images/projects/ngazi/welcome.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/ngazi/welcome.png',
        '/images/projects/ngazi/services.png',
        '/images/projects/ngazi/projects.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/ngazi/welcome.png',
        '/images/projects/ngazi/services.png',
        '/images/projects/ngazi/projects.png',
        '/images/projects/ngazi/contact.png',
        '/images/projects/ngazi/chatbot.png',
        '/images/projects/ngazi/footer.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'Services',
        'Projects',
        'Contact',
        'Support chat',
        'Footer'
      )
    ),
    'julia-foundation', jsonb_build_object(
      'image', '/images/projects/julia/welcome.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/julia/welcome.png',
        '/images/projects/julia/about.png',
        '/images/projects/julia/donation.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/julia/welcome.png',
        '/images/projects/julia/welcome-dark.png',
        '/images/projects/julia/page-banner.png',
        '/images/projects/julia/page-banner-dark.png',
        '/images/projects/julia/about.png',
        '/images/projects/julia/about-dark.png',
        '/images/projects/julia/support.png',
        '/images/projects/julia/support-dark.png',
        '/images/projects/julia/tiers.png',
        '/images/projects/julia/tiers-dark.png',
        '/images/projects/julia/talents.png',
        '/images/projects/julia/talents-dark.png',
        '/images/projects/julia/donation.png',
        '/images/projects/julia/donation-dark.png',
        '/images/projects/julia/footer.png',
        '/images/projects/julia/footer-dark.png',
        '/images/projects/julia/loader.png',
        '/images/projects/julia/loader-dark.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'Homepage, dark',
        'Inner page banner',
        'Inner page banner, dark',
        'About',
        'About, dark',
        'Support our work',
        'Support our work, dark',
        'Tier plans',
        'Tier plans, dark',
        'Talents',
        'Talents, dark',
        'Donation',
        'Donation, dark',
        'Footer',
        'Footer, dark',
        'Site loader',
        'Site loader, dark'
      )
    ),
    'kt-computer-supplying', jsonb_build_object(
      'image', '/images/projects/kt/welcome.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/kt/welcome.png',
        '/images/projects/kt/product.png',
        '/images/projects/kt/checkout.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/kt/welcome.png',
        '/images/projects/kt/welcome-2.png',
        '/images/projects/kt/category.png',
        '/images/projects/kt/category-2.png',
        '/images/projects/kt/product.png',
        '/images/projects/kt/cart.png',
        '/images/projects/kt/checkout.png',
        '/images/projects/kt/footer.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'Homepage carousel',
        'Category',
        'Category, continued',
        'Product',
        'Cart',
        'Checkout',
        'Footer'
      )
    ),
    'goa-plus', jsonb_build_object(
      'image', '/images/projects/goa-plus/welcome.png',
      'pinnedMedia', jsonb_build_array(
        '/images/projects/goa-plus/welcome.png',
        '/images/projects/goa-plus/courses.png',
        '/images/projects/goa-plus/vr-course.png'
      ),
      'screenshots', jsonb_build_array(
        '/images/projects/goa-plus/welcome.png',
        '/images/projects/goa-plus/about-banner.png',
        '/images/projects/goa-plus/about.png',
        '/images/projects/goa-plus/why.png',
        '/images/projects/goa-plus/courses.png',
        '/images/projects/goa-plus/vr-course.png',
        '/images/projects/goa-plus/request-demo.png',
        '/images/projects/goa-plus/book-call.png',
        '/images/projects/goa-plus/partner.png',
        '/images/projects/goa-plus/seo.png',
        '/images/projects/goa-plus/footer.png'
      ),
      'screenshotCaptions', jsonb_build_array(
        'Homepage',
        'About banner',
        'About',
        'Why GOA+',
        'Courses',
        'VR course',
        'Request a demo',
        'Book a call',
        'Become a partner',
        'Search preview',
        'Footer'
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
