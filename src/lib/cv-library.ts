/**
 * CV document library.
 *
 * Each CV is an independently editable document. Portfolio / career data is only
 * ever a *suggestion*: it is snapshotted into `sourceValue` when imported, and
 * editing a field marks it `isCustomized` so later portfolio changes never
 * silently rewrite authored CV copy.
 *
 * Storage: `settings_json.cvLibrary` (document-oriented JSON). Legacy `cvConfig`
 * stays readable and is migrated on read until the first library save.
 */

import { skills as siteSkills, speakingEngagements, timeline } from "@/data/site-data";
import { careerFrom, type CareerRecord } from "@/lib/career";
import { contactEmailsFrom } from "@/lib/contact-emails";
import { normalizeCvAccess, type CvAccessConfig } from "@/lib/cv-access";
import {
  resolveCvDocument,
  getCvConfig,
  SKILL_GROUP_LABELS,
  type CvResolvedDocument,
  type CvSectionId,
  type CvTemplateId,
} from "@/lib/cv";
import { IDENTITY_ROLE_LINE } from "@/lib/identity";
import { publicEvidence } from "@/lib/project-evidence";
import { mergeProjectCatalog } from "@/lib/projects";
import { resolvedSocials } from "@/lib/socials";
import type { SiteSettings } from "@/lib/supabase";

export const CV_LIBRARY_REVISION = 1;

export type CvLayoutId = "professional" | "modern" | "compact" | "technical";
export type CvPageSize = "a4" | "letter";
export type CvDocStatus = "draft" | "published";
export type CvVisibility = "private" | "public";
export type CvDensity = "compact" | "standard" | "spacious";
export type CvHeadingScale = "small" | "standard" | "strong";
export type CvFontFamily = "serif" | "sans";
export type CvTargetPages = 1 | 2 | "none";

export type CvSectionKind =
  | "header"
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "research"
  | "data"
  | "certifications"
  | "training"
  | "leadership"
  | "languages"
  | "achievements"
  | "references"
  | "custom";

export type CvFieldSource =
  | "profile"
  | "experience"
  | "project"
  | "education"
  | "skills"
  | "manual"
  | "custom";

export type CvField = {
  value: string;
  /** Latest portfolio suggestion for this field (never rendered directly). */
  sourceValue?: string;
  sourceType?: CvFieldSource;
  isCustomized?: boolean;
};

export type CvBullet = { id: string; text: CvField };

export type CvItem = {
  id: string;
  /** Portfolio / career record id when imported. */
  sourceId?: string;
  sourceType?: string;
  hidden?: boolean;
  title: CvField;
  organization?: CvField;
  location?: CvField;
  period?: CvField;
  summary?: CvField;
  bullets?: CvBullet[];
  /** Comma-separated list kept as a string for editing simplicity. */
  technologies?: CvField;
};

export type CvSectionLayout = {
  itemsPerRow: 1 | 2 | 3;
  spacing: CvDensity;
  showDates?: boolean;
  showDescriptions?: boolean;
  showTechnologies?: boolean;
};

export type CvSection = {
  id: string;
  kind: CvSectionKind;
  title: string;
  hidden?: boolean;
  layout: CvSectionLayout;
  items: CvItem[];
  /** Free text for summary / custom sections. */
  body?: CvField;
};

export type CvDocument = {
  id: string;
  name: string;
  targetRole?: string;
  layoutId: CvLayoutId;
  pageSize: CvPageSize;
  status: CvDocStatus;
  visibility: CvVisibility;
  density: CvDensity;
  baseFontSize?: number;
  headingScale?: CvHeadingScale;
  fontFamily?: CvFontFamily;
  targetPages?: CvTargetPages;
  atsSafe?: boolean;
  createdAt: string;
  updatedAt: string;
  displayName: CvField;
  headline: CvField;
  email: CvField;
  emailSecondary?: CvField;
  phone?: CvField;
  location?: CvField;
  website?: CvField;
  linkedin?: CvField;
  github?: CvField;
  photoUrl?: string;
  showPhoto?: boolean;
  sections: CvSection[];
};

export type CvLibrary = {
  revision: number;
  defaultPublicId: string | null;
  access: CvAccessConfig;
  documents: CvDocument[];
};

/* ------------------------------------------------------------------ options */

export const CV_LAYOUT_OPTIONS: {
  id: CvLayoutId;
  label: string;
  hint: string;
  template: CvTemplateId;
}[] = [
  {
    id: "professional",
    label: "Professional",
    hint: "Editorial header, full-width experience, two-column support sections",
    template: "professional",
  },
  {
    id: "modern",
    label: "Modern",
    hint: "Navy identity band with a pull quote panel",
    template: "executive",
  },
  {
    id: "compact",
    label: "Compact",
    hint: "Centered header, dense one-page resume",
    template: "compact",
  },
  {
    id: "technical",
    label: "Technical",
    hint: "Professional frame with technologies emphasised on every item",
    template: "professional",
  },
];

export function cvLayoutTemplate(layoutId: CvLayoutId): CvTemplateId {
  return CV_LAYOUT_OPTIONS.find((opt) => opt.id === layoutId)?.template || "professional";
}

export function cvLayoutLabel(layoutId: CvLayoutId): string {
  return CV_LAYOUT_OPTIONS.find((opt) => opt.id === layoutId)?.label || "Professional";
}

export const CV_SECTION_KIND_OPTIONS: {
  id: CvSectionKind;
  label: string;
  defaultTitle: string;
  /** Free-text body, repeatable items, or both. */
  content: "body" | "items" | "both";
}[] = [
  { id: "summary", label: "Summary / profile", defaultTitle: "Professional Profile", content: "body" },
  { id: "experience", label: "Experience", defaultTitle: "Professional Experience", content: "items" },
  { id: "leadership", label: "Leadership", defaultTitle: "Leadership & Entrepreneurship", content: "items" },
  { id: "projects", label: "Projects", defaultTitle: "Selected Projects & Systems", content: "items" },
  { id: "education", label: "Education", defaultTitle: "Education", content: "items" },
  { id: "skills", label: "Skills", defaultTitle: "Technical Skills", content: "items" },
  { id: "certifications", label: "Certifications", defaultTitle: "Certifications", content: "items" },
  { id: "training", label: "Training & teaching", defaultTitle: "Training & Knowledge Sharing", content: "items" },
  { id: "research", label: "Research", defaultTitle: "Research & Publications", content: "items" },
  { id: "data", label: "Data & reporting", defaultTitle: "Data & Reporting", content: "items" },
  { id: "languages", label: "Languages", defaultTitle: "Languages", content: "items" },
  { id: "achievements", label: "Achievements", defaultTitle: "Achievements", content: "items" },
  { id: "references", label: "References", defaultTitle: "References", content: "body" },
  { id: "custom", label: "Custom block", defaultTitle: "Additional Information", content: "both" },
];

const SECTION_KIND_TO_RESOLVED: Record<CvSectionKind, CvSectionId> = {
  header: "profile",
  summary: "profile",
  experience: "experience",
  projects: "projects",
  education: "education",
  skills: "skills",
  research: "research",
  data: "data",
  certifications: "certifications",
  training: "training",
  leadership: "leadership",
  languages: "languages",
  achievements: "achievements",
  references: "references",
  custom: "custom",
};

export function resolvedSectionIdFor(kind: CvSectionKind): CvSectionId {
  return SECTION_KIND_TO_RESOLVED[kind] || "custom";
}

/** Grid layouts only make sense for short, list-like sections. */
const MULTI_COLUMN_KINDS: CvSectionKind[] = [
  "skills",
  "certifications",
  "languages",
  "achievements",
  "training",
  "research",
  "data",
  "custom",
];

export function supportsItemsPerRow(kind: CvSectionKind): boolean {
  return MULTI_COLUMN_KINDS.includes(kind);
}

export function sectionKindLabel(kind: CvSectionKind): string {
  return CV_SECTION_KIND_OPTIONS.find((opt) => opt.id === kind)?.label || kind;
}

export function sectionKindContent(kind: CvSectionKind): "body" | "items" | "both" {
  return CV_SECTION_KIND_OPTIONS.find((opt) => opt.id === kind)?.content || "items";
}

/* ------------------------------------------------------------------- fields */

let idCounter = 0;

export function newCvId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}${idCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function cvField(
  value: string,
  opts?: { sourceValue?: string; sourceType?: CvFieldSource; isCustomized?: boolean }
): CvField {
  const field: CvField = { value: value || "" };
  if (opts?.sourceValue !== undefined) field.sourceValue = opts.sourceValue;
  if (opts?.sourceType) field.sourceType = opts.sourceType;
  if (opts?.isCustomized) field.isCustomized = true;
  return field;
}

/** Snapshot a portfolio value: the suggestion and the live value start identical. */
export function sourcedField(value: string, sourceType: CvFieldSource): CvField {
  return { value: value || "", sourceValue: value || "", sourceType, isCustomized: false };
}

export function fieldValue(field?: CvField | null): string {
  return (field?.value || "").trim();
}

export function fieldText(field?: CvField | null): string | undefined {
  const value = fieldValue(field);
  return value || undefined;
}

/** Any edit that diverges from the portfolio suggestion locks the field. */
export function setFieldValue(field: CvField | undefined, value: string): CvField {
  const next: CvField = { ...(field || { value: "" }), value };
  const source = field?.sourceValue;
  next.isCustomized = source === undefined ? Boolean(value.trim()) : value.trim() !== source.trim();
  return next;
}

export function canResetField(field?: CvField | null): boolean {
  return Boolean(field?.sourceValue !== undefined && field?.isCustomized);
}

export function resetFieldToSource(field: CvField): CvField {
  if (field.sourceValue === undefined) return field;
  return { ...field, value: field.sourceValue, isCustomized: false };
}

/**
 * Refresh the stored suggestion. Customized fields keep their authored value
 * unless the caller explicitly overwrites.
 */
export function applySuggestion(
  field: CvField | undefined,
  sourceValue: string,
  opts?: { sourceType?: CvFieldSource; overwrite?: boolean }
): CvField {
  const base: CvField = field ? { ...field } : { value: "" };
  base.sourceValue = sourceValue;
  if (opts?.sourceType) base.sourceType = opts.sourceType;
  if (opts?.overwrite || !base.isCustomized || !base.value.trim()) {
    base.value = sourceValue;
    base.isCustomized = false;
  }
  return base;
}

export function newBullet(text = ""): CvBullet {
  return { id: newCvId("bul"), text: cvField(text) };
}

export function sourcedBullet(text: string, sourceType: CvFieldSource = "manual"): CvBullet {
  return { id: newCvId("bul"), text: sourcedField(text, sourceType) };
}

export function visibleBullets(item: CvItem): string[] {
  return (item.bullets || []).map((bullet) => fieldValue(bullet.text)).filter(Boolean);
}

/* ----------------------------------------------------------------- defaults */

export function defaultSectionLayout(kind: CvSectionKind, density: CvDensity = "standard"): CvSectionLayout {
  const grid = supportsItemsPerRow(kind);
  return {
    itemsPerRow: grid && (kind === "skills" || kind === "languages") ? 2 : 1,
    spacing: density,
    showDates: kind !== "skills" && kind !== "languages",
    showDescriptions: true,
    showTechnologies: kind === "projects" || kind === "skills",
  };
}

export function createSection(kind: CvSectionKind, partial?: Partial<CvSection>): CvSection {
  const preset = CV_SECTION_KIND_OPTIONS.find((opt) => opt.id === kind);
  const content = preset?.content || "items";
  return {
    id: newCvId("sec"),
    kind,
    title: preset?.defaultTitle || "Section",
    layout: defaultSectionLayout(kind),
    items: [],
    body: content === "items" ? undefined : cvField(""),
    ...partial,
  };
}

export function createItem(partial?: Partial<CvItem>): CvItem {
  return {
    id: newCvId("itm"),
    title: cvField(""),
    ...partial,
  };
}

const EMPTY_SECTION_KINDS: CvSectionKind[] = ["summary", "experience", "education", "skills"];

export function createBlankCvDocument(partial?: Partial<CvDocument>): CvDocument {
  const now = new Date().toISOString();
  return {
    id: newCvId("cv"),
    name: "Untitled CV",
    layoutId: "professional",
    pageSize: "a4",
    status: "draft",
    visibility: "private",
    density: "standard",
    baseFontSize: 10,
    headingScale: "standard",
    fontFamily: "sans",
    targetPages: 2,
    atsSafe: false,
    createdAt: now,
    updatedAt: now,
    displayName: cvField(""),
    headline: cvField(""),
    email: cvField(""),
    emailSecondary: cvField(""),
    phone: cvField(""),
    location: cvField(""),
    website: cvField(""),
    linkedin: cvField(""),
    github: cvField(""),
    photoUrl: "",
    showPhoto: false,
    sections: EMPTY_SECTION_KINDS.map((kind) => createSection(kind)),
    ...partial,
  };
}

export function duplicateCvDocument(doc: CvDocument, name?: string): CvDocument {
  const now = new Date().toISOString();
  const clone: CvDocument = JSON.parse(JSON.stringify(doc)) as CvDocument;
  return {
    ...clone,
    id: newCvId("cv"),
    name: name || `${doc.name} (copy)`,
    status: "draft",
    visibility: "private",
    createdAt: now,
    updatedAt: now,
    sections: clone.sections.map((section) => ({
      ...section,
      id: newCvId("sec"),
      items: section.items.map((item) => ({
        ...item,
        id: newCvId("itm"),
        bullets: item.bullets?.map((bullet) => ({ ...bullet, id: newCvId("bul") })),
      })),
    })),
  };
}

/* -------------------------------------------------------- profile snapshots */

export type CvProfileSnapshot = {
  displayName: string;
  headline: string;
  email: string;
  emailSecondary: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  photoUrl: string;
  summary: string;
};

export function cvProfileSnapshot(settings: SiteSettings): CvProfileSnapshot {
  const emails = contactEmailsFrom(settings);
  const socials = resolvedSocials(settings).filter((link) => link.enabled && link.url);
  const find = (id: string) => socials.find((link) => link.id === id)?.url || "";
  return {
    displayName: settings.siteTitle?.trim() || "Prince Parfait GANZA",
    headline: settings.siteSubtitle?.trim() || IDENTITY_ROLE_LINE,
    email: emails.primary,
    emailSecondary: emails.secondary,
    phone: settings.phoneNumber?.trim() || "",
    location: settings.location?.trim() || "Kigali, Rwanda",
    website: "https://www.princeparfait.com",
    linkedin: find("linkedin"),
    github: find("github"),
    photoUrl: settings.heroImageUrl || settings.emailPortraitUrl || "",
    summary: settings.bio?.trim() || "",
  };
}

/** Header identity fields, snapshotted as suggestions. */
export function applyProfileToDocument(
  doc: CvDocument,
  settings: SiteSettings,
  opts?: { overwrite?: boolean }
): CvDocument {
  const snap = cvProfileSnapshot(settings);
  const patch = (field: CvField | undefined, value: string) =>
    applySuggestion(field, value, { sourceType: "profile", overwrite: opts?.overwrite });
  return {
    ...doc,
    displayName: patch(doc.displayName, snap.displayName),
    headline: patch(doc.headline, snap.headline),
    email: patch(doc.email, snap.email),
    emailSecondary: patch(doc.emailSecondary, snap.emailSecondary),
    phone: patch(doc.phone, snap.phone),
    location: patch(doc.location, snap.location),
    website: patch(doc.website, snap.website),
    linkedin: patch(doc.linkedin, snap.linkedin),
    github: patch(doc.github, snap.github),
    photoUrl: doc.photoUrl || snap.photoUrl,
  };
}

/* --------------------------------------------------------- import catalogue */

export type CvImportKind =
  | "experience"
  | "leadership"
  | "training"
  | "education"
  | "certifications"
  | "projects"
  | "skills"
  | "achievements";

export type CvImportCandidate = {
  key: string;
  kind: CvImportKind;
  label: string;
  meta?: string;
  item: CvItem;
};

function recordToItem(record: CareerRecord, sourceType: CvFieldSource): CvItem {
  return {
    id: newCvId("itm"),
    sourceId: record.id,
    sourceType,
    title: sourcedField(record.title, sourceType),
    organization: sourcedField(record.organization, sourceType),
    location: sourcedField(record.location || "", sourceType),
    period: sourcedField(record.period, sourceType),
    summary: sourcedField(record.summary || record.description || "", sourceType),
    bullets: (record.highlights || [])
      .filter(Boolean)
      .slice(0, 5)
      .map((line) => sourcedBullet(line, sourceType)),
    technologies: sourcedField((record.skills || []).join(", "), sourceType),
  };
}

/** Verified evidence only — never invent a metric that is not in the record. */
function evidenceBullets(project: { evidence?: import("@/lib/project-evidence").ProjectEvidenceItem[] }) {
  return publicEvidence(project.evidence).map((row) => {
    const value = (row.value || "").trim();
    return value ? `${value} — ${row.label.trim()}` : row.label.trim();
  });
}

export function cvImportCandidates(
  settings: SiteSettings,
  kind: CvImportKind
): CvImportCandidate[] {
  const career = careerFrom(settings);
  const roles = career.records.filter((row) => row.kind === "role");

  if (kind === "experience") {
    return roles
      .filter((row) => row.roleType !== "training")
      .map((row) => ({
        key: `experience:${row.id}`,
        kind,
        label: `${row.title} — ${row.organization}`,
        meta: row.period,
        item: recordToItem(row, "experience"),
      }));
  }

  if (kind === "leadership") {
    return roles
      .filter((row) => row.category === "leadership")
      .map((row) => ({
        key: `leadership:${row.id}`,
        kind,
        label: `${row.title} — ${row.organization}`,
        meta: row.period,
        item: recordToItem(row, "experience"),
      }));
  }

  if (kind === "training") {
    const fromRoles = roles
      .filter((row) => row.roleType === "training")
      .map((row) => ({
        key: `training:${row.id}`,
        kind,
        label: `${row.title} — ${row.organization}`,
        meta: row.period,
        item: recordToItem(row, "experience"),
      }));
    const fromSpeaking = speakingEngagements.map((row, index) => ({
      key: `speaking:${index}`,
      kind,
      label: `${row.title} — ${row.event}`,
      meta: row.date,
      item: {
        id: newCvId("itm"),
        sourceId: `speaking-${index}`,
        sourceType: "custom",
        title: sourcedField(row.title, "custom"),
        organization: sourcedField(row.event, "custom"),
        location: sourcedField(row.location || "", "custom"),
        period: sourcedField(row.date || "", "custom"),
        summary: sourcedField(row.topic || "", "custom"),
      } satisfies CvItem,
    }));
    return [...fromRoles, ...fromSpeaking];
  }

  if (kind === "education") {
    return career.records
      .filter((row) => row.kind === "education")
      .map((row) => ({
        key: `education:${row.id}`,
        kind,
        label: `${row.title} — ${row.organization}`,
        meta: row.period,
        item: recordToItem(row, "education"),
      }));
  }

  if (kind === "certifications") {
    return career.records
      .filter((row) => row.kind === "certification")
      .map((row) => ({
        key: `certifications:${row.id}`,
        kind,
        label: `${row.title} — ${row.organization}`,
        meta: row.period,
        item: recordToItem(row, "education"),
      }));
  }

  if (kind === "projects") {
    return mergeProjectCatalog(settings.projectRecords).map((project) => {
      const bullets = evidenceBullets(project);
      const fallback = (project.highlights || []).filter(Boolean).slice(0, 4);
      return {
        key: `projects:${project.id}`,
        kind,
        label: project.title,
        meta: project.organization || project.myRole || project.period,
        item: {
          id: newCvId("itm"),
          sourceId: project.id,
          sourceType: "project",
          title: sourcedField(project.title, "project"),
          organization: sourcedField(project.organization || project.myRole || "", "project"),
          location: sourcedField(project.market || "", "project"),
          period: sourcedField(project.period || "", "project"),
          summary: sourcedField(project.description || "", "project"),
          bullets: (bullets.length ? bullets : fallback).map((line) => sourcedBullet(line, "project")),
          technologies: sourcedField((project.technologies || []).join(", "), "project"),
        } satisfies CvItem,
      };
    });
  }

  if (kind === "skills") {
    const groups = new Map<string, string[]>();
    for (const skill of siteSkills) {
      const label = SKILL_GROUP_LABELS[skill.category] || skill.category;
      groups.set(label, [...(groups.get(label) || []), skill.name]);
    }
    return Array.from(groups.entries()).map(([label, names]) => ({
      key: `skills:${label}`,
      kind,
      label,
      meta: `${names.length} skills`,
      item: {
        id: newCvId("itm"),
        sourceId: label,
        sourceType: "skills",
        title: sourcedField(label, "skills"),
        technologies: sourcedField(names.join(", "), "skills"),
      } satisfies CvItem,
    }));
  }

  return timeline
    .filter((row) => row.type === "milestone")
    .map((row) => ({
      key: `achievements:${row.id}`,
      kind: "achievements" as const,
      label: row.title,
      meta: row.year,
      item: {
        id: newCvId("itm"),
        sourceId: row.id,
        sourceType: "custom",
        title: sourcedField(row.title, "custom"),
        organization: sourcedField(row.organization || "", "custom"),
        period: sourcedField(row.year || "", "custom"),
        summary: sourcedField(row.description || "", "custom"),
      } satisfies CvItem,
    }));
}

/** Fresh ids so the same record can be imported into several sections. */
export function duplicateImportItem(item: CvItem): CvItem {
  return {
    ...item,
    id: newCvId("itm"),
    bullets: item.bullets?.map((bullet) => ({ ...bullet, id: newCvId("bul") })),
  };
}

export const CV_IMPORT_KIND_OPTIONS: { id: CvImportKind; label: string }[] = [
  { id: "experience", label: "Experience" },
  { id: "leadership", label: "Leadership" },
  { id: "projects", label: "Projects" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certifications" },
  { id: "training", label: "Training & talks" },
  { id: "skills", label: "Skill groups" },
  { id: "achievements", label: "Achievements" },
];

const ALL_IMPORT_KINDS: CvImportKind[] = [
  "experience",
  "leadership",
  "training",
  "education",
  "certifications",
  "projects",
  "skills",
  "achievements",
];

/**
 * Refresh an imported item's stored suggestions from the current portfolio record.
 * Customized fields keep their authored text unless `overwrite` is set. Bullets are
 * left untouched because their identity cannot be matched reliably.
 */
export function refreshItemSuggestions(
  item: CvItem,
  settings: SiteSettings,
  opts?: { overwrite?: boolean }
): CvItem {
  if (!item.sourceId) return item;
  let source: CvItem | null = null;
  for (const kind of ALL_IMPORT_KINDS) {
    const match = cvImportCandidates(settings, kind).find((row) => row.item.sourceId === item.sourceId);
    if (match) {
      source = match.item;
      break;
    }
  }
  if (!source) return item;

  const patch = (field: CvField | undefined, next: CvField | undefined) => {
    const value = fieldValue(next);
    if (!value && !field) return field;
    return applySuggestion(field, value, { sourceType: next?.sourceType, overwrite: opts?.overwrite });
  };

  return {
    ...item,
    title: patch(item.title, source.title) || item.title,
    organization: patch(item.organization, source.organization),
    location: patch(item.location, source.location),
    period: patch(item.period, source.period),
    summary: patch(item.summary, source.summary),
    technologies: patch(item.technologies, source.technologies),
  };
}

export function hasPortfolioSource(item: CvItem): boolean {
  return Boolean(item.sourceId);
}

/** Import kind that best matches a section, used to preselect the picker tab. */
export function importKindForSection(kind: CvSectionKind): CvImportKind {
  if (kind === "projects") return "projects";
  if (kind === "education") return "education";
  if (kind === "certifications") return "certifications";
  if (kind === "training") return "training";
  if (kind === "leadership") return "leadership";
  if (kind === "skills") return "skills";
  if (kind === "achievements") return "achievements";
  return "experience";
}

/* ------------------------------------------------------- create from profile */

const PROFILE_SECTION_PLAN: { kind: CvSectionKind; importKind?: CvImportKind; max?: number }[] = [
  { kind: "summary" },
  { kind: "experience", importKind: "experience", max: 4 },
  { kind: "projects", importKind: "projects", max: 4 },
  { kind: "education", importKind: "education" },
  { kind: "skills", importKind: "skills" },
  { kind: "certifications", importKind: "certifications", max: 3 },
];

export function createCvFromProfile(settings: SiteSettings, partial?: Partial<CvDocument>): CvDocument {
  const snap = cvProfileSnapshot(settings);
  const base = createBlankCvDocument({
    name: "CV from profile",
    sections: [],
    ...partial,
  });

  const sections: CvSection[] = PROFILE_SECTION_PLAN.map((plan) => {
    const section = createSection(plan.kind);
    if (plan.kind === "summary") {
      return { ...section, body: sourcedField(snap.summary, "profile") };
    }
    if (!plan.importKind) return section;
    const candidates = cvImportCandidates(settings, plan.importKind);
    const items = (plan.max ? candidates.slice(0, plan.max) : candidates).map((row) => row.item);
    return { ...section, items };
  });

  return applyProfileToDocument({ ...base, sections }, settings, { overwrite: true });
}

/* ---------------------------------------------------------------- migration */

const LEGACY_TEMPLATE_LAYOUT: Record<CvTemplateId, CvLayoutId> = {
  professional: "professional",
  compact: "compact",
  executive: "modern",
};

function sectionKindFromResolvedId(id: CvSectionId): CvSectionKind {
  if (id === "profile") return "summary";
  if (id === "expertise" || id === "links") return "custom";
  if (id === "research" || id === "data") return id;
  if (id === "custom") return "custom";
  return id as CvSectionKind;
}

function documentFromResolved(
  resolved: CvResolvedDocument,
  opts: { name: string; layoutId: CvLayoutId; status: CvDocStatus; visibility: CvVisibility }
): CvDocument {
  const sections: CvSection[] = [];

  for (const section of resolved.sections) {
    const kind = sectionKindFromResolvedId(section.id);
    const base = createSection(kind, { title: section.title });

    if (section.chips?.length) {
      sections.push({
        ...base,
        kind: "custom",
        layout: { ...base.layout, itemsPerRow: 3, showDates: false },
        items: section.chips.map((chip) => ({
          id: newCvId("itm"),
          title: sourcedField(chip, "manual"),
        })),
        body: undefined,
      });
      continue;
    }

    if (section.skillsByCategory?.length) {
      sections.push({
        ...base,
        kind: "skills",
        items: section.skillsByCategory.map((group) => ({
          id: newCvId("itm"),
          sourceId: group.category,
          sourceType: "skills",
          title: sourcedField(group.category, "skills"),
          technologies: sourcedField(group.names.join(", "), "skills"),
        })),
        body: undefined,
      });
      continue;
    }

    if (section.languages?.length) {
      sections.push({
        ...base,
        kind: "languages",
        items: section.languages.map((lang) => ({
          id: newCvId("itm"),
          title: sourcedField(lang.name, "manual"),
          summary: sourcedField(lang.proficiency || lang.note || "", "manual"),
        })),
        body: undefined,
      });
      continue;
    }

    if (section.items.length) {
      sections.push({
        ...base,
        items: section.items.map((item) => ({
          id: newCvId("itm"),
          sourceId: item.key,
          sourceType: section.id,
          title: sourcedField(item.title, "manual"),
          organization: sourcedField(item.subtitle || "", "manual"),
          location: sourcedField(item.location || "", "manual"),
          period: sourcedField(item.period || "", "manual"),
          summary: sourcedField(item.summary || item.href || "", "manual"),
          bullets: (item.highlights || []).map((line) => sourcedBullet(line, "manual")),
          technologies: sourcedField(item.meta || "", "manual"),
        })),
        body: section.body ? sourcedField(section.body, "manual") : undefined,
      });
      continue;
    }

    if (section.body) {
      sections.push({ ...base, items: [], body: sourcedField(section.body, "manual") });
    }
  }

  const now = new Date().toISOString();
  const links = resolved.contact.links;
  const linkUrl = (id: string) => links.find((link) => link.id === id)?.url || "";

  return {
    ...createBlankCvDocument(),
    id: newCvId("cv"),
    name: opts.name,
    layoutId: opts.layoutId,
    status: opts.status,
    visibility: opts.visibility,
    createdAt: now,
    updatedAt: now,
    displayName: sourcedField(resolved.name, "profile"),
    headline: sourcedField(resolved.headline, "profile"),
    email: sourcedField(resolved.contact.email || "", "profile"),
    emailSecondary: sourcedField(resolved.contact.emailSecondary || "", "profile"),
    phone: sourcedField(resolved.contact.phone || "", "profile"),
    location: sourcedField(resolved.contact.location || "", "profile"),
    website: sourcedField(resolved.contact.website || "", "profile"),
    linkedin: sourcedField(linkUrl("linkedin"), "profile"),
    github: sourcedField(linkUrl("github"), "profile"),
    photoUrl: resolved.appearance.photoUrl || "",
    showPhoto: Boolean(resolved.appearance.showPhoto),
    sections,
  };
}

/**
 * Convert the three legacy `cvConfig` formats into independent documents by
 * snapshotting exactly what the old resolver produced, so published output does
 * not change on migration.
 */
export function migrateCvConfigToLibrary(settings: SiteSettings): CvLibrary {
  const config = getCvConfig(settings);
  const templates: CvTemplateId[] = ["professional", "compact", "executive"];
  const documents: CvDocument[] = [];
  let defaultPublicId: string | null = null;

  for (const template of templates) {
    const format = config.formats[template];
    const resolved = resolveCvDocument(settings, template);
    const isDefault = template === config.defaultTemplate;
    const isPublic = isDefault || format.isPublic;
    const doc = documentFromResolved(resolved, {
      name: format.label || template,
      layoutId: LEGACY_TEMPLATE_LAYOUT[template],
      status: isPublic ? "published" : "draft",
      visibility: isPublic ? "public" : "private",
    });
    // Stable ids so /dashboard/cv/[id] links survive until the first library save.
    doc.id = `cv-legacy-${template}`;
    if (isDefault) defaultPublicId = doc.id;
    documents.push(doc);
  }

  return {
    revision: CV_LIBRARY_REVISION,
    defaultPublicId: defaultPublicId || documents[0]?.id || null,
    access: config.access,
    documents,
  };
}

/* ------------------------------------------------------------ normalization */

function normalizeField(raw: unknown, fallback = ""): CvField {
  if (typeof raw === "string") return { value: raw };
  if (raw && typeof raw === "object") {
    const row = raw as Partial<CvField>;
    return {
      value: typeof row.value === "string" ? row.value : fallback,
      ...(typeof row.sourceValue === "string" ? { sourceValue: row.sourceValue } : {}),
      ...(row.sourceType ? { sourceType: row.sourceType } : {}),
      ...(row.isCustomized ? { isCustomized: true } : {}),
    };
  }
  return { value: fallback };
}

function normalizeOptionalField(raw: unknown): CvField | undefined {
  if (raw === undefined || raw === null) return undefined;
  return normalizeField(raw);
}

function normalizeItem(raw: unknown): CvItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CvItem> & { id?: string };
  return {
    id: row.id || newCvId("itm"),
    sourceId: row.sourceId,
    sourceType: row.sourceType,
    hidden: row.hidden === true,
    title: normalizeField(row.title),
    organization: normalizeOptionalField(row.organization),
    location: normalizeOptionalField(row.location),
    period: normalizeOptionalField(row.period),
    summary: normalizeOptionalField(row.summary),
    technologies: normalizeOptionalField(row.technologies),
    bullets: Array.isArray(row.bullets)
      ? row.bullets
          .filter(Boolean)
          .map((bullet) => ({
            id: (bullet as CvBullet).id || newCvId("bul"),
            text: normalizeField((bullet as CvBullet).text),
          }))
      : undefined,
  };
}

function normalizeSection(raw: unknown): CvSection | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CvSection>;
  const kind = (row.kind && SECTION_KIND_TO_RESOLVED[row.kind] ? row.kind : "custom") as CvSectionKind;
  const layoutRaw = (row.layout || {}) as Partial<CvSectionLayout>;
  const perRow = Number(layoutRaw.itemsPerRow);
  return {
    id: row.id || newCvId("sec"),
    kind,
    title: typeof row.title === "string" && row.title.trim() ? row.title : sectionKindLabel(kind),
    hidden: row.hidden === true,
    layout: {
      itemsPerRow: perRow === 2 || perRow === 3 ? (perRow as 2 | 3) : 1,
      spacing:
        layoutRaw.spacing === "compact" || layoutRaw.spacing === "spacious" ? layoutRaw.spacing : "standard",
      showDates: layoutRaw.showDates !== false,
      showDescriptions: layoutRaw.showDescriptions !== false,
      showTechnologies: layoutRaw.showTechnologies !== false,
    },
    items: Array.isArray(row.items) ? (row.items.map(normalizeItem).filter(Boolean) as CvItem[]) : [],
    body: normalizeOptionalField(row.body),
  };
}

export function normalizeCvDocument(raw: unknown): CvDocument | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CvDocument>;
  if (!row.id) return null;
  const now = new Date().toISOString();
  const fontSize = Number(row.baseFontSize);
  return {
    id: row.id,
    name: (row.name || "Untitled CV").trim() || "Untitled CV",
    targetRole: row.targetRole?.trim() || undefined,
    layoutId: CV_LAYOUT_OPTIONS.some((opt) => opt.id === row.layoutId)
      ? (row.layoutId as CvLayoutId)
      : "professional",
    pageSize: row.pageSize === "letter" ? "letter" : "a4",
    status: row.status === "published" ? "published" : "draft",
    visibility: row.visibility === "public" ? "public" : "private",
    density:
      row.density === "compact" || row.density === "spacious" ? row.density : "standard",
    baseFontSize: Number.isFinite(fontSize) ? Math.min(13, Math.max(8, fontSize)) : 10,
    headingScale:
      row.headingScale === "small" || row.headingScale === "strong" ? row.headingScale : "standard",
    fontFamily: row.fontFamily === "serif" ? "serif" : "sans",
    targetPages: row.targetPages === 1 || row.targetPages === 2 ? row.targetPages : "none",
    atsSafe: row.atsSafe === true,
    createdAt: row.createdAt || now,
    updatedAt: row.updatedAt || now,
    displayName: normalizeField(row.displayName),
    headline: normalizeField(row.headline),
    email: normalizeField(row.email),
    emailSecondary: normalizeOptionalField(row.emailSecondary),
    phone: normalizeOptionalField(row.phone),
    location: normalizeOptionalField(row.location),
    website: normalizeOptionalField(row.website),
    linkedin: normalizeOptionalField(row.linkedin),
    github: normalizeOptionalField(row.github),
    photoUrl: typeof row.photoUrl === "string" ? row.photoUrl : "",
    showPhoto: row.showPhoto === true,
    sections: Array.isArray(row.sections)
      ? (row.sections.map(normalizeSection).filter(Boolean) as CvSection[])
      : [],
  };
}

export function normalizeCvLibrary(raw: unknown): CvLibrary | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<CvLibrary>;
  const documents = Array.isArray(row.documents)
    ? (row.documents.map(normalizeCvDocument).filter(Boolean) as CvDocument[])
    : [];
  if (!documents.length) return null;
  const defaultPublicId =
    row.defaultPublicId && documents.some((doc) => doc.id === row.defaultPublicId)
      ? row.defaultPublicId
      : documents.find((doc) => doc.visibility === "public" && doc.status === "published")?.id ||
        documents[0].id;
  return {
    revision: CV_LIBRARY_REVISION,
    defaultPublicId,
    access: normalizeCvAccess(row.access),
    documents,
  };
}

/**
 * Library for the given settings. Falls back to an in-memory migration of the
 * legacy `cvConfig` so nothing is written until the admin saves.
 */
export function getCvLibrary(settings: SiteSettings | null | undefined): CvLibrary {
  if (!settings) {
    return { revision: CV_LIBRARY_REVISION, defaultPublicId: null, access: normalizeCvAccess(null), documents: [] };
  }
  const saved = normalizeCvLibrary(settings.cvLibrary);
  if (saved) return saved;
  return migrateCvConfigToLibrary(settings);
}

export function hasStoredCvLibrary(settings: SiteSettings | null | undefined): boolean {
  return Boolean(normalizeCvLibrary(settings?.cvLibrary));
}

/* --------------------------------------------------------------- selection */

export function findCvDocument(library: CvLibrary, id: string | null | undefined): CvDocument | null {
  if (!id) return null;
  return library.documents.find((doc) => doc.id === id) || null;
}

export function defaultPublicCvDocument(library: CvLibrary): CvDocument | null {
  return (
    findCvDocument(library, library.defaultPublicId) ||
    library.documents.find((doc) => doc.status === "published" && doc.visibility === "public") ||
    null
  );
}

/** Published + public documents, default first. Private drafts never leak. */
export function publicCvDocuments(library: CvLibrary): CvDocument[] {
  const listed = library.documents.filter(
    (doc) => doc.status === "published" && doc.visibility === "public"
  );
  const preferred = defaultPublicCvDocument(library);
  if (!preferred) return listed;
  const rest = listed.filter((doc) => doc.id !== preferred.id);
  return [preferred, ...rest];
}

export function isCvDocumentPubliclyAccessible(library: CvLibrary, doc: CvDocument): boolean {
  if (doc.id === library.defaultPublicId) return doc.status === "published";
  return doc.status === "published" && doc.visibility === "public";
}

export function upsertCvDocument(library: CvLibrary, doc: CvDocument): CvLibrary {
  const exists = library.documents.some((row) => row.id === doc.id);
  const stamped = { ...doc, updatedAt: new Date().toISOString() };
  return {
    ...library,
    revision: CV_LIBRARY_REVISION,
    documents: exists
      ? library.documents.map((row) => (row.id === doc.id ? stamped : row))
      : [...library.documents, stamped],
    defaultPublicId: library.defaultPublicId || stamped.id,
  };
}

export function removeCvDocument(library: CvLibrary, id: string): CvLibrary {
  const documents = library.documents.filter((doc) => doc.id !== id);
  const defaultPublicId =
    library.defaultPublicId === id ? documents[0]?.id || null : library.defaultPublicId;
  return { ...library, documents, defaultPublicId };
}

/* ----------------------------------------------------------------- filename */

export function slugifyCvName(value: string): string {
  return (
    value
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "CV"
  );
}

export function cvDocumentFilename(doc: CvDocument): string {
  const base = slugifyCvName(doc.targetRole?.trim() || doc.name);
  return `Prince-Parfait-GANZA-${base}.pdf`;
}

/* ------------------------------------------------------------ page estimate */

const LINES_PER_PAGE: Record<CvDensity, number> = {
  compact: 56,
  standard: 48,
  spacious: 40,
};

/**
 * Deliberately rough line-count heuristic used only to warn about overflow —
 * the PDF renderer remains the source of truth.
 */
export function estimateCvPages(doc: CvDocument): { lines: number; pages: number } {
  const charsPerLine = doc.density === "compact" ? 110 : doc.density === "spacious" ? 88 : 98;
  const wrap = (text: string) => Math.ceil(text.length / charsPerLine) || 0;
  let lines = 8; // header block

  for (const section of doc.sections) {
    if (section.hidden) continue;
    lines += 2.5;
    lines += wrap(fieldValue(section.body));
    const visible = section.items.filter((item) => !item.hidden);
    const perRow = supportsItemsPerRow(section.kind) ? section.layout.itemsPerRow : 1;
    let itemLines = 0;
    for (const item of visible) {
      itemLines += 1.2;
      if (section.layout.showDescriptions !== false) itemLines += wrap(fieldValue(item.summary));
      if (section.layout.showTechnologies !== false) itemLines += wrap(fieldValue(item.technologies));
      itemLines += visibleBullets(item).reduce((sum, line) => sum + Math.max(1, wrap(line)), 0);
    }
    lines += perRow > 1 ? itemLines / perRow : itemLines;
  }

  const perPage = LINES_PER_PAGE[doc.density] * (doc.baseFontSize ? 10 / doc.baseFontSize : 1);
  return { lines: Math.round(lines), pages: Math.max(1, Math.ceil(lines / perPage)) };
}

export function cvOverflowWarning(doc: CvDocument): string | null {
  if (doc.targetPages === "none" || !doc.targetPages) return null;
  const { pages } = estimateCvPages(doc);
  if (pages <= doc.targetPages) return null;
  return `Estimated ${pages} pages — target is ${doc.targetPages}. Trim items or switch to a denser layout.`;
}
