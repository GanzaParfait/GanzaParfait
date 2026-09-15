import type { AnnouncementMedia, AnnouncementSharePlatform, SiteSettings } from "@/lib/supabase";

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
  const saved = settings.announcementSharePlatforms?.filter((item) =>
    ANNOUNCEMENT_SHARE_OPTIONS.some((option) => option.id === item),
  );
  const list = saved?.length ? saved : DEFAULT_ANNOUNCEMENT_SHARE;
  return list.slice(0, 6);
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
