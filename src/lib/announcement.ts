import type { AnnouncementMedia, SiteSettings } from "@/lib/supabase";

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
