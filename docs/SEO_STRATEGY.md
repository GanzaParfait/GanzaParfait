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

Homepage canonical is `https://www.princeparfait.com/` (trailing slash). Other pages have no trailing slash.

---

## Primary entity

Permanent Person `@id`:

`https://www.princeparfait.com/#person`

Associated, separate entity:

- LERONY Ltd — `https://lerony.com/#organization`

Do not make princeparfait.com the Organization website for LERONY.

Do not keyword-stuff "PPG" into titles, descriptions, manifests, or JSON-LD.

---

## Page titles

Unique, natural, not a role list:

| Page | Title |
|------|--------|
| Home | Prince Parfait GANZA \| Founder & Software Engineer |
| About | About Prince Parfait GANZA \| Software Engineer in Rwanda |
| Work | Projects & Case Studies \| Prince Parfait GANZA |
| Experience | Experience \| Prince Parfait GANZA |
| Services | Software Development Services \| Prince Parfait GANZA |
| Contact | Contact Prince Parfait GANZA |

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
| `/`, `/about`, `/projects`, `/experience`, `/services`, `/contact`, `/speaking`, `/projects/*` | index |
| `/blog` empty state | **noindex** |
| `/dashboard/*`, `/api/*` | **noindex** |
| Removed fabricated URLs | **404** (not homepage redirects) |

`/robots.txt` must not block `/_next/`, CSS, JS, or public images.

---

## Open Graph

Default image: `/images/og/prince-parfait-ganza.jpg` (1200×630)

Portrait: `/images/profile/prince-parfait-ganza-kigali-rwanda.webp`

Alt text for the portrait: `Prince Parfait GANZA`

---

## Verification

Use environment variables, not hardcoded tokens:

- `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
- `NEXT_PUBLIC_BING_SITE_VERIFICATION`
