"use client";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { setting } from "@/lib/hero";
import { socialByPlatform } from "@/lib/socials";

export function PublicEmail({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const settings = useSiteSettings();
  const email = setting(settings, "contactEmail");
  return (
    <a href={`mailto:${email}`} className={className} style={style}>
      {email}
    </a>
  );
}

export function PublicSocialAnchor({
  platform,
  className,
  children,
  style,
}: {
  platform: string;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const settings = useSiteSettings();
  const link = socialByPlatform(settings, platform);
  if (!link) return null;
  return (
    <a href={link.url} target="_blank" rel="noopener noreferrer" className={className} style={style} aria-label={link.label}>
      {children}
    </a>
  );
}
