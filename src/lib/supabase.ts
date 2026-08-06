import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://inykhcxyvzrxiysazhzq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlueWtoY3h5dnpyeGl5c2F6aHpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzI1NTEsImV4cCI6MjA5MzY0ODU1MX0.VuNYC8EKmg-eXyOvchi_Fuj1YHCbVHq6do5EwEqa8Ts";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type HeroLayoutType = "split" | "tony_robbins";

export interface SiteSettings {
  bannerLayout: HeroLayoutType;
  siteTitle: string;
  siteSubtitle: string;
  bio: string;
  location: string;
  contactEmail: string;
  whatsappNumber: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  bannerLayout: "split",
  siteTitle: "Prince Parfait GANZA",
  siteSubtitle: "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  bio: "I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.",
  location: "Kigali, Rwanda",
  contactEmail: "ganzaparfait7@gmail.com",
  whatsappNumber: "250792054846",
};

// Local storage key for instant persistence
const SETTINGS_STORAGE_KEY = "ppg_site_settings";

export function getLocalSettings(): SiteSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const cached = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (cached) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
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
      // Dispatch custom event for real-time reactivity in app
      window.dispatchEvent(new CustomEvent("site-settings-changed", { detail: updated }));
    } catch (e) {
      console.error("Error saving site settings:", e);
    }
  }
  return updated;
}
