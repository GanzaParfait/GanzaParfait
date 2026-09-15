"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  fetchRemoteSettings,
  type SiteSettings,
} from "@/lib/supabase";

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  initial,
  children,
}: {
  initial: SiteSettings;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SiteSettings>(initial);

  useEffect(() => {
    setSettings(initial);
  }, [initial]);

  useEffect(() => {
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<SiteSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener("site-settings-changed", onUpdate);

    void fetchRemoteSettings().then((remote) => {
      if (!remote) return;
      setSettings(remote);
      try {
        // Seed cache only when empty so unsaved dashboard drafts are not wiped.
        if (!localStorage.getItem("ppg_site_settings")) {
          localStorage.setItem("ppg_site_settings", JSON.stringify(remote));
        }
      } catch {}
    });

    return () => window.removeEventListener("site-settings-changed", onUpdate);
  }, []);

  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettingsContext() {
  return useContext(SiteSettingsContext);
}
