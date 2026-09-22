import {
  certifications as siteCertifications,
  education as siteEducation,
  experience as siteExperience,
} from "@/data/site-data";
import type { SiteSettings } from "@/lib/supabase";

export type CareerKind = "role" | "education" | "certification";
export type CareerCategory = "leadership" | "work" | "education" | "other";
export type CareerRoleType = "work" | "training" | "education";

/** Canonical career / experience record — source for Experience page, Journey, and CV. */
export type CareerRecord = {
  id: string;
  kind: CareerKind;
  category: CareerCategory;
  /** Only for kind === "role" */
  roleType?: CareerRoleType;
  title: string;
  organization: string;
  period: string;
  sortYear: number;
  location?: string;
  /** Short blurb (Journey list) */
  description: string;
  /** Longer summary (Experience card / CV / drawer) */
  summary: string;
  highlights: string[];
  skills?: string[];
  logo?: string;
  website?: string;
  relatedHref?: string;
  relatedLabel?: string;
  status?: string;
  note?: string;
  industry?: string;
  team?: string;
  completedOn?: string;
  issuedOn?: string;
  verifyUrl?: string;
  certificateImage?: string;
  /** Show on public /experience timeline (default true) */
  showOnExperience?: boolean;
  /** Include in homepage Journey by default when journey.selectedIds is empty */
  showOnJourney?: boolean;
};

export type CareerPageCopy = {
  label: string;
  title: string;
  body: string;
  asideLine: string;
  sideLabel: string;
  sideTitle: string;
  sideBody: string;
  sideCta: string;
};

export type CareerStat = { value: string; label: string };

export type CareerContent = {
  page: CareerPageCopy;
  stats: CareerStat[];
  records: CareerRecord[];
};

function seedRecords(): CareerRecord[] {
  const roles: CareerRecord[] = siteExperience.map((item) => ({
    id: item.id,
    kind: "role" as const,
    category: item.category,
    roleType: item.type,
    title: item.role,
    organization: item.organization,
    period: item.period,
    sortYear: item.sortYear,
    location: item.location,
    description: item.summary.split(/(?<=\.)\s+/)[0] || item.summary,
    summary: item.summary,
    highlights: item.highlights,
    skills: item.skills,
    logo:
      item.logo ||
      (item.id === "eshuri"
        ? "/images/projects/logos/data-systems.webp"
        : item.id === "askfield"
          ? "/images/projects/logos/askfield.webp"
          : undefined),
    website: item.website,
    relatedHref: item.relatedHref,
    relatedLabel: item.relatedLabel,
    showOnExperience: true,
    showOnJourney: ["lerony", "goa-plus", "psta"].includes(item.id),
  }));

  const schools: CareerRecord[] = siteEducation.map((item) => ({
    id: `edu-${item.id}`,
    kind: "education" as const,
    category: "education" as const,
    title: item.program,
    organization: item.institution,
    period: item.period,
    sortYear: item.sortYear,
    description: item.note || item.status,
    summary: item.note || item.status,
    highlights: [item.status],
    skills:
      item.id === "ulk"
        ? ["Bachelor of Computer Science in Software Engineering"]
        : ["Software Development (SOD)"],
    logo: item.logo,
    status: item.status,
    note: item.note,
    showOnExperience: true,
    showOnJourney: true,
  }));

  const certs: CareerRecord[] = siteCertifications.map((item) => ({
    id: `cert-${item.id}`,
    kind: "certification" as const,
    category: "education" as const,
    title: item.title,
    organization: item.issuer,
    period: item.period,
    sortYear: item.sortYear,
    description: item.program,
    summary: item.program,
    highlights: [`Completed ${item.completedOn}`, `Issued ${item.issuedOn}`],
    skills: ["Verified certificate"],
    logo: "/images/projects/logos/alx.webp",
    relatedHref: item.verifyUrl,
    relatedLabel: "Verify certificate",
    completedOn: item.completedOn,
    issuedOn: item.issuedOn,
    verifyUrl: item.verifyUrl,
    certificateImage: item.image,
    showOnExperience: true,
    showOnJourney: false,
  }));

  return [...roles, ...schools, ...certs].sort((a, b) => b.sortYear - a.sortYear);
}

export const DEFAULT_CAREER: CareerContent = {
  page: {
    label: "Experience",
    title: "A journey of continuous building.",
    body: "Roles, systems work, training, and education: a record of progress across software engineering, research technology and data systems.",
    asideLine: "Ideas · People · Systems · Impact",
    sideLabel: "From learning to leading",
    sideTitle: "Evidence behind the identity.",
    sideBody:
      "Leadership at LERONY Ltd leads the public story. Engineering, operations, training, and education stay as verified supporting record.",
    sideCta: "View full timeline",
  },
  stats: [
    { value: "4+", label: "Roles & experiences" },
    { value: "4", label: "Organizations" },
    { value: "2021", label: "Journey started" },
    { value: "Ongoing", label: "Building and learning" },
  ],
  records: seedRecords(),
};

export function careerFrom(settings: SiteSettings | null | undefined): CareerContent {
  const saved = settings?.career;
  if (!saved) return DEFAULT_CAREER;

  const defaultsById = new Map(DEFAULT_CAREER.records.map((item) => [item.id, item]));
  const savedRecords = saved.records?.length ? saved.records : DEFAULT_CAREER.records;

  const merged: CareerRecord[] = savedRecords.map((entry) => {
    const fallback = defaultsById.get(entry.id);
    return {
      ...fallback,
      ...entry,
      id: entry.id || fallback?.id || newCareerId(entry.kind || "role"),
      kind: entry.kind || fallback?.kind || "role",
      category: entry.category || fallback?.category || "work",
      title: entry.title || fallback?.title || "",
      organization: entry.organization || fallback?.organization || "",
      period: entry.period || fallback?.period || "",
      sortYear: entry.sortYear ?? fallback?.sortYear ?? new Date().getFullYear(),
      description: entry.description || fallback?.description || "",
      summary: entry.summary || fallback?.summary || "",
      highlights: entry.highlights?.length ? entry.highlights : fallback?.highlights || [],
      skills: entry.skills?.length ? entry.skills : fallback?.skills,
      logo: typeof entry.logo === "string" ? entry.logo : fallback?.logo,
      showOnExperience: entry.showOnExperience ?? fallback?.showOnExperience ?? true,
      showOnJourney: entry.showOnJourney ?? fallback?.showOnJourney ?? false,
    };
  });

  // Keep any new default records that were never saved yet
  for (const fallback of DEFAULT_CAREER.records) {
    if (!merged.some((item) => item.id === fallback.id)) merged.push(fallback);
  }

  return {
    page: { ...DEFAULT_CAREER.page, ...saved.page },
    stats: saved.stats?.length ? saved.stats : DEFAULT_CAREER.stats,
    records: merged.sort((a, b) => b.sortYear - a.sortYear),
  };
}

export function experienceTimelineRecords(career: CareerContent): CareerRecord[] {
  return career.records.filter((item) => item.showOnExperience !== false);
}

export function journeySelectedRecords(
  career: CareerContent,
  selectedIds?: string[] | null
): CareerRecord[] {
  if (selectedIds?.length) {
    const byId = new Map(career.records.map((item) => [item.id, item]));
    return selectedIds.map((id) => byId.get(id)).filter(Boolean) as CareerRecord[];
  }
  return career.records
    .filter((item) => item.showOnJourney)
    .sort((a, b) => b.sortYear - a.sortYear);
}

export function careerRecordToJourneyEntry(record: CareerRecord) {
  const type =
    record.category === "leadership"
      ? ("leadership" as const)
      : record.kind === "education" || record.kind === "certification"
        ? ("education" as const)
        : record.roleType === "training"
          ? ("work" as const)
          : ("work" as const);

  return {
    id: record.id,
    year: record.period,
    title: record.title,
    organization: record.organization,
    description: record.description || record.summary,
    type,
    location: record.location,
    summary: record.summary,
    highlights: record.highlights,
    website: record.website,
    industry: record.industry,
    team: record.team,
    status: record.status,
    relatedHref: record.relatedHref || record.verifyUrl || "/experience",
    logo: record.logo,
    showDetails: true,
    detailsBlocked: false,
  };
}

export function newCareerId(kind: CareerKind) {
  return `${kind}-${Date.now().toString(36)}`;
}
