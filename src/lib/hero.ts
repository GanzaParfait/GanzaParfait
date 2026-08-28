import type { HeroLayoutType, SiteSettings } from "@/lib/supabase";
import { DEFAULT_SETTINGS } from "@/lib/supabase";
import { PORTRAIT_PATH } from "@/lib/schema";

export const HERO_LAYOUTS: {
  id: HeroLayoutType;
  name: string;
  short: string;
  description: string;
}[] = [
  {
    id: "split_portrait",
    name: "Split Portrait",
    short: "Default",
    description: "Portrait on the right, introduction on the left. The standard professional layout.",
  },
  {
    id: "full_centered_floating",
    name: "Centered Portrait",
    short: "Centered",
    description: "Portm-style centered portrait, glass role/email pills, socials, and right-side highlights. Light and dark.",
  },
  {
    id: "featured_overlay",
    name: "Cinematic Overlay",
    short: "Overlay",
    description: "Full-bleed photograph with a short headline, one action, and a small detail card.",
  },
];

export function splitDisplayName(title: string) {
  const parts = title.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: title.trim() || DEFAULT_SETTINGS.siteTitle, last: "" };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export function setting<K extends keyof SiteSettings>(settings: SiteSettings, key: K): NonNullable<SiteSettings[K]> {
  const value = settings[key];
  if (value === undefined || value === "") return DEFAULT_SETTINGS[key] as NonNullable<SiteSettings[K]>;
  return value as NonNullable<SiteSettings[K]>;
}

export const LAYOUT_HERO_IMAGES: Record<HeroLayoutType, string> = {
  split_portrait: PORTRAIT_PATH,
  full_centered_floating: "/images/profile/hero-centered-portrait.webp",
  featured_overlay: "/images/profile/hero-cinematic-overlay.webp",
};

export type HeroImageKey = "heroImageSplit" | "heroImageCentered" | "heroImageOverlay";

export function imageKeyFor(layout: HeroLayoutType): HeroImageKey {
  if (layout === "full_centered_floating") return "heroImageCentered";
  if (layout === "featured_overlay") return "heroImageOverlay";
  return "heroImageSplit";
}

export function heroImageFor(settings: SiteSettings, layout?: HeroLayoutType): string {
  const id = layout || settings.bannerLayout || "split_portrait";
  const key = imageKeyFor(id);
  return settings[key] || settings.heroImageUrl || LAYOUT_HERO_IMAGES[id];
}

export type HeroEditorField =
  | "image"
  | "name"
  | "greeting"
  | "availability"
  | "location"
  | "roles"
  | "headline"
  | "bio"
  | "email"
  | "invite"
  | "primaryCta"
  | "secondaryCta"
  | "card"
  | "stat1"
  | "stat2"
  | "stat3"
  | "heroSocials";

export const LAYOUT_EDITOR_FIELDS: Record<HeroLayoutType, HeroEditorField[]> = {
  split_portrait: ["image", "name", "greeting", "availability", "location", "roles", "bio", "primaryCta", "secondaryCta", "stat1", "stat2", "heroSocials"],
  full_centered_floating: ["image", "name", "roles", "location", "email", "invite", "stat1", "stat2", "stat3", "heroSocials"],
  featured_overlay: ["image", "availability", "location", "headline", "bio", "primaryCta", "card"],
};

export function layoutShows(layout: HeroLayoutType, field: HeroEditorField) {
  return LAYOUT_EDITOR_FIELDS[layout].includes(field);
}
