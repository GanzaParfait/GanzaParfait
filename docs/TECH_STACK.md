# Technology Stack

> The full technical specification for `princeparfait.dev` — rationale, versions, and conventions.

---

## Core Stack

| Category       | Technology              | Version   | Rationale                                                |
|----------------|-------------------------|-----------|----------------------------------------------------------|
| Framework      | Next.js                 | 16.x      | Best-in-class SSG + SSR, App Router, SEO control         |
| Language       | TypeScript              | 5.x       | Type safety, better DX, maintainability                  |
| Styling        | Tailwind CSS            | 4.x       | Utility-first with custom CSS for design tokens          |
| Animation      | Intersection Observer API | Native  | No bundle cost, respects reduced-motion, smooth enough   |
| Icons          | React Icons             | Latest    | Remix Icon set — consistent, accessible SVG icons        |
| Fonts          | Google Fonts            | CDN       | Space Grotesk, Outfit, JetBrains Mono                    |
| Image Opt.     | Next.js Image           | Built-in  | AVIF + WebP, lazy loading, blur placeholders             |
| SEO            | Next.js Metadata API    | Built-in  | Typed metadata, JSON-LD, Open Graph, Twitter Card        |
| Deployment     | Vercel                  | Latest    | Zero-config Next.js deployment, global CDN               |

---

## Key Dependencies

```json
{
  "next": "^16.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-icons": "latest",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@tailwindcss/postcss": "^4.0.0"
}
```

---

## Architecture Decisions

### App Router (not Pages Router)

Used Next.js App Router exclusively for:
- Better metadata API (typed, co-located)
- React Server Components (zero JS for static content)
- Streaming and Suspense support for future features
- Nested layouts

### Static Generation by Default

All pages use static generation (`○`) unless they require dynamic data. This gives:
- Instant load times
- 100% Lighthouse scores
- Edge CDN caching on Vercel

### Custom CSS + Tailwind

Tailwind handles utilities and responsive layouts.
Custom CSS variables define the design system:
- Brand color tokens
- Typography tokens
- Animation keyframes
- Component base styles (`.btn`, `.card`, `.badge`, `.tech-tag`)

This hybrid approach avoids massive `className` strings while maintaining consistency.

### No External Animation Library

Instead of Framer Motion, the site uses native Intersection Observer API:
- Zero JS bundle overhead
- Naturally respects `prefers-reduced-motion` via CSS
- Sufficient for portfolio-level animations

Framer Motion can be added in V2 if complex 3D/physics animations are needed.

---

## Performance Targets

| Metric         | Target | Method                                       |
|----------------|--------|----------------------------------------------|
| Performance    | 100    | Static generation, optimized images, CDN     |
| Accessibility  | 100    | Semantic HTML, ARIA, skip links, focus rings |
| Best Practices | 100    | HTTPS, security headers, modern APIs         |
| SEO            | 100    | Metadata API, JSON-LD, sitemap, robots.txt   |
| LCP            | < 2.5s | Next/Image, preloading critical assets       |
| INP            | < 200ms| Minimal JS, deferred non-critical code       |
| CLS            | < 0.1  | Explicit dimensions on all images/media      |

---

## File Conventions

| Pattern              | Usage                                          |
|----------------------|------------------------------------------------|
| `PascalCase.tsx`     | React components                               |
| `camelCase.ts`       | Utilities, data files, hooks                   |
| `kebab-case/`        | Route segments (Next.js App Router convention) |
| `page.tsx`           | Route page components (Next.js)               |
| `layout.tsx`         | Route layouts (Next.js)                        |
| `not-found.tsx`      | 404 page (Next.js)                             |
| `sitemap.ts`         | Sitemap generator (Next.js)                    |
| `robots.ts`          | robots.txt generator (Next.js)                 |

---

## Environment Variables

```bash
# Required for production
NEXT_PUBLIC_SITE_URL=https://princeparfait.dev

# Optional (for future newsletter/email integration)
RESEND_API_KEY=re_...

# Optional (for analytics)
NEXT_PUBLIC_GA_ID=G-...
NEXT_PUBLIC_VERCEL_ANALYTICS=true
```

---

## Future Stack Additions

| Version | Technology        | Purpose                                    |
|---------|-------------------|--------------------------------------------|
| V1.1    | Resend            | Newsletter and contact form email delivery |
| V2.0    | Contentlayer / MDX | Blog post CMS                             |
| V2.0    | Algolia / Orama   | Site-wide search                           |
| V2.0    | Sanity (optional) | Full headless CMS                          |
| V3.0    | Clerk             | Auth for client portal                     |
| V3.0    | Prisma + Postgres | Database for client portal                 |
| V3.0    | OpenAI API        | AI chat assistant                          |

---

## Development Workflow

```bash
# 1. Clone and install
git clone https://github.com/GanzaParfait/GanzaParfait.git
cd GanzaParfait/site
npm install

# 2. Start dev server
npm run dev

# 3. Type check
npx tsc --noEmit

# 4. Lint
npm run lint

# 5. Build + check output
npm run build
```

### Deployment

Connected to Vercel via GitHub integration. Every push to `main` triggers a production deployment. Preview deployments are created for every pull request.