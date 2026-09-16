-- Upsert detailed projectRecords for verified portfolio projects into
-- site_settings.settings_json. Safe to re-run.
-- Sources: docs/PORTFOLIO_CONTEXT.md + public case-study fields only.
-- Does not invent revenue, visitor counts, or private client names.

WITH records AS (
  SELECT jsonb_build_array(
    $json$
{
  "id": "caritas-systems",
  "title": "Caritas Rwanda Information Systems",
  "organization": "Caritas Rwanda",
  "description": "Organizational digital systems for indicator tracking, reporting, and information management.",
  "longDescription": "Work for Caritas Rwanda on internal digital systems used for organizational reporting and information management. The systems support role-based access, dashboards, data management, exports, and administrative workflows.",
  "context": "Caritas Rwanda needed digital systems for organizational indicator and information management.",
  "challenge": "Humanitarian and organizational reporting depends on reliable data, controlled access, and repeatable administrative workflows.",
  "solution": "Information-management functionality including dashboards, role-based access, reporting, exports, and administration.",
  "problem": "Organizational indicator and information-management work required structured digital systems.",
  "whatIBuilt": "Digital systems covering role-based access, dashboards, reporting, data management, exports, and administrative workflows.",
  "myRole": "Software engineer",
  "period": "Engagement work for Caritas Rwanda",
  "technologies": ["Web platforms", "Dashboards", "Role-based access", "Reporting"],
  "category": "systems",
  "status": "live",
  "featured": true,
  "wide": true,
  "cardSpan": "full",
  "flourish": "Data People Impact",
  "highlights": ["Role-based access control", "Indicators management", "Data collection", "Dashboards and reporting", "Export to Excel/PDF", "Administrative workflows"],
  "features": ["Role-based access for staff and administrators", "Indicator tracking and organizational reporting", "Dashboards for programme and operations overview", "Data collection and validation workflows", "Excel and PDF exports", "Administrative configuration and user management"],
  "learned": "Operational systems succeed when access control, reporting, and day-to-day data entry are designed as one workflow—not as separate tools.",
  "logo": "/images/projects/logos/caritas-rwanda.png",
  "image": "/images/projects/caritas-systems.webp",
  "pinnedMedia": ["/images/projects/caritas-systems.webp", "/images/projects/caritas-systems.webp", "/images/projects/caritas-systems.webp"],
  "screenshots": ["/images/projects/caritas-systems.webp", "/images/projects/caritas-systems.webp", "/images/projects/caritas-systems.webp", "/images/projects/caritas-systems.webp"],
  "screenshotCaptions": ["Dashboard overview", "Reports & analytics", "Indicators workspace", "Administration"],
  "links": {}
}
$json$::jsonb,
    $json$
{
  "id": "stockpro",
  "title": "StockPro",
  "organization": "Business operations",
  "description": "Inventory and sales management system covering stock, invoicing, clients, suppliers, and reporting.",
  "longDescription": "StockPro is an inventory and sales management system designed around everyday business operations: products, stock movement, invoices, proformas, transfers, adjustments, suppliers, clients, debts, payments, serial tracking, and reports.",
  "context": "Businesses need a single system for inventory, sales documents, and related financial follow-up.",
  "challenge": "Stock, invoicing, supplier, and client records often live in separate spreadsheets, which makes reporting and debt tracking difficult.",
  "solution": "An operations system for products, stock in/out, invoices, proformas, transfers, adjustments, suppliers, clients, debts, payments, serial tracking, and reports.",
  "problem": "Inventory and sales operations needed a structured system rather than disconnected records.",
  "whatIBuilt": "Inventory and sales management workflows spanning stock, documents, parties, payments, and reporting.",
  "myRole": "Software engineer",
  "technologies": ["Web application", "MySQL", "Business workflows", "Reporting"],
  "category": "product",
  "status": "live",
  "featured": true,
  "wide": true,
  "cardSpan": "full",
  "flourish": "Data People Impact",
  "highlights": ["Stock and inventory movement", "Invoicing and proformas", "Clients and suppliers", "Debts and payments", "Serial tracking", "Operational reports"],
  "features": ["Product and stock movement (in/out)", "Invoices and proformas", "Transfers and adjustments", "Suppliers, clients, debts, and payments", "Serial tracking", "Operational reports"],
  "learned": "Inventory products succeed when stock, documents, and party records stay in one operational loop.",
  "logo": "/images/projects/logos/stockpro.png",
  "image": "/images/projects/stockpro.webp",
  "pinnedMedia": ["/images/projects/stockpro.webp", "/images/projects/stockpro.webp", "/images/projects/stockpro.webp"],
  "screenshots": ["/images/projects/stockpro.webp", "/images/projects/stockpro.webp", "/images/projects/stockpro.webp", "/images/projects/stockpro.webp"],
  "screenshotCaptions": ["Dashboard overview", "Sales analytics", "Stock by brand", "Operations workspace"],
  "links": {}
}
$json$::jsonb,
    $json$
{
  "id": "psta-accounting",
  "title": "PSTA Ticket Accounting System",
  "organization": "PSTA",
  "description": "Software for airline ticket records, invoicing, commission reporting, authentication, and activity tracking.",
  "longDescription": "A software system associated with airline ticket and accounting workflows. Developed capabilities include ticket records, invoicing, commission reporting, authentication and security, and activity tracking. This is distinct from the earlier Reservation Agent operations role at PSTA.",
  "context": "Airline ticket and accounting work requires a reliable record of tickets, invoices, and commissions.",
  "challenge": "Ticket accounting and commission reporting need controlled access and a traceable activity history.",
  "solution": "A system covering ticket records, invoicing, commission reporting, authentication, and activity tracking.",
  "problem": "Airline ticket and accounting workflows needed structured digital records.",
  "whatIBuilt": "Ticket records, invoicing, commission reporting, authentication/security functionality, and activity tracking.",
  "myRole": "Software engineer",
  "period": "Associated with 2023–2024 PSTA work",
  "technologies": ["Web application", "Authentication", "Reporting", "Operational records"],
  "category": "systems",
  "status": "live",
  "featured": true,
  "cardSpan": "half",
  "highlights": ["Ticket records", "Invoicing", "Commission reporting", "Authentication and activity tracking"],
  "features": ["Ticket record management", "Invoicing workflows", "Commission reporting", "Authentication and security controls", "Activity tracking"],
  "image": "/images/projects/psta.webp",
  "pinnedMedia": ["/images/projects/psta.webp", "/images/projects/psta.webp", "/images/projects/psta.webp"],
  "screenshots": ["/images/projects/psta.webp", "/images/projects/psta.webp", "/images/projects/psta.webp"],
  "screenshotCaptions": ["Ticket records", "Invoicing", "Commission reporting"],
  "links": {}
}
$json$::jsonb,
    $json$
{
  "id": "askfield",
  "title": "AskField",
  "organization": "Ethical Research Solutions / AskField",
  "description": "Frontend development and API integration for a survey and data-collection platform.",
  "longDescription": "Contribution to the AskField survey platform through frontend development and API integration, using React and Redux. This was team/organizational work, not sole product ownership.",
  "context": "AskField is a survey and data-collection platform. Work was performed as part of Ethical Research Solutions / the product team.",
  "challenge": "The product needed frontend interfaces connected to existing APIs for survey and data-collection workflows.",
  "solution": "Frontend development and API integration using React and Redux.",
  "problem": "The survey platform required frontend work and API integration.",
  "whatIBuilt": "Frontend interfaces and API integration for survey/data-collection workflows.",
  "myRole": "Frontend development and API integration (team contribution)",
  "technologies": ["React", "Redux", "API integration"],
  "category": "web",
  "status": "live",
  "featured": false,
  "contribution": "contributor",
  "cardSpan": "half",
  "highlights": ["React frontend interfaces", "Redux state management", "REST API integration"],
  "features": ["Survey UI workflows", "API-backed data collection screens", "State management with Redux"],
  "logo": "/images/projects/logos/askfield.png",
  "image": "/images/projects/askfield.webp",
  "pinnedMedia": ["/images/projects/askfield.webp", "/images/projects/askfield.webp", "/images/projects/askfield.webp"],
  "screenshots": ["/images/projects/askfield.webp", "/images/projects/askfield.webp", "/images/projects/askfield.webp"],
  "screenshotCaptions": ["Survey workspace", "Data collection", "API-backed UI"],
  "links": {}
}
$json$::jsonb,
    $json$
{
  "id": "caritas-website",
  "title": "Caritas Rwanda Website",
  "organization": "Caritas Rwanda",
  "description": "Website revamp and public digital presence work for Caritas Rwanda.",
  "longDescription": "Public-facing website work for Caritas Rwanda, treated separately from the internal indicator and information-management systems.",
  "context": "Caritas Rwanda needed a renewed public website alongside its internal systems work.",
  "challenge": "The public website and internal information systems serve different audiences and should not be conflated.",
  "solution": "Website revamp / digital work for the public-facing Caritas Rwanda presence.",
  "problem": "The public digital presence required a website revamp distinct from internal systems.",
  "whatIBuilt": "Website revamp and related public digital work.",
  "myRole": "Software engineer",
  "technologies": ["Web", "Content", "Frontend"],
  "category": "web",
  "status": "live",
  "featured": false,
  "cardSpan": "half",
  "highlights": ["Public website revamp", "Content-oriented frontend work"],
  "features": ["Public digital presence updates", "Frontend presentation for organizational content"],
  "logo": "/images/projects/logos/caritas-rwanda.png",
  "image": "/images/projects/caritas-website.webp",
  "pinnedMedia": ["/images/projects/caritas-website.webp", "/images/projects/caritas-website.webp", "/images/projects/caritas-website.webp"],
  "screenshots": ["/images/projects/caritas-website.webp"],
  "screenshotCaptions": ["Public website"],
  "links": {}
}
$json$::jsonb,
    $json$
{
  "id": "gotallnews",
  "title": "GotAllNews",
  "organization": "Independent product",
  "description": "Independent digital media product covering publishing, articles, video, accounts, and engagement.",
  "longDescription": "GotAllNews is an independent digital media and product-development project. Relevant work includes content management, articles, video, short-form media, recommendation concepts, user accounts, engagement features, and publishing workflows. This is experimental/product work, distinct from commercially deployed client systems.",
  "context": "An independent media product exploring publishing workflows and audience engagement.",
  "challenge": "Publishing articles, video, and short-form media in one product requires accounts, workflows, and engagement features.",
  "solution": "A media platform with content management, publishing workflows, user accounts, and engagement concepts.",
  "problem": "Needed a product environment for articles, video, short-form media, and publishing workflows.",
  "whatIBuilt": "Product work across CMS, articles, video, short-form media, recommendation concepts, accounts, engagement, and publishing.",
  "myRole": "Independent product development",
  "technologies": ["React", "PHP", "MySQL", "Content management"],
  "category": "web",
  "status": "in-progress",
  "featured": false,
  "independent": true,
  "cardSpan": "half",
  "highlights": ["Publishing workflows", "Articles and video", "Accounts and engagement concepts"],
  "features": ["Content management", "Article publishing", "Video and short-form media concepts", "User accounts and engagement"],
  "logo": "/images/projects/logos/gotallnews.png",
  "image": "/images/projects/gotallnews.webp",
  "pinnedMedia": ["/images/projects/gotallnews.webp", "/images/projects/gotallnews.webp", "/images/projects/gotallnews.webp"],
  "screenshots": ["/images/projects/gotallnews.webp", "/images/projects/gotallnews.webp", "/images/projects/gotallnews.webp"],
  "screenshotCaptions": ["Publishing workspace", "Articles", "Media engagement"],
  "links": {}
}
$json$::jsonb,
    $json$
{
  "id": "lerony",
  "title": "LERONY Ltd",
  "organization": "LERONY Ltd",
  "description": "Technology and innovation company founded in Kigali to build digital solutions for organizations and businesses.",
  "longDescription": "LERONY Ltd is the company Prince Parfait GANZA founded in 2025. It is the commercial home for custom software, digital transformation, enterprise systems, AI-enabled solutions, and technology consulting. This personal site tells the founder story; lerony.com is the company brand.",
  "myRole": "Founder & CEO",
  "period": "2025–Present",
  "technologies": ["Next.js", "TypeScript", "React", "Node.js", "Supabase"],
  "category": "saas",
  "status": "live",
  "featured": true,
  "cardSpan": "half",
  "highlights": ["Custom software and web platforms", "Enterprise and business systems", "Digital transformation and consulting", "AI-enabled product integration"],
  "features": ["Custom software delivery", "Business systems", "Technology consulting", "AI-enabled solutions"],
  "links": { "live": "https://lerony.com" }
}
$json$::jsonb
  ) AS payload
),
base AS (
  SELECT id, coalesce(settings_json, '{}'::jsonb) AS sj
  FROM public.site_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
cleaned AS (
  SELECT
    base.id,
    base.sj,
    coalesce(
      (
        SELECT jsonb_agg(el)
        FROM jsonb_array_elements(coalesce(base.sj->'projectRecords', '[]'::jsonb)) AS el
        WHERE el->>'id' NOT IN (
          'caritas-systems', 'stockpro', 'psta-accounting', 'askfield',
          'caritas-website', 'gotallnews', 'lerony'
        )
      ),
      '[]'::jsonb
    ) AS kept
  FROM base
),
payload AS (
  SELECT
    cleaned.id,
    jsonb_set(cleaned.sj, '{projectRecords}', cleaned.kept || records.payload, true) AS next_sj
  FROM cleaned
  CROSS JOIN records
)
UPDATE public.site_settings AS s
SET
  settings_json = payload.next_sj,
  updated_at = now()
FROM payload
WHERE s.id = payload.id;

COMMENT ON COLUMN public.site_settings.settings_json IS
  'Full SiteSettings document. projectRecords include logo, pinnedMedia, cardSpan/wide, screenshots, videos, features, highlights, and related case-study fields.';
