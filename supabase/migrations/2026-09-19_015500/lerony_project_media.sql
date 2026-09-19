-- Idempotent LERONY Ltd company positioning refresh.
-- Merges only the lerony projectRecords entry; preserves unknown fields and other records.
-- Canonical company identity: technology & innovation (not SaaS / software-agency alone).

WITH lerony_patch AS (
  SELECT $json$
{
  "id": "lerony",
  "title": "LERONY Ltd",
  "organization": "LERONY Ltd",
  "description": "A Rwanda-based technology and innovation company building practical solutions that help organizations, businesses, and communities operate better, grow, and prepare for the future.",
  "longDescription": "LERONY Ltd is a technology and innovation company founded in Kigali, Rwanda in 2025. The company works with organizations, businesses, and communities to understand real challenges and create practical, scalable solutions through technology, innovation, strategy, and implementation. Its work can include digital solutions, smart systems, business transformation, software and platforms, AI-enabled solutions, technology consulting, and emerging technologies. LERONY is not defined by a single technology, product, or service category; its focus is using the right technologies and approaches to solve meaningful problems and create long-term value. This personal website presents the founder's journey and role in building LERONY, while lerony.com represents the company itself.",
  "context": "Organizations and businesses are navigating changing technology, growing operational complexity, and increasing expectations for efficient, connected, and future-ready services.",
  "challenge": "Many organizations have valuable ideas and important operational needs but lack the right combination of technology, strategy, systems, and implementation capacity to turn them into effective solutions.",
  "solution": "LERONY brings together technology, innovation, strategy, and implementation to design and build solutions around real organizational and business needs.",
  "problem": "Organizations need technology and innovation partners capable of understanding real challenges and turning them into practical, scalable, and sustainable solutions.",
  "whatIBuilt": "Founded LERONY Ltd as a Rwanda-based technology and innovation company focused on creating practical solutions and building what comes next.",
  "myRole": "Founder & CEO",
  "outcome": "Established LERONY Ltd as an independent technology and innovation company serving organizations and businesses through a growing range of technology, digital, strategic, and innovation capabilities.",
  "capabilities": [
    "Technology & Innovation",
    "Digital Solutions",
    "Smart Systems",
    "Business Transformation",
    "Software & Platforms",
    "AI-Enabled Solutions",
    "Technology Strategy & Consulting",
    "Emerging Technologies"
  ],
  "websiteTechnologies": ["Next.js", "TypeScript", "React", "Node.js", "Supabase"],
  "technologies": ["Next.js", "TypeScript", "React", "Node.js", "Supabase"],
  "category": "technology",
  "status": "live",
  "featured": true,
  "period": "2025–Present",
  "year": 2025,
  "logo": "/images/projects/logos/lerony.png",
  "image": "/images/projects/lerony/lerony-wide.jpg",
  "pinnedMedia": [
    "/images/projects/lerony/lerony-wide.jpg",
    "/images/projects/lerony/lerony-portrait.jpg",
    "/images/projects/logos/lerony.png"
  ],
  "screenshots": [
    "/images/projects/lerony/lerony-wide.jpg",
    "/images/projects/lerony/lerony-portrait.jpg"
  ],
  "links": { "live": "https://lerony.com" }
}
$json$::jsonb AS patch
),
base AS (
  SELECT id, coalesce(settings_json, '{}'::jsonb) AS sj
  FROM public.site_settings
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1
),
merged AS (
  SELECT
    base.id,
    CASE
      WHEN base.sj ? 'projectRecords'
        AND jsonb_typeof(base.sj->'projectRecords') = 'array'
        AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements(base.sj->'projectRecords') AS elem
          WHERE elem->>'id' = 'lerony'
        )
      THEN jsonb_set(
        base.sj,
        '{projectRecords}',
        (
          SELECT jsonb_agg(
            CASE
              WHEN elem->>'id' = 'lerony' THEN elem || lerony_patch.patch
              ELSE elem
            END
          )
          FROM jsonb_array_elements(base.sj->'projectRecords') AS elem
        ),
        true
      )
      WHEN base.sj ? 'projectRecords'
        AND jsonb_typeof(base.sj->'projectRecords') = 'array'
      THEN jsonb_set(
        base.sj,
        '{projectRecords}',
        (base.sj->'projectRecords') || jsonb_build_array(lerony_patch.patch),
        true
      )
      ELSE jsonb_set(base.sj, '{projectRecords}', jsonb_build_array(lerony_patch.patch), true)
    END AS next_sj
  FROM base
  CROSS JOIN lerony_patch
)
UPDATE public.site_settings AS s
SET
  settings_json = merged.next_sj,
  updated_at = now()
FROM merged
WHERE s.id = merged.id;

COMMENT ON COLUMN public.site_settings.settings_json IS
  'JSON bag for public site content. LERONY projectRecords entry positioned as technology & innovation (2026-09-19).';
