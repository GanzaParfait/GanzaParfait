import type { HeroLayoutCopy, HeroLayoutType, SiteSettings } from "@/lib/supabase";
import { DEFAULT_SETTINGS } from "@/lib/supabase";

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
    description:
      "Name, portrait, and copy for the public split hero. Roles stay specific to this layout.",
  },
  {
    id: "full_centered_floating",
    name: "Centered Portrait",
    short: "Centered",
    description: "Centered portrait, glass role and email pills, socials, and up to four highlights.",
  },
  {
    id: "featured_overlay",
    name: "Cinematic Overlay",
    short: "Overlay",
    description: "Full-bleed photograph, a short headline, one action, and a welcome card with highlights.",
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
  split_portrait: "/images/profile/hero-split-portrait.webp",
  full_centered_floating: "/images/profile/hero-centered-portrait.webp",
  featured_overlay: "/images/profile/hero-cinematic-overlay.webp",
};

export const MAX_HERO_HIGHLIGHTS = 4;

export function heroHighlights(settings: SiteSettings) {
  const pairs = [
    { value: setting(settings, "heroStat1Value"), label: setting(settings, "heroStat1Label") },
    { value: setting(settings, "heroStat2Value"), label: setting(settings, "heroStat2Label") },
    { value: setting(settings, "heroStat3Value"), label: setting(settings, "heroStat3Label") },
    { value: setting(settings, "heroStat4Value"), label: setting(settings, "heroStat4Label") },
  ];
  return pairs.filter((item) => item.value.trim() || item.label.trim()).slice(0, MAX_HERO_HIGHLIGHTS);
}

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
  | "stat4"
  | "heroSocials";

export const LAYOUT_EDITOR_FIELDS: Record<HeroLayoutType, HeroEditorField[]> = {
  split_portrait: ["image", "name", "greeting", "availability", "location", "roles", "bio", "primaryCta", "secondaryCta", "heroSocials"],
  full_centered_floating: ["image", "name", "roles", "location", "email", "invite", "heroSocials", "stat1", "stat2", "stat3", "stat4"],
  featured_overlay: ["image", "availability", "location", "headline", "card", "primaryCta", "stat1", "stat2", "stat3", "stat4"],
};

export function layoutShows(layout: HeroLayoutType, field: HeroEditorField) {
  return LAYOUT_EDITOR_FIELDS[layout].includes(field);
}

export const LAYOUT_COPY_KEYS = [
  "siteTitle",
  "siteSubtitle",
  "bio",
  "location",
  "contactEmail",
  "heroGreeting",
  "heroAvailableText",
  "heroHeadline",
  "heroInviteLine",
  "heroInviteCtaLabel",
  "heroInviteCtaHref",
  "heroPrimaryCtaLabel",
  "heroPrimaryCtaHref",
  "heroSecondaryCtaLabel",
  "heroSecondaryCtaHref",
  "heroCardLabel",
  "heroCardBody",
  "heroCardCtaLabel",
  "heroCardCtaHref",
  "heroStat1Value",
  "heroStat1Label",
  "heroStat2Value",
  "heroStat2Label",
  "heroStat3Value",
  "heroStat3Label",
  "heroStat4Value",
  "heroStat4Label",
  "heroSocialIds",
  "heroSocialLimit",
] as const;

export function layoutCopyFrom(settings: SiteSettings): HeroLayoutCopy {
  const copy: HeroLayoutCopy = {};
  for (const key of LAYOUT_COPY_KEYS) {
    const value = settings[key];
    if (value !== undefined) copy[key] = value as never;
  }
  return copy;
}

export function settingsForLayout(settings: SiteSettings, layout: HeroLayoutType): SiteSettings {
  const copy = settings.heroLayoutCopy?.[layout];
  if (!copy) return { ...settings, bannerLayout: layout };
  return { ...settings, ...copy, bannerLayout: layout };
}

export function heroRoles(settings: SiteSettings) {
  return setting(settings, "siteSubtitle")
    .split(/\s*[•·]\s*/)
    .map((role) => role.trim())
    .filter(Boolean);
}

export function carouselLayouts(settings: SiteSettings): HeroLayoutType[] {
  if (!settings.heroCarouselEnabled) return [];
  const visible = visibleHeroLayouts(settings).map((item) => item.id);
  if (settings.heroCarouselMode === "selected") {
    const picked = (settings.heroCarouselLayouts || []).filter((id) => visible.includes(id));
    return picked;
  }
  return visible;
}

export function visibleHeroLayouts(settings: SiteSettings) {
  const hidden = new Set(settings.hiddenHeroLayouts || []);
  const visible = HERO_LAYOUTS.filter((layout) => !hidden.has(layout.id));
  return visible.length ? visible : HERO_LAYOUTS;
}

export function hiddenHeroLayoutOptions(settings: SiteSettings) {
  const hidden = new Set(settings.hiddenHeroLayouts || []);
  return HERO_LAYOUTS.filter((layout) => hidden.has(layout.id));
}
