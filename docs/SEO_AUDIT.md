# SEO Audit — princeparfait.com

Last verified locally: 13 September 2026  
Canonical host: `https://www.princeparfait.com`  
Factual source of truth: `docs/PORTFOLIO_CONTEXT.md`

Public identity implemented in this repository: **Founder · Entrepreneur · Technologist · Software Engineer · AI Builder**. The August 2026 production fetch below is historical. It is not the copy this codebase now emits.

This document records what was implemented, what was **verified in the local production build / dev output**, and what is **not solved until production is deployed and re-crawled**.

**The live site at https://www.princeparfait.com/ is still the old implementation.** A fetch of production on this date returned title `Prince Parfait GANZA (PPG) — Software Engineer & AI Builder Rwanda`, canonical `https://princeparfait.com` (non-www), and AgriVoice still in the HTML. Google cannot see these corrections until this branch is deployed.

---

## 1. Implemented changes

### Legacy content removal

- Public copy, JSON-LD, Open Graph, sitemap, robots, and manifests no longer contain AgriVoice, TUT Labs, University of Rwanda, “15+ projects”, “3 companies”, invented articles, invented speaking events, or invented testimonials.
- Skills lists no longer include unsupported LangChain / AWS / Docker / Prisma / fine-tuning claims.
- Public pages no longer hydrate `localStorage` CMS caches (`ppg_projects_list`, `ppg_blog_posts`, `ppg_site_settings`). That path could have reintroduced old dashboard/CMS copy into case studies and the hero.
- Supabase migration `06_clear_fabricated_announcement.sql` clears TUT Labs announcement text. Migration `03` default announcement is now empty.
- `/blog` is an empty state with `noindex, follow`. No Article/BlogPosting schema is emitted.
- `/feed.xml` is empty RSS with `X-Robots-Tag: noindex, follow`.
- Removed URLs (`/projects/agrivoice`, `/projects/tut-labs`, invented blog slugs) return **404**, not homepage redirects.
- `/projects/caritas-portal` → `/projects/caritas-systems` (301 in `next.config.ts`).

Mentions of those fabricated terms that remain are **internal “do not invent” instructions** in `docs/PORTFOLIO_CONTEXT.md` and the cleanup migration. They are not public UI.

### Entity and structured data

| Node | Permanent `@id` |
|------|-----------------|
| Person | `https://www.princeparfait.com/#person` |
| Person image | `https://www.princeparfait.com/#person-image` |
| WebSite | `https://www.princeparfait.com/#website` |
| LERONY Ltd | `https://lerony.com/#organization` |

- One Person object in the root layout; inner pages **reference** `#person` instead of cloning a second Person.
- LERONY is a separate Organization (`url: https://lerony.com`, `founder` → `#person`). Person `worksFor` → LERONY. princeparfait.com is not modelled as LERONY’s website.
- WebSite (`name: Prince Parfait GANZA`, `alternateName: Prince Parfait`, `publisher` → `#person`) is in the shared identity graph.
- `/about` is a ProfilePage with `mainEntity` → `#person`.
- Indexable pages have WebPage (or ProfilePage / CollectionPage / ContactPage) with `isPartOf` `#website` and `about` `#person`.
- Visible breadcrumbs + BreadcrumbList on internal pages and case studies.
- Case studies use CreativeWork. AskField uses `contributor`, not `creator`.
- `sameAs` on Person: LinkedIn, GitHub, X, YouTube, Instagram (listed as existing public profiles in PORTFOLIO_CONTEXT). WhatsApp is **not** in JSON-LD (the URL contains a phone number).
- No Wikipedia/Wikidata, birth date, telephone, or street address in JSON-LD.
- `dateModified` on WebPage/ProfilePage is `2026-08-28` (`SITE_CONTENT_REVISED`), not deploy time.

### Metadata, indexing, assets

- Unique titles and descriptions on indexable routes (see tables below).
- Self-canonical tags on indexable pages, all on **www**.
- Host redirects: middleware + `vercel.json` send `princeparfait.com` → `www.princeparfait.com` (301). Vercel also handles http → https.
- Sitemap includes only canonical indexable URLs. `/blog` is excluded. `lastmod` is the content revision date, not “now”.
- `robots.txt` allows `/`, disallows `/api/`, `/dashboard/`, `/admin/`, and points at the www sitemap. It does **not** block `/_next/`, CSS, JS, or public images.
- Default social image: `/images/og/prince-parfait-ganza.jpg` (1200×630, ~72 KB).
- Canonical portrait: `/images/profile/prince-parfait-ganza-kigali-rwanda.webp` (~132 KB, `alt="Prince Parfait GANZA"`), used with `next/image` + `priority` on the homepage LCP photo.
- Search Console / Bing verification hooks: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION` via Next metadata. No tokens hardcoded in components.
- `/dashboard` and `/api/*` send `X-Robots-Tag: noindex, nofollow`.

### Accessibility / IA (this pass)

- One primary `h1` per public page (verified in the crawl).
- `header` / `nav` / `main` / `footer`, skip link, `:focus-visible`.
- Internal links: Home → Work / Contact / Experience; About → Experience / Work / Contact; Experience → related case studies; Services → Work / Contact; case studies → related work; footer includes Insights and Speaking without stuffing.

---

## 2. Canonical URL map

Host convention: **https://www.princeparfait.com** (no trailing slash except the homepage sitemap loc, which uses `/`).

Next.js currently serializes the homepage HTML canonical **without** a trailing slash (`https://www.princeparfait.com`). The sitemap loc is `https://www.princeparfait.com/`. Google treats these as the same homepage URL. Do not mix www and non-www.

| Route | Canonical | Index |
|-------|-----------|--------|
| `/` | `https://www.princeparfait.com` | index |
| `/about` | `https://www.princeparfait.com/about` | index |
| `/projects` | `https://www.princeparfait.com/projects` | index |
| `/projects/lerony` | `https://www.princeparfait.com/projects/lerony` | index |
| `/projects/caritas-systems` | `https://www.princeparfait.com/projects/caritas-systems` | index |
| `/projects/stockpro` | `https://www.princeparfait.com/projects/stockpro` | index |
| `/projects/psta-accounting` | `https://www.princeparfait.com/projects/psta-accounting` | index |
| `/projects/caritas-website` | `https://www.princeparfait.com/projects/caritas-website` | index |
| `/projects/askfield` | `https://www.princeparfait.com/projects/askfield` | index |
| `/projects/gotallnews` | `https://www.princeparfait.com/projects/gotallnews` | index |
| `/experience` | `https://www.princeparfait.com/experience` | index |
| `/services` | `https://www.princeparfait.com/services` | index |
| `/contact` | `https://www.princeparfait.com/contact` | index |
| `/speaking` | `https://www.princeparfait.com/speaking` | index (thin but verified Eshuri training) |
| `/blog` | `https://www.princeparfait.com/blog` | **noindex** |
| `/blog/*` (no real posts) | n/a | **404 + noindex** |
| `/feed.xml` | n/a | **noindex** |
| `/dashboard`, `/dashboard/*` | n/a | **noindex, nofollow** |
| `/api/*` | n/a | **noindex, nofollow** |

---

## 3. Schema graph

```
WebSite #website
  publisher → Person #person
  url = https://www.princeparfait.com/

Person #person
  name = Prince Parfait GANZA
  url = https://www.princeparfait.com/
  image → ImageObject #person-image
  worksFor → Organization #organization (lerony.com)
  homeLocation = Kigali, Rwanda
  sameAs = LinkedIn, GitHub, X, YouTube, Instagram

Organization https://lerony.com/#organization
  name = LERONY Ltd
  url = https://lerony.com
  founder → Person #person

ProfilePage /about#webpage
  mainEntity → #person
  isPartOf → #website

WebPage (each indexable URL)#webpage
  isPartOf → #website
  about → #person

CreativeWork /projects/{id}#work
  creator or contributor → #person
  matches visible case-study copy

BreadcrumbList (internal pages)
  Home > … matching the visible trail
```

JSON-LD on the homepage (parsed locally) contained Person, Organization, WebSite, WebPage. No duplicate Person object. AskField CreativeWork used `contributor` only.

---

## 4. Titles and descriptions (verified locally)

| Page | Title | Description unique? |
|------|--------|---------------------|
| Home | Prince Parfait GANZA \| Founder, Entrepreneur & Technologist | Implemented identity |
| About | About Prince Parfait GANZA \| Founder, Entrepreneur & Technologist | Implemented |
| Work | Projects & Case Studies \| Prince Parfait GANZA | Yes |
| Experience | Experience \| Prince Parfait GANZA | Yes |
| Ventures | Ventures \| Prince Parfait GANZA | Implemented |
| Capabilities | Capabilities \| Prince Parfait GANZA | Secondary page |
| Contact | Contact Prince Parfait GANZA | Yes |
| Work | Projects & Case Studies \| Prince Parfait GANZA | Yes |
| Experience | Experience \| Prince Parfait GANZA | Yes |
| Services | Software Development Services \| Prince Parfait GANZA | Yes |
| Contact | Contact Prince Parfait GANZA | Yes |
| Speaking | Speaking and training \| Prince Parfait GANZA | Yes |
| Insights | Insights \| Prince Parfait GANZA | Yes, and noindex |
| Case study example | Caritas Rwanda Information Systems \| Case study | Uses visible project description |

OG title/description/url/image and Twitter summary_large_image were present on the crawled indexable pages.

---

## 5. Redirects and removed URLs

| From | To / status | Why |
|------|-------------|-----|
| `http://` | `https://` | Platform (Vercel) |
| `princeparfait.com/*` | `www.princeparfait.com/*` | 301, middleware + `vercel.json` |
| `/projects/caritas-portal` | `/projects/caritas-systems` | 301, old slug |
| `/projects/agrivoice` | **404** | Fabricated; do not 301 to home |
| `/projects/tut-labs` | **404** | Fabricated |
| Invented `/blog/{slug}` | **404** | No articles |

Local Next.js previously returned **308** for `permanent: true` redirects. Config now uses `statusCode: 301`. Re-check after the next server start / deploy.

---

## 6. Validation run (this environment)

| Check | Result |
|-------|--------|
| TypeScript (`npx tsc --noEmit` and `next build`) | Passed |
| `yarn lint` (whole repo) | **Fails** — 27 pre-existing errors, mostly `react-hooks/set-state-in-effect` in older UI widgets. SEO-touched files: 0 errors |
| Production build | Passed (32 static pages) |
| Public route crawl (localhost) | See status table above; indexable routes 200 |
| Canonical tags | www on all crawled indexable pages |
| robots meta | indexable = `index, follow`; `/blog` = `noindex, follow`; 404 = `noindex` |
| sitemap.xml | Only indexable URLs; no `/blog`; lastmod 2026-08-28 |
| robots.txt | Allow `/`; sitemap www; `/_next/` not disallowed |
| JSON-LD syntax | Parsed on crawled pages; no parse errors |
| Fabricated-term HTML sweep | Clean on all listed public routes |
| Portrait crawlable | `200` on `/images/profile/prince-parfait-ganza-kigali-rwanda.webp` |
| Phone in JSON-LD | Not present |
| Google Rich Results Test | **Not run against production** — production is still the old site |
| Schema.org Validator | **Not run against production** — local graph parsed only |
| Live www.princeparfait.com | **Still old content** (PPG, AgriVoice, non-www canonical) |
| Mobile layout | Not browser-verified in this pass (dev server was running; no visual QA session) |
| Core Web Vitals on production | **Not measured** — cannot be claimed from code alone |

---

## 7. Remaining verification tasks (do not treat as done)

1. **Deploy this branch** to Vercel. Until then, Google still has the fabricated site.
2. After deploy, confirm in a browser (not only code):
   - `http://princeparfait.com` → `https://www.princeparfait.com/` in one hop
   - `https://princeparfait.com/about` → `https://www.princeparfait.com/about`
   - no redirect chain
3. Paste production URLs into [Google Rich Results Test](https://search.google.com/test/rich-results) (Person / ProfilePage / BreadcrumbList).
4. Paste the same HTML into the [Schema.org validator](https://validator.schema.org/).
5. Set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` and `NEXT_PUBLIC_BING_SITE_VERIFICATION` in Vercel env, redeploy, confirm the meta tags appear.
6. Lighthouse / CrUX on production for LCP (hero WebP), CLS, INP. `favicon.svg` is still ~956 KB — leftover performance debt.
7. Next.js 16 build warns that `middleware.ts` is deprecated in favour of `proxy`. Host redirects also live in `vercel.json`; migrate when touching that file next.
8. Dashboard authentication is client-side only and is **not** a security boundary. `robots.txt` + `noindex` are not access control. Harden before treating `/dashboard` as private.
9. Optional: return **410 Gone** (instead of 404) for fabricated URLs after they drop from the index.
10. Visual QA of mobile layout on the deployed site.

---

## 8. Search Console actions (after deploy)

Do these in Google Search Console for the **www** property (add the property if only non-www exists today).

1. Confirm the preferred property is `https://www.princeparfait.com/`.
2. Submit `https://www.princeparfait.com/sitemap.xml`.
3. URL Inspection → Request indexing for:
   - `https://www.princeparfait.com/`
   - `https://www.princeparfait.com/about`
   - `https://www.princeparfait.com/projects`
   - `https://www.princeparfait.com/experience`
   - `https://www.princeparfait.com/contact`
   - important case studies (`caritas-systems`, `lerony`, `psta-accounting`)
4. Removals / “Clear cached URL” for fabricated URLs still in results, for example:
   - any AgriVoice / TUT Labs project URLs
   - invented blog posts
   - URLs that still show “PPG”, “15+ projects”, or University of Rwanda
   Use temporary removals plus the 404s — do **not** 301 those URLs to the homepage.
5. If the Search appearance still shows the old site name (“PPG…”), the new WebSite `name` + homepage title need a recrawl; this is not instant.
6. Repeat equivalent steps in Bing Webmaster Tools.

---

## 9. Facts that need Prince’s confirmation

- Keep `/speaking` indexable on the strength of the Eshuri Learning training record, or mark it `noindex` until more verified engagements exist.
- Footer still links TikTok, Threads, Luma, and Buy Me a Coffee. They are **not** in Person `sameAs`. Confirm they should stay in the UI.
- WhatsApp (`wa.me` with the business number) remains in the public header/footer as a contact channel per PORTFOLIO_CONTEXT. It is excluded from JSON-LD. Confirm that remains intended.
- X / YouTube / Instagram are in `sameAs` because PORTFOLIO_CONTEXT lists them as existing public profiles. Confirm they should stay in the knowledge-graph `sameAs` set.
- No dedicated 1200×630 image per case study yet (shared default OG card). Add unique cards only when real screenshots exist.
- Education, AskField “selected engagement”, and Eshuri “approximately 85 trainees” are already written cautiously. Do not add dates or titles beyond PORTFOLIO_CONTEXT.

---

## 10. What this audit does **not** claim

- It does not claim Google has dropped AgriVoice, PPG, or the old descriptions.
- It does not claim Rich Results or Schema.org validator “pass” on production.
- It does not claim Core Web Vitals are green.
- It does not claim `/dashboard` is secure because it is noindexed.

The local build is aligned with PORTFOLIO_CONTEXT. Production indexing will only follow a deploy, a consistent www canonical, and Search Console recrawl requests.
