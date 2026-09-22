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

## Page titles

Unique, natural, and discovery-oriented — name plus verified roles and place:

| Page | Title |
|------|--------|
| Home | Prince Parfait GANZA \| Founder, Software Engineer & AI Builder in Kigali |
| About | About Prince Parfait GANZA \| Software Engineer & AI Builder in Kigali |
| Work | Work & Case Studies \| Software Engineer in Kigali — Prince Parfait GANZA |
| Experience | Experience \| Software Engineer & AI Builder in Kigali — Prince Parfait GANZA |
| Services | Services & Capabilities \| Software Engineer & AI Builder in Kigali — Prince Parfait GANZA |
| Contact | Contact Prince Parfait GANZA \| Software Engineer & AI Builder Kigali |

---

## Discovery keywords (not exact-name only)

Target collocated, verified phrases so the site can surface for role + place queries — not only “Prince Parfait”. Keep phrases factual; do not invent credentials.

**Core clusters**

- Software engineer Kigali / Software engineer Rwanda
- AI builder Kigali / AI builder Rwanda
- Tech founder Kigali / Technology entrepreneur Rwanda
- LERONY founder / Founder LERONY Ltd / LERONY Ltd CEO
- Rwandan technologist / Technologist Kigali
- Software engineer and AI builder Kigali
- Digital products Kigali / Business systems Rwanda / Technology consulting Kigali

**Where they live**

- `siteConfig.keywords` and per-page `keywords` in metadata
- Meta titles and descriptions (home, about, experience, work, contact, services)
- Person / WebSite JSON-LD (`jobTitle`, `knowsAbout`, `hasOccupation` with Kigali, image caption)
- Portrait `alt` text (`siteConfig.portraitAlt` / `heroPortraitAlt`) — crawlers cannot read text in images
- Visible role line and bio on the hero (not only the H1 name)

Do not keyword-stuff body copy. Prefer natural sentences that already match the public biography.

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

Default image: `/images/og/seo-share-image.jpg` (1200×630).

The artwork is fitted inside that frame so the name, portrait, and corner marks are not cropped. JPEG is the share format because Facebook, LinkedIn, X, WhatsApp, Slack, and iMessage read `og:image`. Declare width, height, and `image/jpeg`.

Portrait: `/images/profile/prince-parfait-ganza-kigali-rwanda.webp`

Alt text for the portrait: `Prince Parfait GANZA — Rwandan founder, entrepreneur, technologist, software engineer and AI builder based in Kigali, Rwanda`

---

## Verification

Use environment variables, not hardcoded tokens:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`
