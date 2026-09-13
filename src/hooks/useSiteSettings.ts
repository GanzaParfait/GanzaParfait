"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  fetchRemoteSettings,
  getLocalSettings,
  type SiteSettings,
} from "@/lib/supabase";

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() =>
    typeof window === "undefined" ? DEFAULT_SETTINGS : getLocalSettings()
  );

  useEffect(() => {
    setSettings(getLocalSettings());

    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<SiteSettings>).detail;
      if (detail) setSettings(detail);
    };
    window.addEventListener("site-settings-changed", onUpdate);

    void fetchRemoteSettings().then((remote) => {
      if (!remote) return;
      try {
        if (localStorage.getItem("ppg_site_settings")) return;
      } catch {}
      setSettings(remote);
    });

    return () => window.removeEventListener("site-settings-changed", onUpdate);
  }, []);

  return settings;
}
