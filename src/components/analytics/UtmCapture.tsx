"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { parseUtmFromSearchParams, persistUtmAttribution } from "@/lib/utm";

export default function UtmCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const utm = parseUtmFromSearchParams(searchParams);
    persistUtmAttribution(utm);
  }, [searchParams]);

  return null;
}
