import { createClient } from "@supabase/supabase-js";
import { DEFAULT_SOCIAL_LINKS, type SocialLink } from "@/lib/socials";
import type { HomepageContent } from "@/lib/homepage";
import type { ContactPageContent } from "@/lib/contact-page";
import type { AboutPageContent } from "@/lib/about-page";
import type { ServicesPageContent } from "@/lib/services-page";
import type { Project } from "@/data/site-data";

export type AnnouncementSharePlatform = "linkedin" | "twitter" | "facebook" | "whatsapp" | "link";
export type AnnouncementBarPosition = "top" | "bottom";

export type AnnouncementMedia = {
  id: string;
  type: "image" | "video" | "document";
  url: string;
  poster?: string;
  name?: string;
};

export type ProjectRecord = Project;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inykhcxyvzrxiysazhzq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWtoY3h5dnpyeGl5c2F6aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzI1NTEsImV4cCI6MjA5MzY0ODU1MX0.VuNYC8EKmg-eXyOvchi_Fuj1YHCbVHq6do5EwEqa8Ts";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HeroLayoutType = "split_portrait" | "featured_overlay" | "full_centered_floating";

export type NavbarStyle = "full" | "pill";

export type FooterCompanyFit = "contain" | "cover";
export type FooterCompanyHeight = "compact" | "regular" | "tall";
export type FooterCompanyAlign = "left" | "center";
export type EmailHeaderLayout = "brand_tagline" | "nav_socials" | "banner" | "profile";

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
  /** Focal point for the footer band image (0–100). */
  footerCompanyPositionX?: number;
  footerCompanyPositionY?: number;
  footerCompanyWholeImage?: boolean;
  footerCompanyZoom?: number;
  footerCompanyMediaType?: "image" | "video" | "carousel";
  footerCompanyMedia?: string[];
  footerCompanyCarouselInterval?: number;
  /** Optional footer copy toggles / fields (empty text stays hidden). */
  footerShowBio?: boolean;
  footerShowEmail?: boolean;
  footerShowPhone?: boolean;
  footerShowLocation?: boolean;
  footerShowQuote?: boolean;
  footerQuote?: string;
  footerQuoteAttribution?: string;
  footerShowFeaturedCopy?: boolean;
  footerFeaturedEyebrow?: string;
  footerFeaturedTitle?: string;
  footerFeaturedDetail?: string;
  footerFeaturedCtaLabel?: string;
  footerShowPrivacy?: boolean;
  footerShowSitemap?: boolean;
  bookingCalendarUrl?: string;
  announcementText?: string;
  announcementLink?: string;
  announcementCtaLabel?: string;
  announcementImage?: string;
  announcementDetail?: string;
  announcementIsActive?: boolean;
  announcementEyebrow?: string;
  announcementHeadline?: string;
  announcementDate?: string;
  announcementTime?: string;
  announcementPlace?: string;
  announcementLayout?: "side" | "stack";
  announcementMedia?: AnnouncementMedia[];
  announcementSecondaryLabel?: string;
  announcementSecondaryHref?: string;
  announcementShare?: boolean;
  announcementSharePlatforms?: AnnouncementSharePlatform[];
  announcementClosing?: string;
  announcementInterval?: number;
  announcementBarPosition?: AnnouncementBarPosition;
  announcementMediaKicker?: string;
  announcementMediaTitle?: string;
  announcementAudience?: string;
  homepage?: HomepageContent;
  contactPage?: ContactPageContent;
  aboutPage?: AboutPageContent;
  servicesPage?: ServicesPageContent;
  projectRecords?: ProjectRecord[];
  /** Outbound email branding (thanks, contact, newsletter shell). */
  emailHeaderLayout?: EmailHeaderLayout;
  emailShowSignature?: boolean;
  emailSignatureQuote?: string;
  emailShowSocials?: boolean;
  emailShowPhone?: boolean;
  emailPrimaryColor?: string;
  emailTagline?: string;
  emailBannerKicker?: string;
  emailBannerHeadline?: string;
  emailHeaderNav?: string;
  emailFooterNote?: string;
  emailWelcomeEyebrow?: string;
  emailWelcomeTitle?: string;
  emailWelcomeBody?: string;
  emailWelcomeFeatures?: string;
  emailWelcomeCtaLabel?: string;
  emailNewsletterEyebrow?: string;
  emailNewsletterTitle?: string;
  emailNewsletterBody?: string;
  emailNewsletterCtaLabel?: string;
  emailNewsletterImageUrl?: string;
  emailContactBadge?: string;
  emailContactTip?: string;
  emailPreferencesUrl?: string;
  emailUnsubscribeUrl?: string;
  emailPortraitUrl?: string;
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
  /** CV / Resume formats, public default, and CV-only overrides (stored in settings_json). */
  cvConfig?: import("@/lib/cv").CvConfig;
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
  footerCompanyPositionX: 50,
  footerCompanyPositionY: 40,
  footerCompanyWholeImage: false,
  footerCompanyZoom: 100,
  footerCompanyMediaType: "image",
  footerCompanyMedia: [],
  footerCompanyCarouselInterval: 5,
  footerShowBio: true,
  footerShowEmail: true,
  footerShowPhone: true,
  footerShowLocation: true,
  footerShowQuote: false,
  footerQuote: "",
  footerQuoteAttribution: "",
  footerShowFeaturedCopy: false,
  footerFeaturedEyebrow: "Featured",
  footerFeaturedTitle: "",
  footerFeaturedDetail: "",
  footerFeaturedCtaLabel: "Follow the journey",
  footerShowPrivacy: true,
  footerShowSitemap: true,
  bookingCalendarUrl: "",
  announcementIsActive: true,
  announcementText: "New Achievement... Event to be held at Kigali Marriott Hotel.!",
  announcementLink: "/contact",
  announcementCtaLabel: "View Event Details",
  announcementEyebrow: "Announcement",
  announcementHeadline: "New Achievement... Event to be held at Kigali Marriott Hotel.!",
  announcementDetail:
    "Join leaders, innovators, and change-makers for an evening focused on technology and impact across Africa.",
  announcementDate: "Saturday, Sep 20, 2026",
  announcementTime: "2:00 PM (GMT+2)",
  announcementPlace: "Kigali Marriott Hotel, Kigali, Rwanda",
  announcementLayout: "side",
  announcementSecondaryLabel: "Add to Calendar",
  announcementSecondaryHref: "",
  announcementShare: true,
  announcementSharePlatforms: ["linkedin", "twitter", "facebook", "whatsapp", "link"],
  announcementClosing: "See you there! 👋",
  announcementInterval: 5,
  announcementBarPosition: "top",
  announcementMediaKicker: "Speak · Learn · Connect",
  announcementMediaTitle: "Building Impact Together",
  announcementAudience: "Leaders · Innovators · Change-makers",
  announcementMedia: [],
  emailHeaderLayout: "brand_tagline",
  emailShowSignature: true,
  emailSignatureQuote: "I only send something when there is something worth sharing.",
  emailShowSocials: true,
  emailShowPhone: true,
  emailPrimaryColor: "#0E52AB",
  emailTagline: "Ideas. Projects. Real Impact.",
  emailBannerKicker: "Turning ideas into",
  emailBannerHeadline: "Real solutions",
  emailHeaderNav: "About|/about\nContact|/contact",
  emailFooterNote: "",
  emailWelcomeEyebrow: "Welcome aboard",
  emailWelcomeTitle: "Thanks for joining!",
  emailWelcomeBody: "You are on the list for notes from a founder, entrepreneur and technologist — published only when there is something worth saying.",
  emailWelcomeFeatures: "Ideas & perspectives\nSelected projects & case studies\nImportant announcements\nOpportunities and collaborations",
  emailWelcomeCtaLabel: "Explore princeparfait.com →",
  emailNewsletterEyebrow: "From the desk",
  emailNewsletterTitle: "Ideas. Projects. Real Impact.",
  emailNewsletterBody: "Updates on software, systems, and work that turns complex needs into something people can use.",
  emailNewsletterCtaLabel: "Read the latest on the site →",
  emailNewsletterImageUrl: "",
  emailContactBadge: "New contact message",
  emailContactTip: "Quick tip: Reply directly to this email or use the Control Center to manage this conversation, add notes, or convert it to a project.",
  emailPreferencesUrl: "/contact",
  emailUnsubscribeUrl: "/contact",
  emailPortraitUrl: "/images/profile/prince-parfait-ganza-kigali-rwanda.webp",
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
  pageBreakdown: { path: string; name: string; views: number; percentage?: number }[];
  deviceBreakdown: { device: string; icon: string; percentage: number; count?: number }[];
  recentSessions: {
    id: string;
    time: string;
    country: string;
    flag: string;
    city?: string;
    region?: string;
    latitude?: number | null;
    longitude?: number | null;
    device: string;
    browser?: string;
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
  series: { date: string; label: string; sessions: number; visitors: number; pageviews: number }[];
  previousSeries: { date: string; label: string; sessions: number; visitors: number; pageviews: number }[];
  sparklines: {
    sessions: number[];
    visitors: number[];
    pageviews: number[];
    duration: number[];
  };
  range: {
    preset: string;
    from: string;
    to: string;
    label: string;
  };
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

/** Mirror server settings into localStorage so dashboard/public stay aligned. */
export function cacheLocalSettings(settings: SiteSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(stripSettingsBlobs(settings)));
  } catch (e) {
    console.error("Error caching site settings:", e);
  }
}

/** Drop the browser settings draft (does not delete Supabase). */
export function clearLocalSettingsCache() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    localStorage.removeItem("ppg_dashboard_projects");
  } catch {}
}

/**
 * Save settings locally and sync to Supabase. Throws if the remote write fails
 * so the dashboard can surface the error instead of looking “saved” only locally.
 */
export async function saveLocalSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const current = getLocalSettings();
  const updated = stripSettingsBlobs({ ...current, ...settings });
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: updated }));
    } catch (e) {
      console.error("Error saving site settings:", e);
    }
    await persistSettingsRemote(updated);
  }
  return updated;
}

export async function persistSettingsRemote(settings: SiteSettings) {
  const res = await fetch("/api/settings", {
    method: "PUT",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || res.statusText || "Could not sync settings to the server.");
  }
}

export async function fetchRemoteSettings(): Promise<SiteSettings | null> {
  try {
    const res = await fetch("/api/settings", {
      cache: "no-store",
      credentials: "same-origin",
      headers: { "Cache-Control": "no-cache" },
    });
    if (!res.ok) return null;
    const remote = (await res.json()) as SiteSettings;
    cacheLocalSettings({ ...DEFAULT_SETTINGS, ...remote });
    return { ...DEFAULT_SETTINGS, ...remote };
  } catch {
    return null;
  }
}
