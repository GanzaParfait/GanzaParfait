import { projects as seedProjects, type Project } from "@/data/site-data";
import { getServerSiteSettings } from "@/lib/site-settings-server";

const TEAM_DELIVERY_IDS = new Set([
  "ngazi-construction",
  "la-fontaine",
  "kt-computer-supplying",
]);

const FORBIDDEN_COLLABORATOR = /digne|nurukundo/i;
const FORBIDDEN_ATTRIBUTION = /digne|nurukundo|primary developer/i;

/** Strip tracking params from external project URLs before store/publish. */
export function canonicalizeExternalUrl(url: string | undefined | null): string | undefined {
  const raw = (url || "").trim();
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    const drop = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
    for (const key of drop) parsed.searchParams.delete(key);
    const qs = parsed.searchParams.toString();
    return `${parsed.origin}${parsed.pathname}${qs ? `?${qs}` : ""}${parsed.hash}`;
  } catch {
    return raw.split("?")[0] || raw;
  }
}

/**
 * Normalize stale attribution so Dashboard/Supabase cannot reintroduce Digne credits
 * or keep GOA+ as an unverified draft after the confirmed Co-Founder & CTO update.
 */
export function sanitizeProjectAttribution(project: Project): Project {
  const seed = seedProjects.find((item) => item.id === project.id);
  let next: Project = { ...project };

  const collaborators = (next.collaborators || []).filter(
    (person) => !FORBIDDEN_COLLABORATOR.test(`${person.name} ${person.role || ""}`),
  );
  next.collaborators = collaborators.length ? collaborators : undefined;

  if (TEAM_DELIVERY_IDS.has(next.id) && seed) {
    const dirty = FORBIDDEN_ATTRIBUTION.test(
      [
        next.description,
        next.longDescription,
        next.whatIBuilt,
        next.contributionSummary,
        next.solution,
        next.challenge,
        ...(next.highlights || []),
      ]
        .filter(Boolean)
        .join("\n"),
    );
    next = {
      ...next,
      collaborators: undefined,
      myRole: seed.myRole,
      contribution: seed.contribution,
      contributionSummary: seed.contributionSummary,
      deliveredThrough: seed.deliveredThrough || next.deliveredThrough,
      workGroup: seed.workGroup || next.workGroup,
      ...(dirty
        ? {
            description: seed.description,
            longDescription: seed.longDescription,
            whatIBuilt: seed.whatIBuilt,
            context: seed.context,
            challenge: seed.challenge,
            solution: seed.solution,
            highlights: seed.highlights,
            features: seed.features,
            capabilities: seed.capabilities,
            technologies: seed.technologies,
            outcome: seed.outcome,
          }
        : {}),
    };
  }

  if (next.id === "goa-plus" && seed) {
    const roleMissing = !/co-founder/i.test(next.myRole || "");
    const stillDraft = (next.visibility || "public") === "draft";
    if (roleMissing || stillDraft || !next.longDescription?.trim()) {
      next = {
        ...seed,
        ...next,
        title: seed.title,
        myRole: seed.myRole,
        contribution: seed.contribution,
        contributionSummary: seed.contributionSummary,
        domain: seed.domain,
        workGroup: seed.workGroup,
        category: seed.category,
        status: seed.status,
        visibility: "public",
        featured: seed.featured,
        description: seed.description,
        longDescription: seed.longDescription,
        whatIBuilt: seed.whatIBuilt,
        context: seed.context,
        challenge: seed.challenge,
        solution: seed.solution,
        highlights: seed.highlights,
        features: seed.features,
        capabilities: seed.capabilities,
        seoTitle: seed.seoTitle,
        seoDescription: seed.seoDescription,
        links: { ...seed.links, ...next.links, live: seed.links.live },
        deliveredThrough: undefined,
        collaborators: undefined,
      };
    }
  }

  // Never publish ownership percentages / cap-table language.
  const ownershipLeak = /\b\d+\s*%\b|shareholder|cap[\s-]?table|equity stake/i;
  for (const key of ["description", "longDescription", "contributionSummary", "whatIBuilt", "outcome"] as const) {
    const value = next[key];
    if (typeof value === "string" && ownershipLeak.test(value) && seed?.[key]) {
      next = { ...next, [key]: seed[key] };
    }
  }

  return next;
}

export function normalizeProjectRecord(project: Project): Project {
  const cleaned = sanitizeProjectAttribution(project);
  const live = canonicalizeExternalUrl(cleaned.links?.live);
  const github = canonicalizeExternalUrl(cleaned.links?.github);
  const caseStudy = canonicalizeExternalUrl(cleaned.links?.case_study);
  const organizationUrl = canonicalizeExternalUrl(cleaned.organizationUrl);
  return {
    ...cleaned,
    organizationUrl,
    visibility: cleaned.visibility || "public",
    links: {
      ...cleaned.links,
      ...(live ? { live } : { live: undefined }),
      ...(github ? { github } : { github: undefined }),
      ...(caseStudy ? { case_study: caseStudy } : {}),
    },
  };
}

/** Listed on /projects, sitemap, and search. */
export function isProjectListed(project: Project): boolean {
  const visibility = project.visibility || "public";
  return visibility === "public";
}

/** Reachable at /projects/[id] (public + unlisted). Drafts stay dashboard-only. */
export function isProjectRoutable(project: Project): boolean {
  const visibility = project.visibility || "public";
  return visibility === "public" || visibility === "unlisted";
}

export function isProjectIndexable(project: Project): boolean {
  if (!isProjectListed(project)) return false;
  if (project.status === "archived") return false;
  const hasSubstance = Boolean(
    project.description?.trim() &&
      (project.longDescription?.trim() || project.whatIBuilt?.trim() || project.contributionSummary?.trim()) &&
      (project.technologies?.length || project.myRole),
  );
  return hasSubstance;
}

/** Merge verified seed projects with dashboard/Supabase overrides and extras. */
export function mergeProjectCatalog(records?: Project[] | null): Project[] {
  const byId = new Map<string, Project>();
  for (const project of seedProjects) {
    byId.set(project.id, normalizeProjectRecord(project));
  }
  for (const record of records || []) {
    if (!record?.id) continue;
    const base = byId.get(record.id);
    const merged = base
      ? {
          ...base,
          ...record,
          title: record.title || base.title,
          description: record.description || base.description,
          links: { ...base.links, ...record.links },
          technologies: record.technologies?.length ? record.technologies : base.technologies,
          capabilities: record.capabilities?.length ? record.capabilities : base.capabilities,
          // Allow clearing collaborators with an explicit empty array from Dashboard/migration.
          collaborators: Array.isArray(record.collaborators)
            ? record.collaborators
            : base.collaborators,
        }
      : record;
    byId.set(record.id, normalizeProjectRecord(merged));
  }

  const ordered = seedProjects.map((project) => byId.get(project.id)!);
  const extras = [...byId.values()].filter(
    (project) => !seedProjects.some((seed) => seed.id === project.id),
  );
  return [...ordered, ...extras];
}

export function listListedProjects(records?: Project[] | null): Project[] {
  return mergeProjectCatalog(records).filter(isProjectListed);
}

export function projectsForTechnology(technology: string, records?: Project[] | null): Project[] {
  const needle = technology.trim().toLowerCase();
  if (!needle) return [];
  return listListedProjects(records).filter((project) =>
    (project.technologies || []).some((item) => item.toLowerCase() === needle),
  );
}

export async function getPublicProjects(): Promise<Project[]> {
  const settings = await getServerSiteSettings();
  return listListedProjects(settings.projectRecords);
}

export async function getIndexableProjects(): Promise<Project[]> {
  const projects = await getPublicProjects();
  return projects.filter(isProjectIndexable);
}

export async function getPublicProject(id: string): Promise<Project | null> {
  const settings = await getServerSiteSettings();
  const project = mergeProjectCatalog(settings.projectRecords).find((item) => item.id === id) || null;
  if (!project || !isProjectRoutable(project)) return null;
  return project;
}

export function isVideoUrl(src: string) {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(src) || src.includes("/video/");
}
