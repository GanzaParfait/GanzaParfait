import { projects as seedProjects, type Project } from "@/data/site-data";
import { getServerSiteSettings } from "@/lib/site-settings-server";

/** Merge verified seed projects with dashboard/Supabase overrides and extras. */
export function mergeProjectCatalog(records?: Project[] | null): Project[] {
  const byId = new Map<string, Project>();
  for (const project of seedProjects) {
    byId.set(project.id, project);
  }
  for (const record of records || []) {
    if (!record?.id) continue;
    const base = byId.get(record.id);
    byId.set(
      record.id,
      base
        ? {
            ...base,
            ...record,
            title: record.title || base.title,
            description: record.description || base.description,
            links: { ...base.links, ...record.links },
            technologies: record.technologies?.length ? record.technologies : base.technologies,
          }
        : record,
    );
  }

  const ordered = seedProjects.map((project) => byId.get(project.id)!);
  const extras = [...byId.values()].filter(
    (project) => !seedProjects.some((seed) => seed.id === project.id),
  );
  return [...ordered, ...extras];
}

export async function getPublicProjects(): Promise<Project[]> {
  const settings = await getServerSiteSettings();
  return mergeProjectCatalog(settings.projectRecords);
}

export async function getPublicProject(id: string): Promise<Project | null> {
  const list = await getPublicProjects();
  return list.find((project) => project.id === id) || null;
}

export function isVideoUrl(src: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src) || src.includes("/video/");
}
