import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SOCIAL_LINKS, type SocialLink } from "@/lib/socials";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inykhcxyvzrxiysazhzq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWtoY3h5dnpyeGl5c2F6aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzI1NTEsImV4cCI6MjA5MzY0ODU1MX0.VuNYC8EKmg-eXyOvchi_Fuj1YHCbVHq6do5EwEqa8Ts";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HeroLayoutType = "split_portrait" | "featured_overlay" | "full_centered_floating";

export type NavbarStyle = "full" | "pill";

export type FooterCompanyFit = "contain" | "cover";
export type FooterCompanyHeight = "compact" | "regular" | "tall";
export type FooterCompanyAlign = "left" | "center";

export interface SiteSettings {
  bannerLayout: HeroLayoutType;
  navbarStyle?: NavbarStyle;
  heroImageUrl?: string;
  heroImageSplit?: string;
  heroImageCentered?: string;
  heroImageOverlay?: string;
  siteTitle: string;
  siteSubtitle: string;
  bio: string;
  location: string;
  contactEmail: string;
  whatsappNumber: string;
  phoneNumber?: string;
  headerSocialLimit: number;
  socialLinks?: SocialLink[];
  heroSocialIds?: string[];
  heroSocialLimit?: number;
  footerCompanyImage?: string;
  footerCompanyImageDark?: string;
  footerCompanyFit?: FooterCompanyFit;
  footerCompanyHeight?: FooterCompanyHeight;
  footerCompanyAlign?: FooterCompanyAlign;
  footerCompanyHref?: string;
  announcementText?: string;
  announcementLink?: string;
  announcementIsActive?: boolean;
  heroGreeting?: string;
  heroAvailableText?: string;
  heroHeadline?: string;
  heroInviteLine?: string;
  heroInviteCtaLabel?: string;
  heroInviteCtaHref?: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  heroCardLabel?: string;
  heroCardBody?: string;
  heroCardCtaLabel?: string;
  heroCardCtaHref?: string;
  heroStat1Value?: string;
  heroStat1Label?: string;
  heroStat2Value?: string;
  heroStat2Label?: string;
  heroStat3Value?: string;
  heroStat3Label?: string;
  heroStat4Value?: string;
  heroStat4Label?: string;
  hiddenHeroLayouts?: HeroLayoutType[];
  heroLayoutCopy?: Partial<Record<HeroLayoutType, HeroLayoutCopy>>;
  heroCarouselEnabled?: boolean;
  heroCarouselMode?: "all" | "selected";
  heroCarouselLayouts?: HeroLayoutType[];
  heroCarouselInterval?: number;
  identityRevision?: number;
}

export type HeroLayoutCopy = {
  siteTitle?: string;
  siteSubtitle?: string;
  bio?: string;
  location?: string;
  contactEmail?: string;
  heroGreeting?: string;
  heroAvailableText?: string;
  heroHeadline?: string;
  heroInviteLine?: string;
  heroInviteCtaLabel?: string;
  heroInviteCtaHref?: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaHref?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaHref?: string;
  heroCardLabel?: string;
  heroCardBody?: string;
  heroCardCtaLabel?: string;
  heroCardCtaHref?: string;
  heroStat1Value?: string;
  heroStat1Label?: string;
  heroStat2Value?: string;
  heroStat2Label?: string;
  heroStat3Value?: string;
  heroStat3Label?: string;
  heroStat4Value?: string;
  heroStat4Label?: string;
  heroSocialIds?: string[];
  heroSocialLimit?: number;
};

export const DEFAULT_SETTINGS: SiteSettings = {
  bannerLayout: "split_portrait",
  navbarStyle: "pill",
  heroImageUrl: "/images/profile/prince-parfait-ganza-kigali-rwanda.webp",
  heroImageSplit: "/images/profile/hero-split-portrait.webp",
  heroImageCentered: "/images/profile/hero-centered-portrait.webp",
  heroImageOverlay: "/images/profile/hero-cinematic-overlay.webp",
  siteTitle: "Prince Parfait GANZA",
  siteSubtitle: "Founder · Entrepreneur · Technologist · Software Engineer · AI Builder",
  bio: "Rwandan founder, entrepreneur and technologist. Software engineer and AI builder working from Kigali.",
  heroCarouselEnabled: false,
  heroCarouselMode: "all",
  heroCarouselLayouts: ["split_portrait", "full_centered_floating", "featured_overlay"],
  heroCarouselInterval: 8,
  location: "Kigali, Rwanda",
  contactEmail: "hello@princeparfait.com",
  whatsappNumber: "250792054846",
  phoneNumber: "+250 792 054 846",
  headerSocialLimit: 2,
  socialLinks: DEFAULT_SOCIAL_LINKS,
  heroSocialIds: ["linkedin", "github", "twitter", "instagram"],
  heroSocialLimit: 4,
  footerCompanyImage: "",
  footerCompanyImageDark: "",
  footerCompanyFit: "cover",
  footerCompanyHeight: "regular",
  footerCompanyAlign: "center",
  footerCompanyHref: "https://lerony.com",
  announcementText: "",
  announcementLink: "",
  announcementIsActive: false,
  heroGreeting: "Hi there, I'm",
  heroAvailableText: "Available for new projects",
  heroHeadline: "Building technology, products and ventures that turn ambitious ideas into real-world impact.",
  heroInviteLine: "Do you have a project?",
  heroInviteCtaLabel: "Let’s Talk",
  heroInviteCtaHref: "/contact",
  heroPrimaryCtaLabel: "View selected work",
  heroPrimaryCtaHref: "/projects",
  heroSecondaryCtaLabel: "About me",
  heroSecondaryCtaHref: "/about",
  heroCardLabel: "Founder & CEO",
  heroCardBody: "LERONY · Kigali",
  heroCardCtaLabel: "About me",
  heroCardCtaHref: "/about",
  heroStat1Value: "Founder & CEO",
  heroStat1Label: "LERONY · Kigali",
  heroStat2Value: "Kigali",
  heroStat2Label: "Rwanda",
  heroStat3Value: "2025",
  heroStat3Label: "Company founded",
  heroStat4Value: "Speaker",
  heroStat4Label: "Talks & training",
  hiddenHeroLayouts: [],
  identityRevision: 4,
};

export interface AnalyticsMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  totalPageviews: number;
  avgDuration: string;
  bounceRate: string;
  countryBreakdown: { country: string; flag: string; count: number; percentage: number }[];
  pageBreakdown: { path: string; name: string; views: number }[];
  deviceBreakdown: { device: string; icon: string; percentage: number }[];
  recentSessions: {
    id: string;
    time: string;
    country: string;
    flag: string;
    device: string;
    ip: string;
    pageCount: number;
    duration: string;
    utmSource?: string;
    utmCampaign?: string;
    pages: { path: string; name: string; time: string }[];
  }[];
  utmBreakdown: {
    source: string;
    medium: string;
    campaign: string;
    visits: number;
    percentage: number;
  }[];
  telemetryActive: boolean;
  changes: {
    totalVisitors: string;
    uniqueVisitors: string;
    totalPageviews: string;
    engagement: string;
  };
  error?: string;
}

const SETTINGS_STORAGE_KEY = "ppg_site_settings";
export const SIDEBAR_STORAGE_KEY = "ppg_sidebar_open";

const SETTINGS_IMAGE_KEYS = [
  "heroImageUrl",
  "heroImageSplit",
  "heroImageCentered",
  "heroImageOverlay",
  "footerCompanyImage",
  "footerCompanyImageDark",
] as const;

function stripEphemeralUrl(value: unknown) {
  if (typeof value !== "string") return value;
  if (value.startsWith("blob:")) return "";
  return value;
}

function stripSettingsBlobs<T extends Partial<SiteSettings>>(settings: T): T {
  const next = { ...settings };
  for (const key of SETTINGS_IMAGE_KEYS) {
    if (key in next) {
      (next as SiteSettings)[key] = stripEphemeralUrl((next as SiteSettings)[key]) as string;
    }
  }
  return next;
}

export function getLocalSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.bannerLayout === "split") parsed.bannerLayout = "split_portrait";
      if (parsed.bannerLayout === "tony_robbins") parsed.bannerLayout = "featured_overlay";
      if (parsed.bannerLayout === "portm") parsed.bannerLayout = "full_centered_floating";
      if ((parsed.identityRevision ?? 0) < 3) {
        const oldSubtitle = "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur";
        const oldBio = "I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.";
        const oldHeadline = "Software that creates impact.";
        if (!parsed.siteSubtitle || parsed.siteSubtitle === oldSubtitle) parsed.siteSubtitle = DEFAULT_SETTINGS.siteSubtitle;
        if (!parsed.bio || parsed.bio === oldBio || parsed.bio === "Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.") {
          parsed.bio = parsed.bio && parsed.bio !== oldBio ? parsed.bio : DEFAULT_SETTINGS.bio;
        }
        if (!parsed.heroHeadline || parsed.heroHeadline === oldHeadline) parsed.heroHeadline = DEFAULT_SETTINGS.heroHeadline;
        if (!parsed.heroSecondaryCtaLabel || parsed.heroSecondaryCtaLabel === "Contact") {
          parsed.heroSecondaryCtaLabel = DEFAULT_SETTINGS.heroSecondaryCtaLabel;
          parsed.heroSecondaryCtaHref = DEFAULT_SETTINGS.heroSecondaryCtaHref;
        }
        parsed.identityRevision = 3;
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
      }
      if (parsed.heroStat3Value === "Software Engineer" && parsed.heroStat3Label === "Full-stack & AI") {
        parsed.heroStat3Value = "2025";
        parsed.heroStat3Label = "Company founded";
      }
      if ((parsed.identityRevision ?? 0) < 4) {
        const previousRoles = "Founder · Entrepreneur · Technologist";
        const previousBio = "Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.";
        if (!parsed.siteSubtitle || parsed.siteSubtitle === previousRoles) {
          parsed.siteSubtitle = DEFAULT_SETTINGS.siteSubtitle;
        }
        if (!parsed.bio || parsed.bio === previousBio) parsed.bio = DEFAULT_SETTINGS.bio;
        parsed.identityRevision = 4;
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(parsed));
      }
      if (!parsed.socialLinks?.length) parsed.socialLinks = DEFAULT_SOCIAL_LINKS;
      const hadBlob = SETTINGS_IMAGE_KEYS.some((key) => typeof parsed[key] === "string" && parsed[key].startsWith("blob:"));
      const cleaned = stripSettingsBlobs(parsed);
      const merged = { ...DEFAULT_SETTINGS, ...cleaned };
      if (hadBlob) {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    }
  } catch (e) {
    console.error("Error reading site settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getLocalSettings();
  const updated = stripSettingsBlobs({ ...current, ...settings });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: updated }));
    } catch (e) {
      console.error("Error saving site settings:", e);
    }
    void persistSettingsRemote(updated);
  }
  return updated;
}

export async function persistSettingsRemote(settings: SiteSettings) {
  try {
    const payload = {
      banner_layout: settings.bannerLayout,
      site_title: settings.siteTitle,
      site_subtitle: settings.siteSubtitle,
      bio: settings.bio,
      location: settings.location,
      contact_email: settings.contactEmail,
      whatsapp_number: settings.whatsappNumber,
      header_social_limit: settings.headerSocialLimit,
      navbar_style: settings.navbarStyle,
      settings_json: settings,
      social_links: settings.socialLinks || DEFAULT_SOCIAL_LINKS,
      updated_at: new Date().toISOString(),
    };
    const { data } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();
    if (data?.id) {
      await supabase.from("site_settings").update(payload).eq("id", data.id);
    } else {
      await supabase.from("site_settings").insert(payload);
    }
  } catch (error) {
    console.error("Could not persist site settings remotely:", error);
  }
}

export async function fetchRemoteSettings(): Promise<SiteSettings | null> {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("settings_json, social_links, navbar_style, contact_email, whatsapp_number, location, site_title, site_subtitle, bio, header_social_limit, banner_layout")
      .limit(1)
      .maybeSingle();
    if (error || !data) return null;
    const json = (data.settings_json || {}) as Partial<SiteSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...json,
      bannerLayout: (json.bannerLayout || data.banner_layout || DEFAULT_SETTINGS.bannerLayout) as SiteSettings["bannerLayout"],
      navbarStyle: json.navbarStyle || data.navbar_style || DEFAULT_SETTINGS.navbarStyle,
      contactEmail: json.contactEmail || data.contact_email || DEFAULT_SETTINGS.contactEmail,
      whatsappNumber: json.whatsappNumber || data.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
      location: json.location || data.location || DEFAULT_SETTINGS.location,
      siteTitle: json.siteTitle || data.site_title || DEFAULT_SETTINGS.siteTitle,
      siteSubtitle: json.siteSubtitle || data.site_subtitle || DEFAULT_SETTINGS.siteSubtitle,
      bio: json.bio || data.bio || DEFAULT_SETTINGS.bio,
      headerSocialLimit: json.headerSocialLimit ?? data.header_social_limit ?? DEFAULT_SETTINGS.headerSocialLimit,
      socialLinks: json.socialLinks?.length ? json.socialLinks : data.social_links || DEFAULT_SOCIAL_LINKS,
    };
  } catch {
    return null;
  }
}
