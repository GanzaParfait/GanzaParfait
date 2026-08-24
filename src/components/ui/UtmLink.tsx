"use client";

import Link from "next/link";
import { useMemo } from "react";
import { appendStoredUtmToUrl } from "@/lib/utm";
import type { ComponentProps } from "react";

type UtmLinkProps = ComponentProps<typeof Link> & {
  preserveUtm?: boolean;
};

export default function UtmLink({ href, preserveUtm = true, ...props }: UtmLinkProps) {
  const resolvedHref = useMemo(() => {
    if (!preserveUtm || typeof href !== "string" || !href.startsWith("/")) return href;
    if (typeof window === "undefined") return href;
    return appendStoredUtmToUrl(`${window.location.origin}${href}`).replace(window.location.origin, "");
  }, [href, preserveUtm]);

  return <Link href={resolvedHref} {...props} />;
}
