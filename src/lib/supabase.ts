import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inykhcxyvzrxiysazhzq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWtoY3h5dnpyeGl5c2F6aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzI1NTEsImV4cCI6MjA5MzY0ODU1MX0.VuNYC8EKmg-eXyOvchi_Fuj1YHCbVHq6do5EwEqa8Ts";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HeroLayoutType = "split_portrait" | "featured_overlay";

export interface SiteSettings {
  bannerLayout: HeroLayoutType;
  siteTitle: string;
  siteSubtitle: string;
  bio: string;
  location: string;
  contactEmail: string;
  whatsappNumber: string;
  headerSocialLimit: number;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  bannerLayout: "split_portrait",
  siteTitle: "Prince Parfait GANZA",
  siteSubtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  bio: "I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.",
  location: "Kigali, Rwanda",
  contactEmail: "ganzaparfait7@gmail.com",
  whatsappNumber: "250792054846",
  headerSocialLimit: 3,
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
  recentLogs: { id: string; time: string; country: string; flag: string; page: string; device: string; ip: string }[];
}

export const MOCK_ANALYTICS: AnalyticsMetrics = {
  totalVisitors: 14850,
  uniqueVisitors: 9420,
  totalPageviews: 38200,
  avgDuration: "3m 42s",
  bounceRate: "34.2%",
  countryBreakdown: [
    { country: "Rwanda", flag: "🇷🇼", count: 6682, percentage: 45 },
    { country: "United States", flag: "🇺🇸", count: 3267, percentage: 22 },
    { country: "Kenya", flag: "🇰🇪", count: 1782, percentage: 12 },
    { country: "United Kingdom", flag: "🇬🇧", count: 1336, percentage: 9 },
    { country: "Germany", flag: "🇩🇪", count: 891, percentage: 6 },
    { country: "Others", flag: "🌍", count: 892, percentage: 6 },
  ],
  pageBreakdown: [
    { path: "/", name: "Homepage", views: 18450 },
    { path: "/projects", name: "Projects", views: 9200 },
    { path: "/about", name: "About", views: 5300 },
    { path: "/blog", name: "Blog Posts", views: 3400 },
    { path: "/contact", name: "Contact Page", views: 1850 },
  ],
  deviceBreakdown: [
    { device: "Mobile", icon: "mobile", percentage: 58 },
    { device: "Desktop", icon: "desktop", percentage: 38 },
    { device: "Tablet", icon: "tablet", percentage: 4 },
  ],
  recentLogs: [
    { id: "1", time: "2 mins ago", country: "Rwanda", flag: "🇷🇼", page: "/", device: "Mobile (Safari)", ip: "197.243.0.12" },
    { id: "2", time: "7 mins ago", country: "United States", flag: "🇺🇸", page: "/projects", device: "Desktop (Chrome)", ip: "104.28.192.4" },
    { id: "3", time: "14 mins ago", country: "Kenya", flag: "🇰🇪", page: "/", device: "Mobile (Chrome)", ip: "105.163.2.89" },
    { id: "4", time: "22 mins ago", country: "Rwanda", flag: "🇷🇼", page: "/blog/building-ai-africa", device: "Desktop (Firefox)", ip: "197.243.14.5" },
    { id: "5", time: "35 mins ago", country: "United Kingdom", flag: "🇬🇧", page: "/contact", device: "Desktop (Edge)", ip: "86.15.22.101" },
  ],
};

const SETTINGS_STORAGE_KEY = "ppg_site_settings";

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
