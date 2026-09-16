import type { AnnouncementMedia, AnnouncementSharePlatform, SiteSettings } from "@/lib/supabase";
import { resolvedSocials } from "@/lib/socials";

export const ANNOUNCEMENT_SHARE_OPTIONS: { id: AnnouncementSharePlatform; label: string }[] = [
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "link", label: "Copy link" },
];

export const DEFAULT_ANNOUNCEMENT_SHARE: AnnouncementSharePlatform[] = [
  "linkedin",
  "twitter",
  "facebook",
  "whatsapp",
  "link",
];

const SHAREABLE_PLATFORMS = new Set<AnnouncementSharePlatform>(["linkedin", "twitter", "facebook", "whatsapp"]);

/** Share options drawn from enabled site socials (+ copy link). */
export function announcementShareOptionsFromSettings(settings: SiteSettings): { id: AnnouncementSharePlatform; label: string }[] {
  const fromSite = resolvedSocials(settings)
    .filter((link) => link.enabled && link.url && SHAREABLE_PLATFORMS.has(link.platform as AnnouncementSharePlatform))
    .map((link) => ({
      id: link.platform as AnnouncementSharePlatform,
      label: link.label || ANNOUNCEMENT_SHARE_OPTIONS.find((option) => option.id === link.platform)?.label || link.platform,
    }));

  const unique = new Map<AnnouncementSharePlatform, { id: AnnouncementSharePlatform; label: string }>();
  for (const option of fromSite) unique.set(option.id, option);
  unique.set("link", { id: "link", label: "Copy link" });

  const ordered = ANNOUNCEMENT_SHARE_OPTIONS.map((option) => unique.get(option.id)).filter(Boolean) as {
    id: AnnouncementSharePlatform;
    label: string;
  }[];
  return ordered.length ? ordered : ANNOUNCEMENT_SHARE_OPTIONS;
}

export const ANNOUNCEMENT_SHARE_MAX = 5;

export function mediaKind(url: string): AnnouncementMedia["type"] {
  if (/\.(mp4|webm|mov|m4v|ogg)(\?|$)/i.test(url)) return "video";
  if (/\.(pdf|docx?|xlsx?|pptx?|csv|txt|md|zip|rtf|odt|ods|odp)(\?|$)/i.test(url)) return "document";
  return "image";
}

export function announcementMedia(settings: SiteSettings): AnnouncementMedia[] {
  const saved = (settings.announcementMedia || []).filter((item) => item.url && !item.url.startsWith("blob:"));
  if (saved.length) return saved;
  if (settings.announcementImage && !settings.announcementImage.startsWith("blob:")) {
    return [{ id: "cover", type: mediaKind(settings.announcementImage), url: settings.announcementImage }];
  }
  return [];
}

export function fileName(url: string) {
  try {
    const path = url.split("?")[0].split("/").pop() || "Document";
    return decodeURIComponent(path);
  } catch {
    return "Document";
  }
}

export function announcementSharePlatforms(settings: SiteSettings): AnnouncementSharePlatform[] {
  const allowed = new Set(announcementShareOptionsFromSettings(settings).map((option) => option.id));
  const saved = settings.announcementSharePlatforms?.filter((item) => allowed.has(item));
  const list = saved?.length ? saved : DEFAULT_ANNOUNCEMENT_SHARE.filter((item) => allowed.has(item));
  return list.slice(0, ANNOUNCEMENT_SHARE_MAX);
}

export function shouldAutoOpenAnnouncement(search: string): boolean {
  try {
    const params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`);
    if (params.get("announce") === "1" || params.get("announcement") === "open") return true;
    const campaign = (params.get("utm_campaign") || "").toLowerCase();
    const content = (params.get("utm_content") || "").toLowerCase();
    return campaign === "announcement" || content === "announcement" || content === "open_announcement";
  } catch {
    return false;
  }
}

export function announcementSharePath(pathname = "/"): string {
  const path = pathname.split("?")[0].split("#")[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatGoogleDate(date: Date) {
  return (
    `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}` +
    `T${pad2(date.getUTCHours())}${pad2(date.getUTCMinutes())}${pad2(date.getUTCSeconds())}Z`
  );
}

function parseAnnouncementStart(settings: SiteSettings): Date | null {
  const dateText = settings.announcementDate?.trim() || "";
  const timeText = settings.announcementTime?.trim() || "";
  if (!dateText) return null;

  const cleanedTime = timeText.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const candidates = [
    `${dateText} ${cleanedTime}`.trim(),
    dateText.replace(/^[A-Za-z]+,\s*/, ""),
    dateText,
  ];

  for (const candidate of candidates) {
    const withTime = cleanedTime && !candidate.includes(cleanedTime) ? `${candidate} ${cleanedTime}` : candidate;
    const parsed = new Date(withTime);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const monthMatch = dateText.match(
    /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2}),?\s+(\d{4})/i
  );
  if (monthMatch) {
    const base = new Date(`${monthMatch[0]}`);
    if (!Number.isNaN(base.getTime())) {
      const match = cleanedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
      if (match) {
        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const meridiem = match[3]?.toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        base.setHours(hours, minutes, 0, 0);
      }
      return base;
    }
  }

  return null;
}

/** Builds Google Calendar + ICS targets from announcement event fields. */
export function announcementCalendarTargets(settings: SiteSettings) {
  const start = parseAnnouncementStart(settings);
  if (!start) return null;

  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const title =
    settings.announcementHeadline?.trim() ||
    settings.announcementText?.trim() ||
    "Event";
  const details = settings.announcementDetail?.trim() || "";
  const location = settings.announcementPlace?.trim() || "";
  const startStamp = formatGoogleDate(start);
  const endStamp = formatGoogleDate(end);

  const google = new URL("https://calendar.google.com/calendar/render");
  google.searchParams.set("action", "TEMPLATE");
  google.searchParams.set("text", title);
  google.searchParams.set("dates", `${startStamp}/${endStamp}`);
  if (details) google.searchParams.set("details", details);
  if (location) google.searchParams.set("location", location);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//princeparfait.com//Announcement//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${title.replace(/\n/g, " ")}`,
    details ? `DESCRIPTION:${details.replace(/\n/g, "\\n")}` : "",
    location ? `LOCATION:${location.replace(/\n/g, " ")}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");

  return {
    google: google.toString(),
    ics,
    fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event"}.ics`,
  };
}
