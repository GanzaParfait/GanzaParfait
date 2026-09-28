import type { Project } from "@/data/site-data";
import type { PreviewItem } from "@/components/ui/MediaPreview";
import { isVideoUrl } from "@/lib/projects";

export const WORK_CATEGORY: Record<string, string> = {
  web: "Web app",
  mobile: "Mobile",
  ai: "AI-enabled",
  saas: "Company",
  technology: "Technology & Innovation",
  "open-source": "Open source",
  systems: "Systems",
  product: "Product",
  other: "Other",
};

export function workCategoryLabel(project?: Project, fallback?: string) {
  if (!project) return fallback || "";
  if (project.category === "other" && project.categoryNote) return project.categoryNote;
  return WORK_CATEGORY[project.category] || fallback || "";
}

/** Homepage Selected Work badge label (prefer domain / work group). */
export function selectedWorkCategory(project?: Project, fallback?: string) {
  if (!project) return fallback || "";
  if (project.domain?.trim()) {
    const part = project.domain.split(/[&/·|]/)[0]?.trim();
    if (part) return part;
  }
  if (project.workGroup === "research") return "Research Technology";
  if (project.workGroup === "client") {
    return project.category === "systems" ? "Client Systems" : workCategoryLabel(project, fallback);
  }
  if (project.category === "web") return "Web Platform";
  if (project.category === "product") return "Product";
  return workCategoryLabel(project, fallback);
}

/** Accent tone for category pills on Selected Work cards. */
export function selectedWorkTone(project?: Project): "research" | "client" | "product" | "web" | "default" {
  if (!project) return "default";
  if (project.workGroup === "research" || /research/i.test(project.domain || "")) return "research";
  if (project.workGroup === "client" || project.category === "systems") return "client";
  if (project.workGroup === "ventures" || project.category === "product") return "product";
  if (project.category === "web") return "web";
  return "default";
}

function asMediaSrc(src: unknown) {
  return typeof src === "string" ? src.trim() : "";
}

function uniqueMedia(list: unknown[]) {
  const strings = list.map(asMediaSrc).filter((src) => src && !src.includes("placeholder"));
  return strings.filter((src, index) => strings.indexOf(src) === index);
}

/** Pinned media first (homepage / cards), then screenshots and cover. */
export function projectPreviewMedia(project?: Project): string[] {
  if (!project) return [];
  return uniqueMedia([
    ...(project.image ? [project.image] : []),
    ...(project.pinnedMedia || []),
    ...(project.screenshots || []),
  ]);
}

export function mediaForProject(project: Project | undefined, images: string[]): PreviewItem[] {
  const preferred = projectPreviewMedia(project);
  const ordered = uniqueMedia([...preferred, ...images]);
  const shots = ordered
    .filter((src) => !isVideoUrl(src))
    .map((src, index) => ({
      src,
      kind: "image" as const,
      caption: project?.screenshotCaptions?.[index],
    }));
  const fromPinnedVideos = (project?.pinnedMedia || []).filter(isVideoUrl);
  const fromVideos = project?.videos?.length ? project.videos : project?.video ? [project.video] : [];
  const videos = uniqueMedia([...fromPinnedVideos, ...fromVideos]).map((src) => ({
    src,
    kind: "video" as const,
  }));
  const seen = new Set<string>();
  return [...shots, ...videos].filter((item) => {
    if (!item.src || seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

/** Featured image (`image`) is the default cover. Pinned and screenshots follow. */
export function projectCover(project: Project) {
  const image = asMediaSrc(project.image);
  if (image && !image.includes("placeholder") && !isVideoUrl(image)) return image;
  const pinned = (project.pinnedMedia || []).map(asMediaSrc).find((src) => src && !src.includes("placeholder") && !isVideoUrl(src));
  if (pinned) return pinned;
  const shots = (project.screenshots || []).map(asMediaSrc).filter((src) => src && !src.includes("placeholder") && !isVideoUrl(src));
  return shots[0] || "";
}

/** Caption for a still, matched to the screenshot library when one exists. */
export function projectStillCaption(project: Project, src: string) {
  const shots = (project.screenshots || []).map(asMediaSrc);
  const index = shots.indexOf(src);
  if (index < 0) return "";
  return project.screenshotCaptions?.[index]?.trim() || "";
}

/** Extra stills from this project, excluding the cover. */
export function projectRelatedStills(project: Project, cover?: string, count = 2) {
  const current = cover || projectCover(project);
  return projectImages(project).filter((src) => src && src !== current).slice(0, count);
}

export function projectImages(project: Project) {
  return projectPreviewMedia(project).filter((src) => !isVideoUrl(src));
}
