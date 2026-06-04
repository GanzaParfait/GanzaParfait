# Prince Parfait GANZA — Portfolio

> **CEO & Founder of Lerony Co. Ltd** · Technical Founder · ALX Graduate · Digital Transformation Expert

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel&logoColor=white)](https://vercel.com)

---

## 🌐 Live Site

**[ganzaparfait.com](https://ganzaparfait.com)** _(replace with your deployment URL)_

---

## 📋 About This Portfolio

A premium, performance-first portfolio landing page built for **Prince Parfait GANZA** — CEO & Founder of Lerony Co. Ltd. The site presents his professional journey, business impact, and accreditations in a sleek, dark-mode-first design optimized for modern web deployment.

### ✨ Design Philosophy

- **Dark Mode First** — Deep dark backgrounds with carefully chosen blue/violet/cyan accent palette
- **Glassmorphism UI** — Layered glass-effect cards with blur and border treatments
- **Micro-animations** — Intersection Observer-driven fade-in/slide-up on scroll
- **Mobile-first Responsive** — Fluid layouts from 320px to 4K

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Fonts | Inter (Google Fonts) |
| Images | Next.js `<Image>` (Optimized AVIF/WebP) |
| Deployment | Vercel (recommended) |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with SEO metadata & JSON-LD
│   ├── page.tsx            # Main page composition
│   └── globals.css         # Design tokens, custom utilities & animations
└── components/
    ├── Navbar.tsx          # Sticky glass nav with scroll detection
    ├── Hero.tsx            # Hero section with profile image & CTAs
    ├── WorkHistory.tsx     # Impact-focused experience cards
    ├── Credentials.tsx     # Certificate grid with animated cards
    ├── About.tsx           # Personal bio & tech stack
    ├── Contact.tsx         # Contact form + social links
    └── Footer.tsx          # Minimal footer
```

---

## 🔍 SEO Architecture

The site implements a bulletproof SEO strategy out of the box:

### Meta & OpenGraph
```typescript
// layout.tsx — fully configured metadata
title: "Prince Parfait GANZA | CEO & Technical Founder | Software Engineering & Digital Transformation"
description: "Technical founder, CEO of Lerony Co. Ltd..."

// OpenGraph (1200×630 OG image)
og:title, og:description, og:image, og:type

// Twitter Card
twitter:card = "summary_large_image"
```

### Semantic HTML
- Single `<h1>` per page within `<main id="main-content">`
- Proper `<h2>` → `<h3>` → `<h4>` hierarchy per section
- All sections use `<section>` with `aria-labelledby` and unique `id` attributes
- Interactive elements have descriptive `id` attributes for testing and accessibility

### JSON-LD Structured Data
```json
{
  "@type": "Person",
  "name": "Prince Parfait GANZA",
  "jobTitle": "CEO & Founder",
  "worksFor": { "@type": "Organization", "name": "Lerony Co. Ltd" }
}
```

### Performance
- Next.js `<Image>` with AVIF/WebP, `priority` on hero image
- Static page generation (SSG) — zero JS server round-trips
- Security headers (X-Frame-Options, CSP, HSTS-ready)
- Asset caching: `max-age=31536000, immutable`

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Development
```bash
# Clone
git clone https://github.com/GanzaParfait/GanzaParfait.git
cd GanzaParfait

# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000
```

### Production Build
```bash
npm run build
npm run start
```

---

## 🌍 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

The project is pre-configured for Vercel with Next.js optimizations. Connect your GitHub repository in the Vercel dashboard for automatic deployments on every push to `main`.

### Environment Variables
Currently none required. For Supabase integration (contact form), add:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## 📸 Page Sections

| Section | Description |
|---------|-------------|
| **Hero** | Bold headline, profile photo, animated floating stat cards, dual CTA |
| **Work History** | Lerony Co. Ltd, E-Commerce (US), Caritas Rwanda — impact-led narrative |
| **Credentials** | ALX Data Analytics, Professional Foundations, Founder's Academy, Academic Excellence |
| **About** | Personal bio, core strengths grid, technology stack |
| **Contact** | Contact form, social links, availability status |

---

## 👤 About Prince Parfait GANZA

| | |
|-|-|
| **Role** | CEO & Founder, Lerony Co. Ltd |
| **Specialization** | Software Engineering, Digital Transformation, Data Analytics |
| **Academic** | 2nd Overall Graduate · 86% Distinction |
| **Certifications** | ALX Data Analytics · Professional Foundations · Founder's Academy |
| **Location** | Rwanda 🇷🇼 |
| **GitHub** | [@GanzaParfait](https://github.com/GanzaParfait) |

---

## 📄 License

© 2026 Prince Parfait GANZA. All rights reserved.
