# SEO Strategy

Entity, metadata, and structured data rules for https://www.princeparfait.com/

The goal is to make this site the canonical public source for **Prince Parfait GANZA** — not to game rankings.

---

## Canonical host

**https://www.princeparfait.com/**

Google already associates this identity with the www host. Keep it.

- `http` → `https`
- `princeparfait.com` → `www.princeparfait.com`
- JSON-LD `@id`, sitemap, canonical tags, and Open Graph URLs all use www
- Do not mix hosts

Homepage canonical is `https://www.princeparfait.com` (no trailing slash — matches Next.js defaults). Other pages also have no trailing slash.

---

## Primary entity

Permanent Person `@id`:

`https://www.princeparfait.com/#person`

Associated, separate entity:

- LERONY Ltd — `https://lerony.com/#organization`

Do not make princeparfait.com the Organization website for LERONY.

Do not keyword-stuff "PPG" into titles, descriptions, or the public interface.

Search engines may still need the abbreviation to resolve to this person. `PPG` appears once, as a Person `alternateName` only. It is not a public brand, not a page title, and not repeated across keywords.

Birth date is not in the verified record. Do not invent `birthDate` in schema.

---

## Identity hierarchy (for SEO and UI)

Keep one clean public line. Do not dump every skill into the headline.

| Layer | Public form |
|-------|-------------|
| Profession | Software Engineer |
| Career direction | Technology Entrepreneur |
| Company role | Founder & CEO, LERONY Ltd |

Capability pillars (visible on About / Services / Work — not as equal titles):

1. Software Engineering & Digital Systems  
2. Research Technology & Digital Data Collection  
3. Data Systems, Analytics & Decision Support  

Tools (React, PHP, MySQL, …) stay in case studies and secondary tech lists.

---

## Page titles

Unique, natural, and discovery-oriented — name plus verified roles and place:

| Page | Title |
|------|--------|
| Home | Prince Parfait GANZA \| Software Engineer & Technology Entrepreneur in Kigali |
| About | About Prince Parfait GANZA \| Software Engineer & Technology Entrepreneur in Kigali |
| Work | Work & Case Studies \| Software Engineer in Kigali — Prince Parfait GANZA |
| Experience | Experience \| Software Engineer & Technology Entrepreneur in Kigali — Prince Parfait GANZA |
| Services | Services & Capabilities \| Software Engineer & Technology Entrepreneur — Prince Parfait GANZA |
| Contact | Contact Prince Parfait GANZA \| Software Engineer & Technology Entrepreneur Kigali |

---

## Discovery keywords (not exact-name only)

Target collocated, verified phrases so the site can surface for role + place + domain queries — not only “Prince Parfait”. Keep phrases factual; do not invent credentials.

**Core clusters**

- Software engineer Kigali / Software engineer Rwanda
- Technology entrepreneur Rwanda / Tech founder Kigali
- LERONY founder / Founder LERONY Ltd / LERONY Ltd CEO
- Research technology Rwanda / Digital data collection Kigali
- Survey platforms / Research data systems
- Data systems Kigali / Indicator management systems
- Business systems Rwanda / Organizational reporting

**Where they live**

- `siteConfig.keywords` and per-page `keywords` in metadata
- Meta titles and descriptions
- Person / WebSite JSON-LD (`jobTitle`, `knowsAbout`, `hasOccupation` with Kigali)
- Portrait `alt` text
- Visible role line and bio (not only the H1 name)
- Substantive Services copy + project case studies for research / data pillars

## Layers (do not flatten)

| Layer | Example |
|-------|---------|
| Identity | Software Engineer · Technology Entrepreneur · Founder |
| Company role | Founder & CEO, LERONY Ltd |
| Specialization | Research Technology & Digital Data Collection |
| Capability | Survey programming, field operations, indicator reporting |
| Technology / method | XLSForm, CAPI, React, SQL |

Evidence: AskField → research technology; CRNIS (Caritas) → data systems / decision support; broader portfolio → software engineering.

**LinkedIn headline (approved)**

`Software Engineer & Technology Entrepreneur | Research Technology & Data Systems | Founder & CEO, LERONY Ltd`

Tools and methods belong in About / Experience / Projects / Skills — not in the headline.

---

## Structured data

| Type | Where | Notes |
|------|--------|-------|
| Person + Organization | Root layout | Shared `@id` graph |
| WebSite | Homepage only | Site name signal |
| WebPage | Each indexable page | `isPartOf` `#website`, `about` `#person` |
| ProfilePage | `/about` | `mainEntity` `#person` |
| BreadcrumbList | Internal pages | Matches visible trail |
| ItemList | `/projects` | Visible work list |
| CreativeWork | Case studies | `creator` or `contributor` |
| BlogPosting | Only real articles | Author → `#person` |

Do not emit Article/BlogPosting for empty insights.

FAQ schema is allowed only when the questions are visible on the page.

---

## Indexing

| Route | Index |
|-------|--------|
| `/`, `/about`, `/projects`, `/experience`, `/services`, `/contact`, `/projects/*` | index |
| `/blog` empty state | **noindex** |
| `/dashboard/*`, `/api/*` | **noindex** |
| Removed fabricated URLs | **404** (not homepage redirects) |

`/robots.txt` must not block `/_next/`, CSS, JS, or public images.

---

## Open Graph

Default share image: `/images/og/seo-share-image.jpg` (1200×630).

**Canonical Person portrait (entity / Lens consistency)**

| File | Role |
|------|------|
| `/images/profile/prince-parfait-ganza.jpg` | Primary Person `image` URL |
| `/images/profile/prince-parfait-ganza-1x1.jpg` | 1:1 (1200×1200) |
| `/images/profile/prince-parfait-ganza-4x3.jpg` | 4:3 (1200×900) |
| `/images/profile/prince-parfait-ganza-16x9.jpg` | 16:9 (1600×900) |
| `/images/profile/prince-parfait-ganza.webp` | Visible About/Contact display twin |

Permanent filenames — never hashed CMS URLs in Person JSON-LD.

Person `@id`: `https://www.princeparfait.com/#person`

Alt text: `Prince Parfait GANZA — Software Engineer and Founder of LERONY Ltd`

Hero layout art (split/centered/cinematic) may differ visually; they must not replace the Person image URL in structured data.

Portrait: listed in `/image-sitemap.xml` against `/about` and `/`.

Do not invent profiles in `sameAs`. Keep only verified LinkedIn, GitHub, X, YouTube, Instagram.

---

## Verification

Use environment variables, not hardcoded tokens:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`
