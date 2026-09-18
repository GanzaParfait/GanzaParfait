# Prince Parfait GANZA — Portfolio Repositioning Brief

**Document status:** Implemented (living identity reference)  
**Last aligned with codebase:** September 2026  
**Primary objective (achieved):** Reposition the portfolio from a narrow developer profile into a credible founder, entrepreneur, and technologist profile—without erasing software engineering capability.

This file is no longer an “implement from scratch” ticket. It is the **approved identity and messaging contract**, plus a record of what shipped versus what was consciously deferred. For day-to-day coding rules, use [`AGENTS.md`](AGENTS.md). For biography and facts, use [`docs/PORTFOLIO_CONTEXT.md`](docs/PORTFOLIO_CONTEXT.md).

---

## 1. Required public outcome

The site must present Prince Parfait GANZA as a multidimensional builder and leader. Technical skill supports a broader identity.

**Canonical identity**

> Founder · Entrepreneur · Technologist

**Canonical positioning**

> Building technology, products and ventures that turn ambitious ideas into real-world impact.

Within about ten seconds, a visitor should understand:

1. **Who:** Prince Parfait GANZA  
2. **How to read him:** Founder · Entrepreneur · Technologist  
3. **What he does:** Builds technology, products, and ventures  
4. **Why it matters:** Real-world impact  
5. **Proof:** Ventures, client systems, products, leadership, delivery, training, verified outcomes  

Do not imply that he is *only* a software engineer, freelancer, coder, or AI integrator. Those remain important **capability** and **evidence** layers.

---

## 2. Messaging system (still mandatory)

### 2.1 Name

Use **Prince Parfait GANZA** in high-authority contexts (titles, schema, headings, social). Do not use **PPG** as a public brand.

### 2.2 Role line

> Founder · Entrepreneur · Technologist

Middle dots, stable wording. Do not lead global chrome with “Software Engineer.”

### 2.3 Positioning line

Use the canonical sentence above. Do not casually rewrite high-visibility surfaces into developer-only lines such as “Building software that creates impact.”

### 2.4 Short biography (approved shape)

> Prince Parfait GANZA is a Rwandan founder, entrepreneur and technologist based in Kigali. He leads Lerony and works across technology, digital products and ventures that help organizations and ambitious ideas become reliable real-world solutions. His background combines software engineering, product delivery, data systems, client collaboration and technical training.

### 2.5 Compact biography

> Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.

### 2.6 Preferred CTAs

| Role | Label |
|------|--------|
| Primary | View selected work |
| Secondary | About me |
| Contact | Let's talk |

Canonical copy sources in code: `src/data/site-data.ts` (`identity`, `siteConfig`). Prefer reuse over new variants.

---

## 3. Context-sensitive wording rules

| Pattern | Action | Exception |
| --- | --- | --- |
| “Software Engineer” as global identity | Replace with Founder · Entrepreneur · Technologist | Keep for accurate employment titles or technical-role labels |
| “Building software that creates impact” | Use canonical positioning | Case studies may discuss software specifically |
| Full-stack / AI as whole-site identity | Demote from hero/global SEO | Fine in services, skills, project roles |
| “Developer portfolio” in metadata | Rewrite to founder/technologist framing | Historical education/job facts stay |
| Founder of Lerony | Prefer Founder & CEO where referring to LERONY Ltd | Do not invent CEO titles elsewhere |

**Layers**

1. **Identity** — Founder · Entrepreneur · Technologist  
2. **Positioning** — technology, products, ventures, impact  
3. **Capability** — software engineering, product, systems, data, AI, consulting, training  
4. **Evidence** — projects, roles, case studies, outcomes  

---

## 4. Information architecture (current, approved)

Primary navigation (shipped):

> **About · Work · Experience · Services · Contact**

| Decision | Status |
| --- | --- |
| Services in primary nav | **Kept** — real capabilities page at `/services` |
| Dedicated Ventures page | **Not restored** — LERONY lives in About / Experience + lerony.com |
| Insights / Blog in primary nav | **Footer** until verified articles exist |
| CV | Public `/cv` with gated access flow |
| Dashboard | Private `/dashboard` (`noindex`) |

Do not add a Ventures nav item with an empty destination.

Homepage narrative (implemented shape): hero → manifesto / selected work → knowledge → journey → principles → speaking → booking / contact invitation. Exact section copy is editable from the dashboard homepage editor.

---

## 5. Hero & visual intent (still the bar)

- Name is the dominant signal; role and positioning follow.  
- Portrait remains a strong anchor; at most one purposeful context card (e.g. Founder & CEO · LERONY · Kigali).  
- Restrained technical atmosphere (grid/dots/geometry)—no generic AI glow, holograms, or dashboard-card clutter.  
- Light and dark themes supported; respect `prefers-reduced-motion`.  
- Multiple hero layouts exist (dashboard → Banners & Hero); each layout keeps its own copy where configured.

---

## 6. SEO & machine-readable identity (implemented baseline)

| Surface | Expectation |
| --- | --- |
| Canonical host | `https://www.princeparfait.com` (www, HTTPS) |
| Homepage canonical | No trailing slash (aligned with Next defaults + sitemap) |
| Apex / HTTP | Permanent redirect to www |
| Title pattern | `Prince Parfait GANZA \| Founder, Entrepreneur & Technologist` |
| Default OG | `/images/og/seo-share-image.jpg` (person card); `/og-image.png` kept in sync |
| Person image | Stable portrait path in JSON-LD (`PORTRAIT_PATH` in `src/lib/schema.ts`) |
| Sitemap | `/sitemap.xml` + `/image-sitemap.xml` |
| Robots | Disallow `/dashboard`, `/api/`, `/admin`, `/email-preview` |
| Services `?focus=` | Canonical `/services`; focused query variants `noindex,follow` |

Ongoing SEO notes: [`docs/SEO_STRATEGY.md`](docs/SEO_STRATEGY.md). Google Search Console validation is an operator task after deploy—not a code checkbox alone.

---

## 7. What was implemented (summary)

Completed against the original brief:

- [x] Global identity and positioning across public chrome, metadata, and schema  
- [x] Hero system with multiple layouts + dashboard editing  
- [x] Homepage journey sections with dashboard content/style controls  
- [x] Work / projects case studies with verified copy rules  
- [x] About, Experience, Services, Contact, CV  
- [x] Structured data graph (Person, WebSite, WebPage, breadcrumbs, ItemLists, CreativeWork where used)  
- [x] Open Graph / Twitter cards, PWA icons/manifest, image sitemap  
- [x] Dark/light theme with adaptive `theme-color`  
- [x] Private control center (analytics, content, media, messages, settings)  
- [x] Apex→www redirects (middleware + Vercel)  
- [x] Documentation map under `docs/` + agent rules in `AGENTS.md`  

Intentionally **not** done (do not re-open without an explicit request):

- Dedicated public **Ventures** route replacing Services in primary nav  
- Treating this personal site as the LERONY corporate site  
- Publishing every fact in `PORTFOLIO_CONTEXT.md` on the public site  
- Invented metrics, testimonials, or incomplete-degree claims  

---

## 8. Boundaries (unchanged)

- Do not rebuild from scratch without a real architectural need.  
- Do not turn the portfolio into a generic SaaS landing page or Lerony.com.  
- Do not erase the software engineering background.  
- Do not fabricate clients, awards, revenue, partnerships, or impact.  
- Do not blind-replace every “Software Engineer” string.  
- Do not edit `.next`, dependency caches, or commit secrets.  
- Do not claim “fully done” without build/lint and a quick responsive check when the change is UI-facing.

---

## 9. How agents should use this file now

1. Read this for **identity, messaging, and IA decisions**.  
2. Read [`docs/PORTFOLIO_CONTEXT.md`](docs/PORTFOLIO_CONTEXT.md) for **facts**.  
3. Read [`AGENTS.md`](AGENTS.md) for **how to change the repo**.  
4. Read the relevant `docs/*` guide for the surface you are editing.  
5. Implement in the application; keep docs accurate; never invent biography.

If a future change conflicts with Section 4 (nav / Ventures), stop and ask—do not silently restore a Ventures page.

---

## 10. Final decision summary

> **Prince Parfait GANZA**  
> **Founder · Entrepreneur · Technologist**  
> **Building technology, products and ventures that turn ambitious ideas into real-world impact.**

Software engineering remains a major source of credibility. It serves the larger story of someone who founds, leads, builds, delivers, and turns ideas into working products and ventures.
