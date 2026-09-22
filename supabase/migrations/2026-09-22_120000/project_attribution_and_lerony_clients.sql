-- Portfolio evidence expansion + attribution correction.
-- Idempotent. Safe to re-run (including after a prior draft/Digne version).
-- Extends site_settings.settings_json.projectRecords (app runtime path).
-- Does NOT invent private payment/banking details or ownership percentages.
-- Does NOT duplicate caritas-website / caritas-systems (CRNIS).
-- GOA+: public Co-Founder & CTO (no shareholding %).
-- NGAZI / La Fontaine / KT: Prince technical delivery only — no named collaborators.

WITH patches AS (
  SELECT jsonb_build_object(
    'caritas-systems', jsonb_build_object(
      'links', jsonb_build_object('live', 'https://crnis.caritasrwanda.org/'),
      'domain', 'Data Systems, Analytics & Decision Support',
      'deliveredThrough', 'Engagement work',
      'contributionSummary', 'Software engineering contribution to organization-wide indicator management and decision-support systems (CRNIS).',
      'workGroup', 'research',
      'visibility', 'public'
    ),
    'caritas-website', jsonb_build_object(
      'title', 'Caritas Rwanda Website Revamp',
      'links', jsonb_build_object('live', 'https://new.caritasrwanda.org/'),
      'domain', 'Software Engineering & Digital Systems',
      'longDescription', 'Public-facing website work for Caritas Rwanda, treated separately from the internal indicator and information-management systems (CRNIS).',
      'workGroup', 'web',
      'visibility', 'public'
    ),
    'apn-african-marketplace', $json$
{
  "id": "apn-african-marketplace",
  "title": "APN African Marketplace",
  "organization": "APN African Marketplace",
  "organizationUrl": "https://apnafricanmarket.com/",
  "description": "E-commerce web platform for African heritage and fashion products — catalog, accounts and checkout workflows.",
  "longDescription": "Client e-commerce platform for APN African Marketplace. Delivered commercially through LERONY Ltd. Prince Parfait GANZA’s contribution was direct design and development of the web platform.",
  "myRole": "Lead Developer",
  "domain": "E-commerce",
  "deliveredThrough": "LERONY Ltd",
  "contributionSummary": "Direct design/development and technical delivery of the web platform.",
  "contribution": "creator",
  "market": "Des Moines, Iowa, United States",
  "capabilities": ["E-commerce / web engineering", "Product catalog experiences", "Cloud media", "Backend & data services", "API integrations", "International payment workflows"],
  "technologies": ["React", "Next.js", "Supabase", "Cloudinary", "REST APIs", "Stripe"],
  "category": "web",
  "workGroup": "web",
  "status": "live",
  "visibility": "public",
  "featured": true,
  "year": 2025,
  "collaborators": [],
  "links": { "live": "https://apnafricanmarket.com/" }
}
$json$::jsonb,
    'wakow-general', $json$
{
  "id": "wakow-general",
  "title": "WAKOW General Ltd",
  "organization": "WAKOW General Ltd",
  "organizationUrl": "https://wakowgeneral.com/en",
  "description": "Digital presence for WAKOW General Ltd spanning brand/logo work, website implementation, SEO and Google Business Profile setup.",
  "myRole": "Developer / Digital Delivery",
  "domain": "Corporate Web",
  "deliveredThrough": "LERONY Ltd",
  "contributionSummary": "Branding/logo work, website implementation, SEO and Google Business Profile setup.",
  "contribution": "creator",
  "capabilities": ["Brand & logo", "Website implementation", "SEO foundations", "Google Business Profile setup"],
  "technologies": ["Web", "SEO", "Google Business Profile"],
  "category": "web",
  "workGroup": "web",
  "status": "live",
  "visibility": "public",
  "featured": false,
  "collaborators": [],
  "links": { "live": "https://wakowgeneral.com/en" }
}
$json$::jsonb,
    'ngazi-construction', $json$
{
  "id": "ngazi-construction",
  "title": "NGAZI Construction",
  "organization": "NGAZI Construction",
  "organizationUrl": "https://www.ngaziconstruction.com/",
  "description": "Corporate website for NGAZI Construction, delivered through LERONY Ltd — Prince supported technical delivery through testing, deployment, hosting and bug review.",
  "longDescription": "Client website engagement delivered through LERONY Ltd for NGAZI Construction. Prince Parfait GANZA’s verified contribution is technical delivery support: testing, deployment, hosting configuration and technical/bug review. This record does not claim that he personally built the complete application.",
  "whatIBuilt": "Testing, deployment, hosting configuration and technical/bug review for the NGAZI Construction website.",
  "myRole": "Technical Delivery",
  "domain": "Corporate Web",
  "deliveredThrough": "LERONY Ltd",
  "contributionSummary": "Supported technical delivery through deployment, hosting configuration, testing and bug review.",
  "contribution": "contributor",
  "collaborators": [],
  "capabilities": ["Deployment & hosting", "Testing", "Technical / bug review"],
  "technologies": ["Web", "Hosting"],
  "category": "web",
  "workGroup": "client",
  "status": "live",
  "visibility": "public",
  "featured": false,
  "highlights": ["Deployment and hosting configuration", "Testing and technical review", "Delivered through LERONY Ltd"],
  "links": { "live": "https://www.ngaziconstruction.com/" }
}
$json$::jsonb,
    'julia-foundation', $json$
{
  "id": "julia-foundation",
  "title": "Julia Foundation",
  "organization": "Julia Foundation",
  "organizationUrl": "https://juliafoundation.org/",
  "description": "NGO website and digital presence with donation enablement for an emerging Rwandan foundation.",
  "longDescription": "Website/platform developed for Julia Foundation. Donation workflows support Rwanda-relevant payment channels such as MTN Mobile Money, Airtel Money and card/banking options where implemented. No private account numbers or merchant secrets are stored in this record.",
  "myRole": "Lead Developer",
  "domain": "NGO / Nonprofit Digital Infrastructure",
  "deliveredThrough": "LERONY Ltd",
  "contributionSummary": "Direct website/platform development and donation/payment enablement.",
  "contribution": "creator",
  "market": "Rwanda",
  "capabilities": ["NGO / nonprofit websites", "Donation enablement", "Rwanda mobile-money payment support"],
  "technologies": ["Web", "Frontend", "Donation payments", "MTN Mobile Money", "Airtel Money"],
  "category": "web",
  "workGroup": "web",
  "status": "live",
  "visibility": "public",
  "featured": true,
  "collaborators": [],
  "links": { "live": "https://juliafoundation.org/" }
}
$json$::jsonb,
    'la-fontaine', $json$
{
  "id": "la-fontaine",
  "title": "La Fontaine",
  "organization": "La Fontaine",
  "organizationUrl": "https://fontaine03.org/index.php",
  "description": "Client website delivered through LERONY Ltd — Prince supported testing, deployment, hosting and technical review.",
  "longDescription": "Client website engagement delivered through LERONY Ltd. Prince Parfait GANZA’s verified contribution covers testing, deployment, hosting and technical/bug review. The portfolio does not claim personal authorship of the complete site.",
  "whatIBuilt": "Testing, deployment, hosting and technical/bug review for the La Fontaine website.",
  "myRole": "Technical Delivery",
  "domain": "Corporate Web",
  "deliveredThrough": "LERONY Ltd",
  "contributionSummary": "Testing, deployment, hosting and technical review for the live website.",
  "contribution": "contributor",
  "collaborators": [],
  "capabilities": ["Deployment & hosting", "Testing", "Technical review"],
  "technologies": ["Web", "Hosting", "PHP"],
  "category": "web",
  "workGroup": "client",
  "status": "live",
  "visibility": "public",
  "featured": false,
  "highlights": ["Deployment and hosting support", "Testing and technical review", "Delivered through LERONY Ltd"],
  "links": { "live": "https://fontaine03.org/index.php" }
}
$json$::jsonb,
    'kt-computer-supplying', $json$
{
  "id": "kt-computer-supplying",
  "title": "KT Computer Supplying Ltd",
  "organization": "KT Computer Supplying Ltd",
  "organizationUrl": "https://www.ktcomputersupplying.com/",
  "description": "E-commerce catalog site for KT Computer Supplying Ltd, delivered through LERONY Ltd — Prince contributed testing, deployment, hosting and technical review.",
  "longDescription": "Client e-commerce engagement delivered through LERONY Ltd. Prince Parfait GANZA’s verified contribution is testing, deployment, hosting and technical/bug review — not a claim that he personally developed the complete e-commerce application.",
  "whatIBuilt": "Testing, deployment, hosting and technical/bug review for the KT Computer Supplying catalog site.",
  "myRole": "Technical Delivery",
  "domain": "E-commerce",
  "deliveredThrough": "LERONY Ltd",
  "contributionSummary": "Testing, deployment, hosting and technical review on the catalog/storefront engagement.",
  "contribution": "contributor",
  "collaborators": [],
  "capabilities": ["Deployment & hosting", "Testing", "Technical review"],
  "technologies": ["Web", "E-commerce", "Hosting"],
  "category": "web",
  "workGroup": "client",
  "status": "live",
  "visibility": "public",
  "featured": false,
  "highlights": ["Catalog / storefront presence", "Testing, deployment and hosting support", "Delivered through LERONY Ltd"],
  "links": { "live": "https://www.ktcomputersupplying.com/" }
}
$json$::jsonb,
    'goa-plus', $json$
{
  "id": "goa-plus",
  "title": "GOA+",
  "organization": "GOA+",
  "organizationUrl": "https://goapluss.com/",
  "description": "VR education platform for African schools — Prince Parfait GANZA serves as Co-Founder & CTO.",
  "longDescription": "GOA+ (Go A+) is a VR education venture focused on immersive learning experiences for African schools. Prince Parfait GANZA is Co-Founder & CTO: the public record centres on technology leadership, technical direction and product/system oversight rather than unverified hands-on implementation claims for every product surface. Ownership percentages and cap-table details are not published.",
  "whatIBuilt": "Technology leadership and technical direction as Co-Founder & CTO — product/system oversight for the GOA+ venture. Specific module-level implementation details are only stated where separately verified.",
  "myRole": "Co-Founder & CTO",
  "domain": "Education Technology / Products & Ventures",
  "contributionSummary": "Co-Founder & CTO — technology leadership, technical direction and product/system oversight.",
  "contribution": "creator",
  "market": "Africa · based in Kigali, Rwanda",
  "capabilities": ["Technology leadership", "Technical direction", "Product / system oversight", "Education technology venture"],
  "technologies": [],
  "category": "product",
  "workGroup": "ventures",
  "status": "live",
  "visibility": "public",
  "featured": true,
  "period": "Ongoing",
  "year": 2025,
  "collaborators": [],
  "seoTitle": "GOA+ | Co-Founder & CTO — Prince Parfait GANZA",
  "seoDescription": "Prince Parfait GANZA is Co-Founder & CTO of GOA+, a VR education platform for African schools. Technology leadership and technical direction from Kigali.",
  "highlights": ["Co-Founder & CTO of GOA+", "VR education platform for African schools", "Technology leadership and technical direction"],
  "links": { "live": "https://goapluss.com/" }
}
$json$::jsonb
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
with_new AS (
  SELECT
    patched.records || coalesce(
      (
        SELECT jsonb_agg(patch_value)
        FROM patches,
        LATERAL jsonb_each(patches.by_id) AS e(patch_id, patch_value)
        WHERE patch_id IN (
          'apn-african-marketplace',
          'wakow-general',
          'ngazi-construction',
          'julia-foundation',
          'la-fontaine',
          'kt-computer-supplying',
          'goa-plus'
        )
        AND NOT EXISTS (
          SELECT 1
          FROM jsonb_array_elements(patched.records) ex
          WHERE ex->>'id' = patch_id
        )
      ),
      '[]'::jsonb
    ) AS records
  FROM patched
),
payload AS (
  SELECT
    base.id,
    jsonb_set(base.sj, '{projectRecords}', (SELECT records FROM with_new), true) AS next_sj
  FROM base
)
UPDATE public.site_settings AS s
SET
  settings_json = payload.next_sj,
  updated_at = now()
FROM payload
WHERE s.id = payload.id;

COMMENT ON COLUMN public.site_settings.settings_json IS
  'JSON settings bag. projectRecords entries may include deliveredThrough, contributionSummary, collaborators, organizationUrl, market, visibility, workGroup, seoTitle, seoDescription, capabilities, technologies, and links.live (canonical external URL without tracking params). GOA+ role is Co-Founder & CTO; no ownership percentages.';
