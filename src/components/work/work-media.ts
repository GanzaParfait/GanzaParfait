import type { Project } from "@/data/site-data";
import type { PreviewItem } from "@/components/ui/MediaPreview";

export const WORK_CATEGORY: Record<string, string> = {
  web: "Web app",
  mobile: "Mobile",
  ai: "AI-enabled",
  saas: "Company",
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

export function mediaForProject(project: Project | undefined, images: string[]): PreviewItem[] {
  const shots = images.map((src, index) => ({
    src,
    kind: "image" as const,
    caption: project?.screenshotCaptions?.[index],
  }));
  const videos = (project?.videos?.length ? project.videos : project?.video ? [project.video] : []).map((src) => ({
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
  const shots = (project.screenshots || []).filter((src) => src && !src.includes("placeholder"));
  if (shots[0]) return shots[0];
  if (project.image && !project.image.includes("placeholder")) return project.image;
  return "";
}

export function projectImages(project: Project) {
  const list = [
    ...(project.screenshots || []),
    ...(project.image ? [project.image] : []),
  ].filter((src, index, all) => src && !src.includes("placeholder") && all.indexOf(src) === index);
  return list;
}
