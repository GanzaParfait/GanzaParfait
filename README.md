<div align="center">

<img src="public/brand/logos/logo-horizontal-blue.png" alt="Prince Parfait GANZA" width="400" />

<br />
<br />

# princeparfait.com

**Personal website of Prince Parfait GANZA — Founder • Software Engineer • AI Builder • Speaker • Entrepreneur**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[🌐 Live Site](https://princeparfait.com) · [📬 Contact](https://princeparfait.com/contact) · [💼 LinkedIn](https://linkedin.com/in/ganza-prince-235816269) · [🐙 GitHub](https://github.com/GanzaParfait)

</div>

---

## Overview

This is the source code for **[princeparfait.com](https://princeparfait.com)** — a premium personal website built to feel more like a product than a traditional portfolio. It serves as the **digital headquarters** of Prince Parfait GANZA: founder, software engineer, AI builder, speaker, and entrepreneur.

The site is designed to evolve over many years — growing from a V1 portfolio into a full digital identity hub with a blog, product listings, speaking page, media kit, client portal, and more.

---

## ✨ Features

- **100/100 Lighthouse Score** — Performance, Accessibility, Best Practices, SEO
- **Mobile-First Design** — Fully responsive across all device sizes
- **Dark Theme** — Premium dark aesthetic with brand blue accents
- **Zero Runtime JS for Static Content** — Fully statically generated where possible
- **SEO Powerhouse** — JSON-LD structured data, sitemap, robots.txt, Open Graph, Twitter Card
- **PWA Ready** — Web App Manifest, service worker support, all favicon variants
- **Accessible** — WCAG AA+, semantic HTML, ARIA labels, keyboard navigation, skip links
- **Smooth Animations** — Intersection Observer-based scroll animations (respects `prefers-reduced-motion`)
- **Security Headers** — X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy
- **Type Safe** — 100% TypeScript with no `any` types

---

## 🏗️ Architecture

```
portfolio/
├── src/
│   ├── app/                   # App Router pages
│   │   ├── page.tsx           # Homepage
│   │   ├── about/             # About page
│   │   ├── projects/          # Projects listing
│   │   ├── blog/              # Blog listing + [slug]
│   │   ├── services/          # Services page
│   │   ├── speaking/          # Speaking engagements
│   │   ├── contact/           # Contact form
│   │   ├── sitemap.ts         # Dynamic sitemap
│   │   ├── robots.ts          # robots.txt
│   │   ├── layout.tsx         # Root layout (metadata, SEO)
│   │   ├── globals.css        # Design system + CSS tokens
│   │   └── not-found.tsx      # Custom 404
│   ├── components/
│   │   ├── layout/            # Navbar, Footer
│   │   └── ui/                # Reusable components
│   └── data/
│       └── site-data.ts       # Typed content data (single source of truth)
├── public/
│   ├── brand/                 # Logos, icons (all variants)
│   │   ├── logos/
│   │   └── icons/
│   ├── images/                # Profile, projects, blog
│   ├── favicon.ico            # Browser favicon
│   ├── favicon.svg            # SVG favicon
│   ├── favicon-96x96.png      # 96×96 PNG favicon
│   ├── apple-touch-icon.png   # iOS home screen icon
│   ├── web-app-manifest-192x192.png
│   ├── web-app-manifest-512x512.png
│   ├── site.webmanifest       # PWA manifest
│   └── browserconfig.xml      # Windows tiles
└── docs/                      # Strategy & documentation
    ├── BRAND_GUIDELINES.md
    ├── TECH_STACK.md
    ├── ROADMAP.md
    ├── DESIGN_SYSTEM.md
    ├── CONTENT_STRATEGY.md
    ├── DIGITAL_PRESENCE.md
    ├── ASSET_STRUCTURE.md
    └── SEO_STRATEGY.md
```

---

## 🛠️ Tech Stack

| Category       | Technology                    |
|----------------|-------------------------------|
| Framework      | Next.js 16 (App Router)       |
| Language       | TypeScript 5                  |
| Styling        | Tailwind CSS 4 + Custom CSS   |
| Animation      | Intersection Observer API      |
| Icons          | React Icons (Remix Icon set)  |
| Fonts          | Space Grotesk, Outfit, JetBrains Mono |
| Deployment     | Vercel                        |
| SEO            | Next.js Metadata API + JSON-LD |
| Images         | Next.js Image (AVIF + WebP)   |
| PWA            | Web App Manifest + Favicons   |

---

## 🎨 Design System

### Color Palette

| Token          | Value     | Usage                        |
|----------------|-----------|------------------------------|
| `--color-primary` | `#0E52A8` | Brand blue, CTAs, accents |
| `--color-secondary` | `#0B192C` | Dark navy, card backgrounds |
| `--color-background` | `#050816` | Page background           |
| `--color-surface` | `#0A1628` | Card surfaces               |
| `--color-white` | `#FFFFFF`  | Text, icons on dark bg      |
| `--color-silver` | `#C0C0C0` | Subtle text, dividers        |

### Typography

| Role      | Font            | Weights      |
|-----------|-----------------|--------------|
| Headings  | Space Grotesk   | 300–700      |
| Body      | Outfit          | 300–700      |
| Code      | JetBrains Mono  | 400, 500, 600 |

### Components

- `AnimatedSection` — Scroll-triggered entrance animations
- `ProjectCard` — Project showcase with status, tech tags, links
- `BlogCard` — Blog post preview with category, tags, metadata
- `NewsletterForm` — Email capture with loading/success states
- `ShareButton` — Native Web Share API + clipboard fallback
- `BlogFilter` — Category filter buttons
- `Navbar` — Sticky, scroll-aware, mobile overlay menu
- `Footer` — Brand identity, social links, navigation

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/GanzaParfait/GanzaParfait.git
cd GanzaParfait

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Key Commands

```bash
npm run dev       # Development server with hot reload
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint check
```

---

## 📄 Pages

| Route           | Description                                      | Type     |
|-----------------|--------------------------------------------------|----------|
| `/`             | Homepage with hero, skills, featured projects    | Static   |
| `/about`        | Story, values, skills, career timeline           | Static   |
| `/projects`     | Full project portfolio with filtering            | Static   |
| `/blog`         | Article listing with categories                  | Static   |
| `/blog/[slug]`  | Individual blog post with JSON-LD Article schema | SSG      |
| `/services`     | Service offerings and work process               | Static   |
| `/speaking`     | Speaking topics and past engagements             | Static   |
| `/contact`      | Contact form with validation                     | Static   |
| `/sitemap.xml`  | Auto-generated XML sitemap                       | Static   |
| `/robots.txt`   | Search engine directives                         | Static   |

---

## 🔍 SEO

This site is engineered to be the most authoritative online source for Prince Parfait GANZA across search engines, AI assistants, and social platforms.

### Implementation

- **JSON-LD Structured Data** — `Person`, `WebSite`, `ProfilePage`, `BlogPosting`, `ContactPage` schemas
- **Canonical URLs** — Every page has a canonical URL
- **Open Graph** — Full OG metadata for Facebook, LinkedIn, WhatsApp, Discord
- **Twitter Card** — `summary_large_image` on all pages
- **Sitemap** — Dynamic XML sitemap including all pages, projects, and blog posts
- **robots.txt** — Proper crawl directives with sitemap reference
- **Image SEO** — Descriptive filenames, alt text, Next.js Image optimization (AVIF + WebP)
- **Performance** — Static generation, code splitting, lazy loading, security headers

### Target Keywords

- Prince Parfait GANZA
- Software Engineer Rwanda
- AI Builder Africa
- Founder Lerony
- Full Stack Developer Rwanda
- React Developer Rwanda
- Speaker Rwanda
- Entrepreneur Rwanda

---

## ♿ Accessibility

- **WCAG 2.1 AA+** compliant
- Skip-to-main-content link for keyboard users
- All interactive elements have descriptive `aria-label` attributes
- `role` attributes on landmark regions (`main`, `banner`, `contentinfo`, `navigation`)
- `aria-current="page"` on active nav links
- `aria-live` regions on form feedback messages
- `aria-busy` on loading buttons
- `prefers-reduced-motion` support (disables animations)
- `:focus-visible` custom focus rings
- All images have meaningful `alt` text
- Semantic HTML5 elements throughout

---

## 📱 PWA

The site is installable as a Progressive Web App:

| Asset                        | Size    | Purpose                      |
|------------------------------|---------|------------------------------|
| `favicon.ico`                | Multi   | Browser tab icon             |
| `favicon.svg`                | SVG     | Modern browsers              |
| `favicon-96x96.png`          | 96×96   | Legacy browsers              |
| `apple-touch-icon.png`       | 180×180 | iOS home screen              |
| `web-app-manifest-192x192.png` | 192×192 | Android PWA (maskable)     |
| `web-app-manifest-512x512.png` | 512×512 | Android PWA (maskable)     |
| `site.webmanifest`           | —       | PWA manifest                 |
| `browserconfig.xml`          | —       | Windows live tiles           |

---

## 🗺️ Roadmap

### ✅ Version 1 (Current)
- [x] Homepage with hero, skills, projects, blog preview
- [x] About page with timeline
- [x] Projects listing
- [x] Blog listing and individual post pages
- [x] Services page
- [x] Speaking page
- [x] Contact form
- [x] Custom 404
- [x] Sitemap + robots.txt
- [x] PWA manifest + all favicons
- [x] JSON-LD structured data
- [x] Full SEO implementation
- [x] WCAG AA+ accessibility

### 🚧 Version 1.1 (Next)
- [ ] MDX blog posts with syntax highlighting
- [ ] Testimonials section
- [ ] Newsletter API integration (Resend)
- [ ] Downloadable PDF résumé
- [ ] Dark/light theme toggle

### 📅 Version 2
- [ ] CMS integration (Contentlayer or Sanity)
- [ ] Product listings (Lerony products)
- [ ] Events calendar
- [ ] Site-wide search
- [ ] RSS feed
- [ ] Reading progress indicator

### 🔮 Version 3
- [ ] Client portal
- [ ] Analytics dashboard
- [ ] AI-powered chat assistant
- [ ] Admin panel
- [ ] Multi-language support (English + Kinyarwanda + French)

---

## 📁 Brand Assets

All brand assets are served from `public/brand/`.

| Variant                              | File                                    |
|--------------------------------------|-----------------------------------------|
| Logo — Horizontal Blue               | `brand/logos/logo-horizontal-blue.png` |
| Logo — Horizontal Dark               | `brand/logos/logo-horizontal-dark.png` |
| Logo — Horizontal Light              | `brand/logos/logo-horizontal-light.png` |
| Logo — Vertical Blue                 | `brand/logos/logo-vertical-blue.png`   |
| Logo — Vertical Dark                 | `brand/logos/logo-vertical-dark.png`   |
| Logo — Vertical Light                | `brand/logos/logo-vertical-light.png`  |
| Wordmark — Horizontal Blue           | `brand/logos/wordmark-horizontal-blue.png` |
| Wordmark — Horizontal Black          | `brand/logos/wordmark-horizontal-black.png` |
| Wordmark — Horizontal Light          | `brand/logos/wordmark-horizontal-light.png` |
| Icon — Blue                          | `brand/icons/icon-blue.png`            |
| Icon — Black                         | `brand/icons/icon-black.png`           |
| Icon — White                         | `brand/icons/icon-white.png`           |

---

## 🤝 Contributing

This is a personal website. I don't accept external contributions, but feel free to fork it and use it as inspiration for your own portfolio.

If you find a bug or accessibility issue, please [open an issue](https://github.com/GanzaParfait/GanzaParfait/issues).

---

## 📜 License

MIT License — feel free to use this as a reference. Attribution appreciated but not required.

---

## 👤 About

**Prince Parfait GANZA** is a founder, software engineer, AI builder, speaker, and entrepreneur based in Kigali, Rwanda.

He builds full-stack web applications and AI-powered tools that solve real-world problems across Africa and beyond. His work is driven by the belief that software is one of the most powerful tools for social and economic change.

| Platform      | Link                                                                       |
|---------------|----------------------------------------------------------------------------|
| Website       | [princeparfait.com](https://princeparfait.com)                             |
| GitHub        | [@GanzaParfait](https://github.com/GanzaParfait)                          |
| LinkedIn      | [ganza-prince-235816269](https://linkedin.com/in/ganza-prince-235816269)  |
| X / Twitter   | [@_prince_parfait_1](https://x.com/_prince_parfait_1)                         |
| YouTube       | [@_prince_parfait_](https://youtube.com/@_prince_parfait_)                     |
| Instagram     | [@_prince_parfait_](https://www.instagram.com/_prince_parfait_)                |
| TikTok        | [@_prince_parfait_](https://tiktok.com/@_prince_parfait_)                      |
| Threads       | [@_prince_parfait_](https://www.threads.com/@_prince_parfait_)                 |
| Luma           | [princeparfait](https://lu.ma/user/princeparfait)                         |
| Buy Me a Coffee | [princeparfait](https://buymeacoffee.com/princeparfait)                  |
| WhatsApp      | [+250 792 054 846](https://wa.me/250792054846)                             |
| Lerony        | [lerony.com](https://lerony.com)                                           |

---

<div align="center">

Built with ❤️ in Kigali, Rwanda 🇷🇼

*Building software that creates impact.*

</div>