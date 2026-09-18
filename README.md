<div align="center">

<img src="public/brand/logos/logo-horizontal-blue.webp" alt="Prince Parfait GANZA" width="360" />

<br />
<br />

# princeparfait.com

**Official personal portfolio of Prince Parfait GANZA**

Founder · Entrepreneur · Technologist

[Website](https://www.princeparfait.com) · [LinkedIn](https://www.linkedin.com/in/prince-parfait-ganza) · [GitHub](https://github.com/GanzaParfait)

</div>

---

## About

This repository is the source for **[www.princeparfait.com](https://www.princeparfait.com)** — the personal website of **Prince Parfait GANZA**, a Rwandan founder, entrepreneur and technologist based in Kigali.

The site presents a founder-led identity. Software engineering, product delivery, systems work, and AI building are evidence — not the ceiling.

> Building technology, products and ventures that turn ambitious ideas into real-world impact.

He is also Founder & CEO of **[LERONY Ltd](https://lerony.com)**. This personal site is not lerony.com.

## Purpose

- Clear professional identity for search, social, and people who land cold
- Verified projects, experience, and services — no invented metrics
- Contact paths for ventures, products, systems, speaking, and collaboration
- Consistent canonical host, metadata, and structured data for Google and AI systems
- Private dashboard for content and analytics (not public)

## Public site map

Primary navigation:

| Route | Job |
|-------|-----|
| `/` | Who, what, where, proof, action |
| `/about` | Story, principles, context |
| `/projects` | Selected work and case studies |
| `/experience` | Timeline and roles |
| `/services` | How Prince helps clients and organizations |
| `/contact` | Start a conversation |

Also public:

| Route | Notes |
|-------|--------|
| `/cv` | CV / résumé access flow |
| `/blog` | Insights (footer until verified articles exist) |

There is **no** dedicated public Ventures page. LERONY appears in About / Experience with a link to lerony.com.

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Motion | Framer Motion (respects reduced motion) |
| Data | Supabase + local/settings fallbacks |
| Media | Cloudinary (where configured) |
| Email | SMTP (Namecheap / Nodemailer) |
| Hosting | Vercel |
| Analytics | First-party page-view metrics in the dashboard |

Package manager: **Yarn** (`packageManager` in `package.json`).

## Control center

Authenticated area at `/dashboard` (cookie-gated, `noindex`):

- Analytics (sessions, sources, geo, export / reset)
- Hero layouts & banners, homepage sections
- Projects, CV, media library, blog articles
- Messages, subscribers, site settings

Do not expose secrets, service-role keys, or private lead data in the public README or client bundles.

## SEO & canonical host

- **Canonical:** `https://www.princeparfait.com` (www, HTTPS, no homepage trailing slash)
- Apex `princeparfait.com` and `http` permanently redirect to www
- Sitemap: `/sitemap.xml` · Image sitemap: `/image-sitemap.xml` · Robots: `/robots.ts`
- Default share image: `/images/og/seo-share-image.jpg` (person card); legacy `/og-image.png` kept in sync
- Person portrait for Google: `/images/profile/prince-parfait-ganza-kigali-rwanda.webp`

Details: [`docs/SEO_STRATEGY.md`](docs/SEO_STRATEGY.md).

## Documentation map

| File | Purpose |
|------|---------|
| [`docs/PORTFOLIO_CONTEXT.md`](docs/PORTFOLIO_CONTEXT.md) | Biography & facts (source of truth) |
| [`docs/CONTENT_STRATEGY.md`](docs/CONTENT_STRATEGY.md) | Voice, IA, page jobs |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | Visual & motion rules |
| [`docs/SEO_STRATEGY.md`](docs/SEO_STRATEGY.md) | Entity, metadata, structured data |
| [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | Stack rationale |
| [`AGENTS.md`](AGENTS.md) | How coding agents should work |
| [`PRINCE_PARFAIT_PORTFOLIO_REPOSITIONING_IMPLEMENTATION_BRIEF.md`](PRINCE_PARFAIT_PORTFOLIO_REPOSITIONING_IMPLEMENTATION_BRIEF.md) | Completed repositioning brief (identity rules + status) |

## Development

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
yarn build
yarn start
yarn lint
```

Environment variables are private. Copy from your secure store / Vercel project settings — never commit `.env` files with secrets.

SQL migrations: `supabase/migrations/<YYYY-MM-DD_HHMMSS>/<name>.sql`.

## Content accuracy

Publish only verified information. Do not invent clients, results, statistics, titles, awards, partnerships, testimonials, qualifications, media coverage, or dates.

Do not use **PPG** as a public brand abbreviation. Do not claim the ULK Computer Science degree is complete.

## Brand

| | |
|--|--|
| Name | Prince Parfait GANZA |
| Domain | www.princeparfait.com |
| Location | Kigali, Rwanda |
| Direction | Blue, clean, modern, human |
| Role line | Founder · Entrepreneur · Technologist |

---

<div align="center">

Building technology, products and ventures that turn ambitious ideas into real-world impact.

© Prince Parfait GANZA

</div>
