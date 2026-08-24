"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  cleanPagePath,
  getStoredUtmAttribution,
  parseUtmFromSearchParams,
  resolveUtmAttribution,
} from "@/lib/utm";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef("");

  useEffect(() => {
    if (!pathname || pathname.startsWith("/dashboard")) return;

    const utm = resolveUtmAttribution(
      parseUtmFromSearchParams(searchParams),
      getStoredUtmAttribution()
    );
    const pagePath = cleanPagePath(pathname);
    const trackKey = `${pagePath}:${JSON.stringify(utm)}`;
    if (lastTracked.current === trackKey) return;
    lastTracked.current = trackKey;

    const payload = JSON.stringify({
      page_path: pagePath,
      referrer: typeof document !== "undefined" ? document.referrer || null : null,
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null,
      utm_term: utm.utm_term || null,
      utm_content: utm.utm_content || null,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([payload], { type: "application/json" })
      );
      return;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname, searchParams]);

  return null;
}
