"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cleanBrowserUrl, correctAttribution, parseUtmFromSearchParams, persistUtmAttribution } from "@/lib/utm";

export default function UtmCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utm = correctAttribution(parseUtmFromSearchParams(searchParams), document.referrer);
    persistUtmAttribution(utm);
    cleanBrowserUrl();
  }, [searchParams]);

  return null;
}
