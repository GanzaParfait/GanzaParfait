import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inykhcxyvzrxiysazhzq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWtoY3h5dnpyeGl5c2F6aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzI1NTEsImV4cCI6MjA5MzY0ODU1MX0.VuNYC8EKmg-eXyOvchi_Fuj1YHCbVHq6do5EwEqa8Ts";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HeroLayoutType = "split_portrait" | "featured_overlay" | "full_centered_floating";

export interface SiteSettings {
  bannerLayout: HeroLayoutType;
  heroImageUrl?: string;
  siteTitle: string;
  siteSubtitle: string;
  bio: string;
  location: string;
  contactEmail: string;
  whatsappNumber: string;
  headerSocialLimit: number;
  announcementText?: string;
  announcementLink?: string;
  announcementIsActive?: boolean;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  bannerLayout: "split_portrait",
  heroImageUrl: "/images/profile/hero-photo.png",
  siteTitle: "Prince Parfait GANZA",
  siteSubtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  bio: "I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.",
  location: "Kigali, Rwanda",
  contactEmail: "ganzaparfait7@gmail.com",
  whatsappNumber: "250792054846",
  headerSocialLimit: 3,
  announcementText: "🚀 Exciting news! The TUT Labs Platform is now live.",
  announcementLink: "/projects",
  announcementIsActive: false,
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

export function getLocalSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Migrate old brand layout names if present
      if (parsed.bannerLayout === "split") parsed.bannerLayout = "split_portrait";
      if (parsed.bannerLayout === "tony_robbins") parsed.bannerLayout = "featured_overlay";
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error("Error reading site settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function saveLocalSettings(settings: Partial<SiteSettings>): SiteSettings {
  const current = getLocalSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: updated }));
    } catch (e) {
      console.error("Error saving site settings:", e);
    }
  }
  return updated;
}
