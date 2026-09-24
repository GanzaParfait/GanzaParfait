/**
 * Google Calendar booking — single source of truth for public surfaces.
 * Dashboard settings (`bookingEnabled`, `bookingOptions`, legacy `bookingCalendarUrl`)
 * feed navbar, Contact, ⌘K, homepage booking, and BookCall.
 */

import { whatsappContactUrl } from "@/lib/whatsapp";

export const BOOKING_HOSTS = ["calendar.google.com", "calendar.app.google"] as const;

export const MAX_BOOKING_OPTIONS = 3;

export type BookingMeetingType = "Google Meet" | "Phone" | "In person" | "Other";

export type BookingClickSource =
  | "navbar"
  | "contact"
  | "command_palette"
  | "footer"
  | "homepage";

export type BookingOption = {
  id: string;
  label: string;
  durationMinutes: number;
  description: string;
  url: string;
  meetingType: BookingMeetingType | string;
  enabled: boolean;
  featured?: boolean;
};

export type BookingSettingsSlice = {
  bookingEnabled?: boolean;
  bookingCalendarUrl?: string;
  bookingOptions?: BookingOption[];
};

const DEFAULT_OPTION_ID = "meet-30";

export const DEFAULT_BOOKING_OPTION: BookingOption = {
  id: DEFAULT_OPTION_ID,
  label: "30-minute meeting",
  durationMinutes: 30,
  description: "Choose an available time that works for you.",
  url: "",
  meetingType: "Google Meet",
  enabled: true,
  featured: true,
};

/** Validate a public Google Calendar appointment URL. */
export function configuredBookingUrl(value?: string | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (!(BOOKING_HOSTS as readonly string[]).includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function slugId(label: string, index: number) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32);
  return base || `meet-${index + 1}`;
}

function coerceOption(raw: Partial<BookingOption> | null | undefined, index: number, fallbackUrl: string): BookingOption {
  const label = (raw?.label || DEFAULT_BOOKING_OPTION.label).trim() || DEFAULT_BOOKING_OPTION.label;
  const duration = Number(raw?.durationMinutes);
  const url =
    configuredBookingUrl(raw?.url) ||
    (index === 0 ? configuredBookingUrl(fallbackUrl) : null) ||
    "";
  return {
    id: (raw?.id || slugId(label, index)).trim() || `meet-${index + 1}`,
    label,
    durationMinutes: Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 30,
    description: (raw?.description || DEFAULT_BOOKING_OPTION.description).trim(),
    url,
    meetingType: (raw?.meetingType || "Google Meet").trim() || "Google Meet",
    enabled: raw?.enabled !== false,
    featured: index === 0 ? raw?.featured !== false : Boolean(raw?.featured),
  };
}

/**
 * Normalize legacy `bookingCalendarUrl` into `bookingOptions` (max 3).
 * Keeps `bookingCalendarUrl` mirrored to the primary public URL for compatibility.
 */
export function normalizeBookingSettings<T extends BookingSettingsSlice>(settings: T): T {
  const legacyUrl = configuredBookingUrl(settings.bookingCalendarUrl) || "";
  const incoming = Array.isArray(settings.bookingOptions) ? settings.bookingOptions : [];
  const options = (incoming.length ? incoming : [{ ...DEFAULT_BOOKING_OPTION, url: legacyUrl }])
    .slice(0, MAX_BOOKING_OPTIONS)
    .map((item, index) => coerceOption(item, index, legacyUrl));

  // Ensure at least one option exists after filtering empties from sparse arrays.
  const ensured = options.length ? options : [{ ...DEFAULT_BOOKING_OPTION, url: legacyUrl }];

  if (!ensured.some((item) => item.featured)) {
    ensured[0] = { ...ensured[0], featured: true };
  }

  const primary =
    ensured.find((item) => item.featured && item.enabled && configuredBookingUrl(item.url)) ||
    ensured.find((item) => item.enabled && configuredBookingUrl(item.url)) ||
    ensured[0];

  const mirrored = configuredBookingUrl(primary?.url) || legacyUrl || "";

  return {
    ...settings,
    bookingEnabled: settings.bookingEnabled !== false,
    bookingCalendarUrl: mirrored,
    bookingOptions: ensured.map((item) =>
      item.id === primary?.id ? { ...item, url: mirrored || item.url, featured: true } : { ...item, featured: false },
    ),
  };
}

/** Options that are on, have a valid public URL, and may be shown publicly. */
export function activeBookingOptions(settings: BookingSettingsSlice): BookingOption[] {
  const normalized = normalizeBookingSettings(settings);
  if (normalized.bookingEnabled === false) return [];
  return (normalized.bookingOptions || []).filter(
    (item) => item.enabled && Boolean(configuredBookingUrl(item.url)),
  );
}

export function isBookingAvailable(settings: BookingSettingsSlice): boolean {
  return activeBookingOptions(settings).length > 0;
}

export function primaryBookingOption(settings: BookingSettingsSlice): BookingOption | null {
  const active = activeBookingOptions(settings);
  if (!active.length) return null;
  return active.find((item) => item.featured) || active[0];
}

/** @deprecated Prefer primaryBookingOption / activeBookingOptions. */
export function bookingUrlFromSettings(settings: BookingSettingsSlice): string | null {
  return configuredBookingUrl(primaryBookingOption(settings)?.url);
}

export function bookingOptionMeta(option: BookingOption): string {
  const parts = [
    `${option.durationMinutes} minutes`,
    option.meetingType,
    "Scheduled through Google Calendar",
  ].filter(Boolean);
  return parts.join(" · ");
}

/** Fire a privacy-safe analytics beacon for booking clicks (no visitor PII). */
export function trackBookingClick(source: BookingClickSource) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    page_path: "/event/booking_click",
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    utm_content: source,
    utm_source: "booking",
    utm_medium: source,
  });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", new Blob([payload], { type: "application/json" }));
      return;
    }
    void fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    /* ignore analytics failures */
  }
}

export function openBookingLink(url: string, source: BookingClickSource) {
  const safe = configuredBookingUrl(url);
  if (!safe) return;
  trackBookingClick(source);
  window.open(safe, "_blank", "noopener,noreferrer");
}

export const WHATSAPP_CALL_URL =
  whatsappContactUrl("250792054846") ||
  "https://wa.me/250792054846?text=Hello%20Prince%20Parfait%20GANZA";
