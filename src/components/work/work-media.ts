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

function uniqueMedia(list: string[]) {
  return list.filter((src, index, all) => src && !src.includes("placeholder") && all.indexOf(src) === index);
}

/** Pinned media first (homepage / cards), then screenshots and cover. */
export function projectPreviewMedia(project?: Project): string[] {
  if (!project) return [];
  return uniqueMedia([
    ...(project.pinnedMedia || []),
    ...(project.screenshots || []),
    ...(project.image ? [project.image] : []),
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

export function projectCover(project: Project) {
  const pinned = (project.pinnedMedia || []).find((src) => src && !src.includes("placeholder") && !isVideoUrl(src));
  if (pinned) return pinned;
  const shots = (project.screenshots || []).filter((src) => src && !src.includes("placeholder"));
  if (shots[0]) return shots[0];
  if (project.image && !project.image.includes("placeholder")) return project.image;
  return "";
}

export function projectImages(project: Project) {
  return projectPreviewMedia(project).filter((src) => !isVideoUrl(src));
}
