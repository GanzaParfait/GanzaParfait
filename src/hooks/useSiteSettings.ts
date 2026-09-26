"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  fetchRemoteSettings,
  getLocalSettings,
  type SiteSettings,
} from "@/lib/supabase";
import { useSiteSettingsContext } from "@/components/providers/SiteSettingsProvider";

/**
 * Public UI settings. Prefer server-provided context so the first paint matches the database.
 * Falls back to local/defaults only outside the provider (e.g. dashboard tools).
 */
export function useSiteSettings() {
  const fromServer = useSiteSettingsContext();
  // Always start from defaults so SSR and the first client paint match.
  // Local/remote overrides apply only after mount when no server context exists.
  const [fallback, setFallback] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (fromServer) return;

    setFallback(getLocalSettings());
    const onUpdate = (event: Event) => {
      const detail = (event as CustomEvent<SiteSettings>).detail;
      if (detail) setFallback(detail);
    };
    window.addEventListener("site-settings-changed", onUpdate);

    void fetchRemoteSettings().then((remote) => {
      if (!remote) return;
      setFallback(remote);
    });

    return () => window.removeEventListener("site-settings-changed", onUpdate);
  }, [fromServer]);

  return fromServer || fallback;
}
