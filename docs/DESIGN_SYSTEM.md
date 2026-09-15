# Design System

Visual and interaction rules for princeparfait.com.

The public hero is a light split composition: name and identity on the left, portrait in a blue architectural frame on the right, with a faint grid concentrated near the portrait. Do not add a second decorative hero treatment.

---

## Brand

| Token | Value | Use |
|-------|-------|-----|
| Name | Prince Parfait GANZA | All public surfaces |
| Domain | princeparfait.com | Canonical identity |
| Direction | Blue | Accents, CTAs, focus |
| Location | Kigali, Rwanda | Hero, footer, schema |

Logos live in `public/brand/logos/`. Use horizontal blue on light surfaces and horizontal light on dark surfaces.

---

## Color

Use CSS custom properties from `src/app/globals.css`. Do not introduce a second palette.

| Token | Light | Dark | Role |
|-------|-------|------|------|
| `--color-primary` | `#0e52a8` | `#0e52a8` | Brand, CTAs, links |
| `--color-primary-light` | `#1a6dd4` | `#1a6dd4` | Hover |
| `--color-primary-dark` | `#093d80` | `#093d80` | Pressed |
| `--color-bg` | `#ffffff` | `#050816` | Page |
| `--color-bg-2` | `#f8fafc` | `#0b192c` | Alternating sections |
| `--color-surface` | `#ffffff` | `#0a1628` | Cards |
| `--color-text` | `#0b192c` | `#ffffff` | Headings |
| `--color-text-2` | `#3d5173` | `#94a3b8` | Body |
| `--color-text-3` | `#8496b0` | `#64748b` | Meta |
| `--color-border` | blue at 15% | blue at 20% | Dividers |

Contrast for body text must meet WCAG AA (4.5:1). Do not place primary-blue text on white without checking contrast.

Avoid: excessive gradients, holographic UI, robot imagery, code rain, heavy glass, glow stacks.

---

## Typography

The live site uses **Outfit** for headings and body, loaded in `src/app/layout.tsx`.

| Role | Family | Notes |
|------|--------|-------|
| Headings | Outfit | 700–800, tight tracking |
| Body | Outfit | 400–500, 1.75 line height |
| Code / tags | JetBrains Mono fallback | Tech chips only |

Scale:

- H1: `clamp(2.75rem, 6vw, 5rem)`
- H2: `clamp(1.875rem, 3.5vw, 3rem)`
- Body: 1rem
- Labels: 0.75rem, uppercase, wide tracking, primary color

Do not mix a third display font without a documented reason.

---

## Layout

- Max width: `--container-max` (1280px)
- Horizontal padding: `--container-padding` (1rem, increase on large screens via existing utilities)
- Section padding: `--section-padding` (5rem 0)
- 12-column mental model; practical implementation is CSS grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- Mobile first. Primary CTAs must remain usable at 320px.

Breakpoints follow Tailwind defaults: sm 640, md 768, lg 1024, xl 1280.

---

## Radius, Shadow, Focus

| Token | Value |
|-------|-------|
| `--radius-sm` | 0.375rem |
| `--radius-md` | 0.75rem |
| `--radius-lg` | 1rem |
| `--radius-xl` | 1.5rem |
| `--shadow-sm` / `--shadow-md` | Soft, navy-tinted |
| `--shadow-glow` | Use rarely, on primary CTA only |

Focus: visible `:focus-visible` rings using brand blue. Never remove outlines without a replacement.

---

## Components

Reuse before creating:

- `Navbar` — sticky pill, theme-aware logo, compact mobile sheet
- `Footer` — identity, primary links, public socials
- `AnimatedSection` — scroll entrance only
- `ProjectCard` / `ProjectShowcase` — work evidence
- `HeroSection` — homepage identity
- `ManifestoSection` / `SelectedWork` / `KnowledgeSection` / `JourneySection` — homepage story blocks
- Buttons via `.btn`, `.btn-primary`, `.btn-outline`, `.btn-ghost`
- Cards via `.card`
- Section labels via `.section-label`

Do not add Framer Motion to a page that already has Intersection Observer motion unless a specific interaction cannot be done in CSS.

---

## Motion

Homepage priority: **clarity over animation**.

The homepage is a guided sequence: hero, manifesto, selected work, knowledge, journey, ventures, principles, speaking, booking, closing. Those sections are editable from Dashboard → Homepage in a side-by-side editor with Content / Style / Display tabs, a focus-area list, and Desktop / Tablet / Mobile preview widths. Knowledge uses a four-card focus grid with circular icons, a side rail of labels, and a soft stats-and-quote strip. Optional accents (script, statement, card numbers, circular arrow) stay off unless enabled in Display. Journey is a two-column grid-backed layout: intro, honest stats, and a single “Open full timeline” more-details card on the left; filtered timeline with category tags on the right. View details opens a right-hand drawer (not a centered modal). Each timeline entry can show or block visitor details from the Homepage editor. The manifesto pairs the statement, three step cards, and a quote with a contained portrait on the right. On a phone the portrait sits between the statement and the cards, never behind the text. Selected work shows four cases on the homepage board: Caritas systems, AskField, StockPro, and GotAllNews. The first and fourth are wide; two and three sit side by side. Images open a full preview on click. On a phone the manifesto step cards and selected-work cards stay full width, height auto, and stick in a stack as the visitor scrolls. Case study pages use the same fields as Dashboard → Projects: role, duration, client, highlights, features, quote, file, and screenshot captions. Empty fields stay hidden. Do not fill them from a mockup. Signature dark bands are limited to the closing statement. Other sections use theme tokens so light mode stays light and dark mode stays dark. Booking uses `bookingCalendarUrl` from site settings. Empty means email and WhatsApp, not a private calendar link. The announcement bar opens a wide panel with media on one side and details on the other, or stacked when that layout is chosen. On a phone it is always a bottom sheet. Videos stay unloaded until play. The logo is the home link. Moving the pointer, touching, or scrolling briefly points at it; the cue is not pinned to the navigation. The admin shell places the brand logo in the sidebar (~18rem when open); the Control Center header flexes beside the sidebar, not above it.

Allowed:

- Short fade/translate on scroll (`AnimatedSection`)
- Hover lift of ~2px on cards
- Role ticker on the hero if it does not delay comprehension
- CSS marquees that pause on hover and respect reduced motion

Not allowed:

- Particle networks or code-background canvases
- Animation that blocks reading
- Auto-playing decorative 3D
- Fake statistics counters

Always honor `prefers-reduced-motion`. `AnimatedSection` must skip transform when that preference is set.

---

## Imagery

- Hero photograph: `public/images/profile/prince-parfait-ganza-kigali-rwanda.webp`
- Alt text must name Prince Parfait GANZA
- Project screenshots only when they do not expose confidential data
- No stock "AI robot" or generic laptop-with-code hero art

---

## Theme

Light is default. Dark is a first-class alternative via `data-theme`. Keep both readable. Do not design a third theme.
