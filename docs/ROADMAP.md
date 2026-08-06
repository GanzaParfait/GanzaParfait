# Roadmap

> The evolution plan for `princeparfait.dev` — from portfolio to digital headquarters.

---

## Version 1 — Foundation ✅ (Current)

**Goal:** Establish the authoritative digital identity for Prince Parfait GANZA.

### Completed
- [x] Homepage with hero, stats, skills, featured projects, blog preview
- [x] About page with timeline, values, and skills by category
- [x] Projects listing (featured + other)
- [x] Blog listing with featured posts and category filter
- [x] Individual blog post pages with JSON-LD schema
- [x] Services page with offerings and process
- [x] Speaking page with topics and past engagements
- [x] Contact page with accessible form
- [x] Custom 404 page
- [x] Dynamic sitemap.xml
- [x] robots.txt
- [x] Full PWA manifest + all favicon variants
- [x] JSON-LD structured data (Person, WebSite, ProfilePage, BlogPosting, ContactPage)
- [x] Open Graph + Twitter Card on all pages
- [x] Mobile-first responsive design
- [x] WCAG AA+ accessibility
- [x] Security headers
- [x] Brand assets integrated (logos, icons, favicons)
- [x] TypeScript throughout
- [x] Static generation for all pages

---

## Version 1.1 — Content & Engagement

**Goal:** Add real content publishing and audience capture.

### Planned
- [ ] MDX blog posts with syntax highlighting (Shiki or Prism)
- [ ] Reading time calculation from content
- [ ] Table of contents for long-form articles
- [ ] Related posts section
- [ ] Testimonials section (homepage + about)
- [ ] Downloadable résumé (PDF) in public folder
- [ ] Newsletter integration with Resend API
- [ ] Dark/Light theme toggle with `next-themes`
- [ ] Reading progress indicator on blog posts
- [ ] RSS feed (`/feed.xml`)

---

## Version 2 — Content Management & Discovery

**Goal:** Scale content and enable discoverability.

### Planned
- [ ] CMS integration (Contentlayer for MDX or Sanity for rich CMS)
- [ ] Product listings (Lerony products)
- [ ] Events / upcoming speaking calendar
- [ ] Site-wide search (Orama or Algolia)
- [ ] Image sitemap
- [ ] Case studies — detailed project deep-dives
- [ ] Video integration (YouTube embeds, talks)
- [ ] Analytics dashboard (Vercel Analytics + GA4)
- [ ] Structured data for Events, Products, VideoObjects

---

## Version 3 — Platform & Personalization

**Goal:** Transform the site into a full digital platform.

### Planned
- [ ] Client portal (auth with Clerk, project tracking)
- [ ] Admin panel for managing content
- [ ] AI chat assistant (OpenAI API)
- [ ] Multi-language support (English, Kinyarwanda, French)
- [ ] Buy Me a Coffee / Sponsorship integration
- [ ] Media Kit page with downloadable press assets
- [ ] Personalized recommendations (read next, similar projects)
- [ ] Weekly newsletter archives
- [ ] Email-gated premium content

---

## Principles Guiding Every Release

1. **Stability before features** — V1 must be rock-solid before adding V2 content.
2. **SEO first** — Every new page gets proper metadata, structured data, and canonical URLs.
3. **Performance maintained** — New features must not degrade Lighthouse scores below 95.
4. **Accessibility non-negotiable** — Every new component must be keyboard navigable and screen reader friendly.
5. **Content > code** — The best thing I can do for this site is write great articles and ship great projects.
6. **One source of truth** — All data lives in `src/data/site-data.ts`; no hardcoded content in components.

---

## Versioning Philosophy

| Version | Focus             | Audience              |
|---------|-------------------|-----------------------|
| 1.x     | Identity & credibility | Recruiters, clients, collaborators |
| 2.x     | Content & authority | Tech community, AI search |
| 3.x     | Platform & scale  | Repeat visitors, newsletter subscribers |

---

## Deprecation Policy

- Nothing is removed from the URL structure once published
- Old slugs get 301 redirects to new locations
- Archived projects remain visible with an "archived" badge