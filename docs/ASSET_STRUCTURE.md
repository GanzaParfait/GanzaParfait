# Asset Structure

> Where every brand asset lives and how to use it correctly.

---

## Directory Structure

```
site/public/
├── favicon.ico                          # Browser tab favicon (multi-size ICO)
├── favicon.svg                          # Modern browsers (scalable)
├── favicon-96x96.png                    # 96×96 PNG for legacy browsers
├── apple-touch-icon.png                 # 180×180 — iOS home screen
├── web-app-manifest-192x192.png         # Android PWA — maskable
├── web-app-manifest-512x512.png         # Android PWA — maskable (splash)
├── site.webmanifest                     # PWA configuration
├── browserconfig.xml                    # Windows live tile configuration
├── brand/
│   ├── logos/
│   │   ├── logo-horizontal-blue.png     # For dark backgrounds
│   │   ├── logo-horizontal-dark.png     # For light backgrounds
│   │   ├── logo-horizontal-light.png    # For dark backgrounds
│   │   ├── logo-vertical-blue.png       # Square/tall spaces, dark bg
│   │   ├── logo-vertical-dark.png       # Square/tall spaces, light bg
│   │   ├── logo-vertical-light.png      # Square/tall spaces, dark bg
│   │   ├── wordmark-horizontal-blue.png # Text-only, dark bg
│   │   ├── wordmark-horizontal-black.png# Text-only, light bg
│   │   ├── wordmark-horizontal-light.png# Text-only, dark bg
│   │   ├── wordmark-vertical-blue.png   # Vertical text-only, dark bg
│   │   ├── wordmark-vertical-dark.png   # Vertical text-only, light bg
│   │   └── wordmark-vertical-light.png  # Vertical text-only, dark bg
│   └── icons/
│       ├── icon-blue.png               # Mark only — dark backgrounds
│       ├── icon-black.png              # Mark only — light backgrounds
│       └── icon-white.png              # Mark only — dark backgrounds
└── images/
    ├── profile/                         # Profile photos
    ├── projects/                        # Project screenshots
    └── blog/                            # Blog post cover images
```

---

## Favicons — When to Use Which

| Asset                      | Where It Appears                        | Recommended |
|----------------------------|-----------------------------------------|-------------|
| `favicon.ico`              | Legacy browser tabs, Windows            | Required    |
| `favicon.svg`              | Modern Chrome, Firefox, Safari tab      | Recommended |
| `favicon-96x96.png`        | Android Chrome legacy, some desktops    | Required    |
| `apple-touch-icon.png`     | iOS Safari "Add to Home Screen"         | Required    |
| `web-app-manifest-192x192.png` | Android PWA icon, some launchers  | Required    |
| `web-app-manifest-512x512.png` | Android splash screen, app stores | Required    |

---

## Logos — Decision Guide

```
Is the background dark?
  Yes → Use blue or light variant
  No  → Use dark variant

Is the space wide (> 2:1 aspect)?
  Yes → Use horizontal variant
  No  → Use vertical or icon variant

Is there only a small square space?
  Yes → Use icon variant only
```

---

## Adding New Images

### Naming Convention

Use descriptive, kebab-case filenames optimized for image SEO:

```
✅ prince-parfait-ganza-speaking-kigali-2025.webp
✅ lerony-saas-dashboard-screenshot.webp
✅ agrivoice-mobile-app-interface.webp

❌ IMG_1234.jpg
❌ screenshot1.png
❌ photo.jpg
```

### Required Attributes

Every `<Image>` component must have:

```tsx
<Image
  src="/images/projects/project-name.webp"
  alt="Descriptive alt text that explains what the image shows"
  width={1200}
  height={630}
  className="..."
/>
```

### Format Priority

1. `.webp` — Use for all photography and complex images
2. `.svg` — Use for logos, icons, illustrations
3. `.png` — Use for brand assets (logos, favicons)
4. `.avif` — Next.js handles automatic conversion via `next/image`

---

## Documents

| Document        | Location             | Format |
|-----------------|----------------------|--------|
| Résumé / CV     | `public/resume.pdf`  | PDF    |
| Media Kit       | `public/media-kit.pdf` | PDF  |
| Brand Kit       | `prince_parfait_ganza_brand_assets/` | ZIP + PNG |

---

## Source Files

Full-resolution master files are stored in:

```
prince_parfait_ganza_brand_assets/
├── full_size/           # Full resolution (for print, press kits)
├── favicon/             # All favicon variants (source)
└── *.png                # Optimized web variants
```

> **Note:** The `full_size/` directory contains print-quality files (3000px+). Never serve these directly from `public/`. Always use the optimized variants.