import type { IconType } from "react-icons";
import {
  RiGithubFill,
  RiLinkedinFill,
  RiTwitterXFill,
  RiYoutubeFill,
  RiInstagramFill,
  RiTiktokFill,
  RiWhatsappLine,
  RiThreadsLine,
  RiCupLine,
  RiFacebookFill,
  RiGlobalLine,
  RiLinksLine,
} from "react-icons/ri";
import type { SiteSettings } from "@/lib/supabase";
import { siteConfig } from "@/data/site-data";

export type SocialPlacement = "header" | "footer" | "hero" | "contact";

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  enabled: boolean;
  header: boolean;
  footer: boolean;
  hero: boolean;
  contact: boolean;
  order: number;
}

export const SOCIAL_ICON_MAP: Record<string, IconType> = {
  whatsapp: RiWhatsappLine,
  linkedin: RiLinkedinFill,
  instagram: RiInstagramFill,
  github: RiGithubFill,
  twitter: RiTwitterXFill,
  youtube: RiYoutubeFill,
  tiktok: RiTiktokFill,
  threads: RiThreadsLine,
  buymeacoffee: RiCupLine,
  facebook: RiFacebookFill,
  luma: RiGlobalLine,
  website: RiGlobalLine,
  custom: RiLinksLine,
};

export const SOCIAL_PLATFORM_OPTIONS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
  { id: "github", label: "GitHub" },
  { id: "twitter", label: "X / Twitter" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "threads", label: "Threads" },
  { id: "facebook", label: "Facebook" },
  { id: "luma", label: "Luma" },
  { id: "buymeacoffee", label: "Buy Me a Coffee" },
  { id: "website", label: "Website" },
  { id: "custom", label: "Custom" },
] as const;

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { id: "linkedin", platform: "linkedin", label: "LinkedIn", url: siteConfig.social.linkedin, enabled: true, header: true, footer: true, hero: true, contact: true, order: 1 },
  { id: "github", platform: "github", label: "GitHub", url: siteConfig.social.github, enabled: true, header: true, footer: true, hero: true, contact: true, order: 2 },
  { id: "whatsapp", platform: "whatsapp", label: "WhatsApp", url: siteConfig.social.whatsapp, enabled: true, header: false, footer: true, hero: false, contact: true, order: 3 },
  { id: "instagram", platform: "instagram", label: "Instagram", url: siteConfig.social.instagram, enabled: true, header: false, footer: true, hero: false, contact: false, order: 4 },
  { id: "twitter", platform: "twitter", label: "X / Twitter", url: siteConfig.social.twitter, enabled: true, header: false, footer: true, hero: false, contact: true, order: 5 },
  { id: "youtube", platform: "youtube", label: "YouTube", url: siteConfig.social.youtube, enabled: true, header: false, footer: true, hero: false, contact: false, order: 6 },
  { id: "tiktok", platform: "tiktok", label: "TikTok", url: siteConfig.social.tiktok, enabled: true, header: false, footer: true, hero: false, contact: false, order: 7 },
  { id: "threads", platform: "threads", label: "Threads", url: siteConfig.social.threads, enabled: true, header: false, footer: true, hero: false, contact: false, order: 8 },
  { id: "luma", platform: "luma", label: "Luma", url: siteConfig.social.luma, enabled: true, header: false, footer: false, hero: false, contact: false, order: 9 },
  { id: "buymeacoffee", platform: "buymeacoffee", label: "Buy Me a Coffee", url: siteConfig.social.buymeacoffee, enabled: true, header: false, footer: true, hero: false, contact: false, order: 10 },
];

export function socialIcon(platform: string): IconType {
  return SOCIAL_ICON_MAP[platform] || RiLinksLine;
}

export function whatsappUrlFromNumber(digits: string) {
  const clean = (digits || "").replace(/\D/g, "");
  return clean ? `https://wa.me/${clean}` : siteConfig.social.whatsapp;
}

export function resolvedSocials(settings: SiteSettings): SocialLink[] {
  const list = (settings.socialLinks && settings.socialLinks.length > 0
    ? settings.socialLinks
    : DEFAULT_SOCIAL_LINKS
  ).map((link) => ({ ...link }));

  return list
    .map((link) => {
      if (link.platform === "whatsapp") {
        return { ...link, url: whatsappUrlFromNumber(settings.whatsappNumber) };
      }
      return link;
    })
    .sort((a, b) => a.order - b.order);
}

export function socialsFor(
  settings: SiteSettings,
  placement: SocialPlacement,
  options?: { ids?: string[]; limit?: number },
) {
  let list = resolvedSocials(settings).filter((link) => link.enabled && link.url && link[placement]);
  if (options?.ids?.length) {
    const allowed = new Set(options.ids);
    list = list.filter((link) => allowed.has(link.id));
  }
  const limit = options?.limit;
  if (typeof limit === "number" && limit > 0) list = list.slice(0, limit);
  return list;
}

export function heroSocialsFor(settings: SiteSettings) {
  const all = resolvedSocials(settings).filter((link) => link.enabled && link.url);
  const seen = new Set<string>();
  const unique = all.filter((link) => {
    if (seen.has(link.id)) return false;
    seen.add(link.id);
    return true;
  });

  const ids = (settings.heroSocialIds || []).filter((id) => unique.some((link) => link.id === id));
  const byId = new Map(unique.map((link) => [link.id, link]));
  const selected = ids.map((id) => byId.get(id)).filter((link): link is SocialLink => Boolean(link));
  const limit = Math.max(1, settings.heroSocialLimit || selected.length || 4);
  return selected.slice(0, limit);
}

export function syncHeroSocialFlags(settings: SiteSettings): SiteSettings {
  const ids = [...new Set(settings.heroSocialIds || [])];
  const selected = new Set(ids);
  return {
    ...settings,
    heroSocialIds: ids,
    socialLinks: resolvedSocials(settings).map((link) => ({
      ...link,
      hero: selected.has(link.id),
    })),
  };
}

export function socialByPlatform(settings: SiteSettings, platform: string) {
  return resolvedSocials(settings).find((link) => link.enabled && link.platform === platform);
}
