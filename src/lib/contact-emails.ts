import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/supabase";
import { siteConfig } from "@/data/site-data";

export type ContactEmails = {
  primary: string;
  secondary: string;
  /** Unique non-empty addresses: primary first, then secondary when different. */
  all: string[];
};

/** Canonical public contact addresses from site settings (with static fallbacks). */
export function contactEmailsFrom(
  settings?: Pick<SiteSettings, "contactEmail" | "contactEmailSecondary"> | null,
): ContactEmails {
  const primary =
    (settings?.contactEmail || "").trim() ||
    DEFAULT_SETTINGS.contactEmail ||
    siteConfig.contact.email;
  const secondaryRaw =
    (settings?.contactEmailSecondary || "").trim() ||
    siteConfig.contact.emailSecondary ||
    "";
  const secondary = secondaryRaw && secondaryRaw.toLowerCase() !== primary.toLowerCase() ? secondaryRaw : "";
  return {
    primary,
    secondary,
    all: secondary ? [primary, secondary] : [primary],
  };
}

export function primaryEmail(
  settings?: Pick<SiteSettings, "contactEmail" | "contactEmailSecondary"> | null,
) {
  return contactEmailsFrom(settings).primary;
}

export function secondaryEmail(
  settings?: Pick<SiteSettings, "contactEmail" | "contactEmailSecondary"> | null,
) {
  return contactEmailsFrom(settings).secondary;
}
