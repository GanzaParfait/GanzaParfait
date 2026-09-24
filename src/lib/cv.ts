import {
  education as siteEducation,
  certifications as siteCertifications,
  experience as siteExperience,
  projects as siteProjects,
  skills as siteSkills,
  speakingEngagements,
  timeline,
} from "@/data/site-data";
import { careerFrom, type CareerRecord } from "@/lib/career";
import { contactEmailsFrom } from "@/lib/contact-emails";
import { DEFAULT_CV_ACCESS, normalizeCvAccess, type CvAccessConfig } from "@/lib/cv-access";
import { siteUrl } from "@/lib/env";
import { resolvedSocials } from "@/lib/socials";
import type { SiteSettings } from "@/lib/supabase";
import { IDENTITY_ROLE_LINE } from "@/lib/identity";

function careerRoles(settings: SiteSettings): CareerRecord[] {
  return careerFrom(settings).records.filter((item) => item.kind === "role");
}

function careerEducation(settings: SiteSettings): CareerRecord[] {
  return careerFrom(settings).records.filter((item) => item.kind === "education");
}

function careerCertifications(settings: SiteSettings): CareerRecord[] {
  return careerFrom(settings).records.filter((item) => item.kind === "certification");
}

export type CvTemplateId = "professional" | "compact" | "executive";

export type CvSectionId =
  | "profile"
  | "expertise"
  | "experience"
  | "leadership"
  | "projects"
  | "education"
  | "skills"
  | "languages"
  | "training"
  | "certifications"
  | "achievements"
  | "links"
  | "references"
  | "research"
  | "data"
  | "custom";

export type CvSectionConfig = {
  id: CvSectionId;
  included: boolean;
  order: number;
  titleOverride?: string;
  maxItems?: number;
};

export type CvItemOverride = {
  title?: string;
  subtitle?: string;
  summary?: string;
  highlights?: string[];
};

/** Admin-authored rows that are not in site portfolio data. */
export type CvCustomEntry = {
  id: string;
  sectionId: Extract<
    CvSectionId,
    "experience" | "leadership" | "projects" | "education" | "training" | "achievements" | "certifications"
  >;
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  meta?: string;
  order?: number;
};

export type CvLanguage = {
  id: string;
  name: string;
  /** Admin-entered only — never inferred */
  proficiency: string;
  note?: string;
  showOnCv: boolean;
  order: number;
};

export type CvExpertiseItem = {
  id: string;
  label: string;
  order: number;
};

export type CvHeaderStyle = "split" | "centered" | "banner" | "classic";
export type CvFooterStyle = "paged" | "centered" | "minimal" | "none";
export type CvPhotoShape = "circle" | "rounded" | "square";

/** Per-format document chrome — independent of website About/Hero imagery. */
export type CvAppearance = {
  headerStyle: CvHeaderStyle;
  footerStyle: CvFooterStyle;
  showPhoto: boolean;
  /** Media library or /images path; empty uses site hero portrait when showPhoto is on */
  photoUrl: string;
  photoShape: CvPhotoShape;
  /** Pull-quote / right-rail line (Professional split & Executive banner) */
  tagline: string;
};

export type CvFormatConfig = {
  template: CvTemplateId;
  label: string;
  isPublic: boolean;
  /** Include this format in the /cv hero paper stack (independent of isPublic cards). */
  showInHero: boolean;
  /** Per-format positioning line under the name */
  headline: string;
  profileOverride?: string;
  appearance: CvAppearance;
  sections: CvSectionConfig[];
  itemIncludes: Record<string, boolean>;
  itemOrder: Record<string, number>;
  itemOverrides: Record<string, CvItemOverride>;
  expertiseIncludes: Record<string, boolean>;
  skillGroupIncludes: Record<string, boolean>;
  languageIncludes: Record<string, boolean>;
  /** Social/link ids: website, linkedin, github, … */
  linkIncludes: Record<string, boolean>;
  referencesText?: string;
  /** Extra positions / entries authored in the dashboard */
  customEntries?: CvCustomEntry[];
};

export type CvConfig = {
  defaultTemplate: CvTemplateId;
  languages: CvLanguage[];
  expertise: CvExpertiseItem[];
  formats: Record<CvTemplateId, CvFormatConfig>;
  access: CvAccessConfig;
  /** Bump when defaults change so stale local configs can be refreshed carefully */
  revision: number;
};

export type CvResolvedItem = {
  key: string;
  title: string;
  subtitle?: string;
  period?: string;
  location?: string;
  summary?: string;
  highlights?: string[];
  meta?: string;
  href?: string;
  orgKey?: string;
};

export type CvResolvedDocument = {
  template: CvTemplateId;
  label: string;
  name: string;
  headline: string;
  profile: string;
  appearance: CvAppearance & { resolvedPhotoUrl?: string };
  contact: {
    email?: string;
    emailSecondary?: string;
    phone?: string;
    location?: string;
    website?: string;
    links: { id: string; label: string; url: string }[];
  };
  sections: {
    id: CvSectionId;
    /** Unique per document — several sections may share a kind (e.g. two custom blocks). */
    key?: string;
    title: string;
    items: CvResolvedItem[];
    body?: string;
    chips?: string[];
    skillsByCategory?: { category: string; names: string[] }[];
    languages?: { name: string; proficiency?: string; note?: string }[];
  }[];
};

export const CV_CONFIG_REVISION = 5;

export const CV_HEADER_STYLE_OPTIONS: { id: CvHeaderStyle; label: string; hint: string }[] = [
  { id: "split", label: "Split editorial", hint: "Name left, tagline right — Professional reference" },
  { id: "centered", label: "Centered", hint: "Name and contact centered — Compact reference" },
  { id: "banner", label: "Navy banner", hint: "Dark identity band — Executive reference" },
  { id: "classic", label: "Classic bar", hint: "Simple left-aligned name with rule" },
];

export const CV_FOOTER_STYLE_OPTIONS: { id: CvFooterStyle; label: string }[] = [
  { id: "paged", label: "Name · URL + page numbers" },
  { id: "centered", label: "Centered name · URL" },
  { id: "minimal", label: "Page number only" },
  { id: "none", label: "No footer" },
];

export const CV_PHOTO_SHAPE_OPTIONS: { id: CvPhotoShape; label: string }[] = [
  { id: "circle", label: "Circle" },
  { id: "rounded", label: "Rounded" },
  { id: "square", label: "Square" },
];

export function defaultAppearance(template: CvTemplateId): CvAppearance {
  if (template === "compact") {
    return {
      headerStyle: "centered",
      footerStyle: "centered",
      showPhoto: false,
      photoUrl: "",
      photoShape: "circle",
      tagline: "",
    };
  }
  if (template === "executive") {
    return {
      headerStyle: "banner",
      footerStyle: "paged",
      showPhoto: false,
      photoUrl: "",
      photoShape: "rounded",
      tagline: "Practical technology for people and progress.",
    };
  }
  return {
    headerStyle: "split",
    footerStyle: "paged",
    showPhoto: false,
    photoUrl: "",
    photoShape: "circle",
    tagline: "Technology for people. Practical solutions for real impact.",
  };
}

export type CvResolvedSection = CvResolvedDocument["sections"][number];

export function resolvedSectionKey(section: CvResolvedSection): string {
  return section.key || section.id;
}

/**
 * Place sections into the Professional layout slots. A document may contain more
 * than one section of the same kind (e.g. two custom blocks), so each slot claims
 * the first unclaimed match and anything left over renders full width.
 */
export function splitResolvedSections(
  sections: CvResolvedSection[],
  groups: { full: CvSectionId[]; left: CvSectionId[]; right: CvSectionId[] }
): { full: CvResolvedSection[]; left: CvResolvedSection[]; right: CvResolvedSection[]; extras: CvResolvedSection[] } {
  const claimed = new Set<string>();
  const pick = (ids: CvSectionId[]) => {
    const out: CvResolvedSection[] = [];
    for (const id of ids) {
      const match = sections.find(
        (section) => section.id === id && !claimed.has(resolvedSectionKey(section))
      );
      if (match) {
        claimed.add(resolvedSectionKey(match));
        out.push(match);
      }
    }
    return out;
  };

  const full = pick(groups.full);
  const left = pick(groups.left);
  const right = pick(groups.right);
  const extras = sections.filter((section) => !claimed.has(resolvedSectionKey(section)));
  return { full, left, right, extras };
}

export function splitDisplayName(name: string): { given: string; family: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return { given: name.trim(), family: "" };
  return { given: parts.slice(0, -1).join(" "), family: parts[parts.length - 1] };
}

export function absolutizeCvMedia(url: string | undefined, origin: string): string | undefined {
  const value = (url || "").trim();
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  const base = origin.replace(/\/+$/, "");
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
}

const SECTION_TITLES: Record<CvSectionId, string> = {
  profile: "Professional Profile",
  expertise: "Core Expertise",
  experience: "Professional Experience",
  leadership: "Leadership & Entrepreneurship",
  projects: "Selected Projects & Systems",
  education: "Education",
  skills: "Technical Skills",
  languages: "Languages",
  training: "Training",
  certifications: "Certifications",
  achievements: "Achievements",
  links: "Selected Links",
  references: "References",
  research: "Research & Publications",
  data: "Data & Reporting",
  custom: "Additional Information",
};

const EXECUTIVE_TITLES: Partial<Record<CvSectionId, string>> = {
  profile: "Executive Profile",
  expertise: "Capabilities",
  experience: "Major Engagements",
  leadership: "Leadership",
  projects: "Selected Impact",
  skills: "Capabilities",
};

const TEMPLATE_LABELS: Record<CvTemplateId, string> = {
  professional: "Professional CV",
  compact: "Compact Resume",
  executive: "Executive / Profile CV",
};

/** Verified skill category labels used for grouping (from site-data categories). */
export const SKILL_GROUP_LABELS: Record<string, string> = {
  Frontend: "Frontend",
  Backend: "Backend",
  Data: "Data & Reporting",
  Infrastructure: "Infrastructure / Deployment",
};

const DEFAULT_EXPERTISE: CvExpertiseItem[] = [
  { id: "software-engineering", label: "Software Engineering", order: 0 },
  { id: "product-development", label: "Product Development", order: 1 },
  { id: "business-systems", label: "Business Systems", order: 2 },
  { id: "api-integration", label: "API Integration", order: 3 },
  { id: "data-systems", label: "Data Systems", order: 4 },
  { id: "digital-transformation", label: "Digital Transformation", order: 5 },
  { id: "technical-training", label: "Technical Training", order: 6 },
];

/**
 * Languages listed without proficiency — admin must set proficiency in the dashboard.
 * French/Arabic start hidden until the admin enables them and enters an accurate level.
 */
const DEFAULT_LANGUAGES: CvLanguage[] = [
  { id: "en", name: "English", proficiency: "", note: "", showOnCv: true, order: 0 },
  { id: "rw", name: "Kinyarwanda", proficiency: "", note: "", showOnCv: true, order: 1 },
  { id: "fr", name: "French", proficiency: "", note: "", showOnCv: false, order: 2 },
  { id: "ar", name: "Arabic", proficiency: "", note: "", showOnCv: false, order: 3 },
];

const ESSENTIAL_LINK_IDS = ["linkedin", "github", "website"] as const;

function sectionsFor(
  ids: { id: CvSectionId; included?: boolean; maxItems?: number; titleOverride?: string }[]
): CvSectionConfig[] {
  return ids.map((item, index) => ({
    id: item.id,
    included: item.included !== false,
    order: index,
    maxItems: item.maxItems,
    titleOverride: item.titleOverride,
  }));
}

function includesMap(keys: string[], enabled: string[]): Record<string, boolean> {
  const set = new Set(enabled);
  const out: Record<string, boolean> = {};
  for (const key of keys) out[key] = set.has(key);
  return out;
}

function defaultLinkIncludes(essentialOnly: boolean): Record<string, boolean> {
  if (essentialOnly) {
    return { linkedin: true, github: true, website: true };
  }
  return { linkedin: true, github: true, website: true };
}

function defaultFormat(template: CvTemplateId): CvFormatConfig {
  const allExp = siteExperience.map((e) => `experience:${e.id}`);
  const allProj = siteProjects.map((p) => `projects:${p.id}`);
  const allEdu = siteEducation.map((e) => `education:${e.id}`);
  const allCerts = siteCertifications.map((c) => `certifications:${c.id}`);
  const skillGroups = [...new Set(siteSkills.map((s) => s.category))];

  if (template === "compact") {
    return {
      template,
      label: TEMPLATE_LABELS.compact,
      isPublic: true,
      showInHero: true,
      headline: IDENTITY_ROLE_LINE,
      appearance: defaultAppearance("compact"),
      sections: sectionsFor([
        { id: "profile" },
        { id: "expertise" },
        { id: "experience", maxItems: 4 },
        { id: "projects", maxItems: 3 },
        { id: "education" },
        { id: "certifications", maxItems: 3 },
        { id: "skills" },
        { id: "languages" },
        { id: "leadership", included: false },
        { id: "training", included: false },
        { id: "achievements", included: false },
        { id: "links", included: false },
        { id: "references", included: false },
      ]),
      itemIncludes: {
        ...includesMap(allExp, ["experience:lerony", "experience:askfield", "experience:eshuri"]),
        ...includesMap(allProj, ["projects:caritas-systems", "projects:askfield", "projects:stockpro"]),
        ...includesMap(allEdu, allEdu),
        ...includesMap(allCerts, allCerts),
      },
      itemOrder: {},
      itemOverrides: {},
      expertiseIncludes: Object.fromEntries(DEFAULT_EXPERTISE.map((e) => [e.id, true])),
      skillGroupIncludes: Object.fromEntries(skillGroups.map((g) => [g, true])),
      languageIncludes: { en: true, rw: true, fr: false, ar: false },
      linkIncludes: defaultLinkIncludes(true),
    };
  }

  if (template === "executive") {
    return {
      template,
      label: TEMPLATE_LABELS.executive,
      isPublic: true,
      showInHero: true,
      headline: "Founder & CEO · Technology & Innovation",
      appearance: defaultAppearance("executive"),
      sections: sectionsFor([
        { id: "profile" },
        { id: "leadership" },
        { id: "experience", titleOverride: "Major Engagements", maxItems: 4 },
        { id: "projects", titleOverride: "Selected Impact", maxItems: 4 },
        { id: "expertise", titleOverride: "Capabilities" },
        { id: "education" },
        { id: "languages" },
        { id: "certifications", maxItems: 3 },
        { id: "links", titleOverride: "Professional Links" },
        { id: "skills", included: false },
        { id: "training", included: false },
        { id: "achievements", included: false },
        { id: "references", included: false },
      ]),
      itemIncludes: {
        // LERONY lives in leadership only — not experience, not projects
        ...includesMap(allExp, ["experience:askfield", "experience:eshuri", "experience:psta"]),
        "leadership:lerony": true,
        ...includesMap(allProj, [
          "projects:caritas-systems",
          "projects:askfield",
          "projects:stockpro",
          "projects:psta-accounting",
        ]),
        ...includesMap(allEdu, allEdu),
        ...includesMap(allCerts, allCerts),
        "experience:lerony": false,
        "projects:lerony": false,
      },
      itemOrder: {},
      itemOverrides: {},
      expertiseIncludes: Object.fromEntries(DEFAULT_EXPERTISE.map((e) => [e.id, true])),
      skillGroupIncludes: Object.fromEntries(skillGroups.map((g) => [g, true])),
      languageIncludes: { en: true, rw: true, fr: false, ar: false },
      linkIncludes: defaultLinkIncludes(true),
    };
  }

  return {
    template: "professional",
    label: TEMPLATE_LABELS.professional,
    isPublic: true,
    showInHero: true,
    headline: IDENTITY_ROLE_LINE,
    appearance: defaultAppearance("professional"),
    sections: sectionsFor([
      { id: "profile" },
      { id: "experience" },
      { id: "projects", maxItems: 5 },
      { id: "education" },
      { id: "training", titleOverride: "Training & Knowledge Sharing" },
      { id: "skills" },
      { id: "languages" },
      { id: "links", titleOverride: "Selected Links" },
      { id: "expertise", included: false },
      { id: "leadership", included: false },
      { id: "certifications", included: false },
      { id: "achievements", included: false },
      { id: "references", included: false },
    ]),
    itemIncludes: {
      // Reference Professional CV: LERONY leads experience; AskField + eShuri follow
      ...includesMap(allExp, [
        "experience:lerony",
        "experience:askfield",
        "experience:eshuri",
      ]),
      "experience:psta": false,
      "leadership:lerony": false,
      "training:eshuri": false,
      ...includesMap(allProj, [
        "projects:caritas-systems",
        "projects:askfield",
        "projects:stockpro",
        "projects:psta-accounting",
      ]),
      "projects:lerony": false,
      "projects:gotallnews": false,
      "projects:caritas-website": false,
      ...includesMap(allEdu, allEdu),
      ...includesMap(allCerts, allCerts),
    },
    itemOrder: {},
    itemOverrides: {},
    expertiseIncludes: Object.fromEntries(DEFAULT_EXPERTISE.map((e) => [e.id, true])),
    skillGroupIncludes: Object.fromEntries(skillGroups.map((g) => [g, true])),
    languageIncludes: { en: true, rw: true, fr: false, ar: false },
    linkIncludes: defaultLinkIncludes(true),
  };
}

export const DEFAULT_CV_CONFIG: CvConfig = {
  defaultTemplate: "professional",
  revision: CV_CONFIG_REVISION,
  languages: DEFAULT_LANGUAGES,
  expertise: DEFAULT_EXPERTISE,
  access: DEFAULT_CV_ACCESS,
  formats: {
    professional: defaultFormat("professional"),
    compact: defaultFormat("compact"),
    executive: defaultFormat("executive"),
  },
};

function mergeSectionLists(
  base: CvSectionConfig[],
  saved?: CvSectionConfig[]
): CvSectionConfig[] {
  const map = new Map(base.map((s) => [s.id, { ...s }]));
  for (const s of saved || []) {
    const prev = map.get(s.id);
    if (prev) map.set(s.id, { ...prev, ...s, id: prev.id });
  }
  // Ensure any newly introduced section ids exist
  for (const s of base) {
    if (!map.has(s.id)) map.set(s.id, s);
  }
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

function migrateLegacySectionId(id: string): CvSectionId | null {
  if (id === "summary" || id === "contact") return "profile";
  if ((Object.keys(SECTION_TITLES) as string[]).includes(id)) return id as CvSectionId;
  return null;
}

function mergeFormat(base: CvFormatConfig, saved?: Partial<CvFormatConfig> & { overrides?: unknown }): CvFormatConfig {
  if (!saved) return base;

  // Migrate old `overrides` shape from revision 1
  const legacy = saved as {
    overrides?: {
      headline?: string;
      summary?: string;
      references?: string;
      items?: Record<string, CvItemOverride>;
    };
    sections?: Array<CvSectionConfig & { id: string }>;
  };

  const migratedSections = (legacy.sections || [])
    .map((s) => {
      const id = migrateLegacySectionId(s.id);
      if (!id) return null;
      return { ...s, id };
    })
    .filter(Boolean) as CvSectionConfig[];

  return {
    ...base,
    ...saved,
    template: base.template,
    label: saved.label || base.label,
    isPublic: saved.isPublic ?? base.isPublic,
    showInHero: saved.showInHero ?? base.showInHero,
    headline:
      saved.headline?.trim() ||
      legacy.overrides?.headline?.trim() ||
      base.headline,
    profileOverride:
      saved.profileOverride ??
      legacy.overrides?.summary ??
      base.profileOverride,
    referencesText:
      saved.referencesText ??
      legacy.overrides?.references ??
      base.referencesText,
    appearance: {
      ...defaultAppearance(base.template),
      ...(base.appearance || {}),
      ...(saved.appearance || {}),
      photoUrl: saved.appearance?.photoUrl ?? base.appearance?.photoUrl ?? "",
      tagline: saved.appearance?.tagline ?? base.appearance?.tagline ?? defaultAppearance(base.template).tagline,
      showPhoto: saved.appearance?.showPhoto ?? base.appearance?.showPhoto ?? false,
      headerStyle:
        saved.appearance?.headerStyle ||
        base.appearance?.headerStyle ||
        defaultAppearance(base.template).headerStyle,
      footerStyle:
        saved.appearance?.footerStyle ||
        base.appearance?.footerStyle ||
        defaultAppearance(base.template).footerStyle,
      photoShape:
        saved.appearance?.photoShape ||
        base.appearance?.photoShape ||
        defaultAppearance(base.template).photoShape,
    },
    sections: mergeSectionLists(base.sections, migratedSections.length ? migratedSections : saved.sections),
    itemIncludes: { ...base.itemIncludes, ...(saved.itemIncludes || {}) },
    itemOrder: { ...base.itemOrder, ...(saved.itemOrder || {}) },
    itemOverrides: {
      ...base.itemOverrides,
      ...(saved.itemOverrides || {}),
      ...(legacy.overrides?.items || {}),
    },
    expertiseIncludes: { ...base.expertiseIncludes, ...(saved.expertiseIncludes || {}) },
    skillGroupIncludes: { ...base.skillGroupIncludes, ...(saved.skillGroupIncludes || {}) },
    languageIncludes: { ...base.languageIncludes, ...(saved.languageIncludes || {}) },
    linkIncludes: { ...base.linkIncludes, ...(saved.linkIncludes || {}) },
    customEntries: Array.isArray(saved.customEntries)
      ? saved.customEntries
          .filter((row) => row && typeof row.id === "string" && typeof row.title === "string")
          .map((row, index) => ({
            id: row.id,
            sectionId: row.sectionId,
            title: row.title.trim(),
            subtitle: row.subtitle?.trim() || undefined,
            period: row.period?.trim() || undefined,
            location: row.location?.trim() || undefined,
            summary: row.summary?.trim() || undefined,
            highlights: row.highlights?.filter(Boolean),
            meta: row.meta?.trim() || undefined,
            order: row.order ?? index,
          }))
      : base.customEntries || [],
  };
}

export function getCvConfig(settings: SiteSettings | null | undefined): CvConfig {
  const saved = settings?.cvConfig as (CvConfig & { revision?: number }) | undefined;
  const languages =
    saved?.languages?.length
      ? saved.languages.map((lang, index) => ({
          id: lang.id,
          name: lang.name,
          proficiency: lang.proficiency ?? "",
          note: lang.note ?? "",
          showOnCv: lang.showOnCv !== false,
          order: lang.order ?? index,
        }))
      : DEFAULT_LANGUAGES;

  const expertise =
    saved?.expertise?.length
      ? saved.expertise.map((item, index) => ({
          ...item,
          order: item.order ?? index,
        }))
      : DEFAULT_EXPERTISE;

  // Revision < 3 used older IA (e.g. trailing links section causing orphan pages).
  // Rebuild format shells from current defaults while preserving admin headlines,
  // public flags, and record toggles.
  const stale = !saved || (saved.revision ?? 0) < CV_CONFIG_REVISION;

  const formats = (["professional", "compact", "executive"] as CvTemplateId[]).reduce(
    (acc, id) => {
      const base = DEFAULT_CV_CONFIG.formats[id];
      const prev = saved?.formats?.[id];
      if (stale) {
        acc[id] = {
          ...base,
          headline: prev?.headline?.trim() || base.headline,
          profileOverride: prev?.profileOverride,
          referencesText: prev?.referencesText,
          isPublic: prev?.isPublic ?? base.isPublic,
          showInHero: prev?.showInHero ?? base.showInHero,
          appearance: {
            ...base.appearance,
            ...(prev?.appearance || {}),
          },
          itemIncludes: { ...base.itemIncludes, ...(prev?.itemIncludes || {}) },
          itemOrder: { ...base.itemOrder, ...(prev?.itemOrder || {}) },
          itemOverrides: { ...base.itemOverrides, ...(prev?.itemOverrides || {}) },
          expertiseIncludes: { ...base.expertiseIncludes, ...(prev?.expertiseIncludes || {}) },
          skillGroupIncludes: { ...base.skillGroupIncludes, ...(prev?.skillGroupIncludes || {}) },
          languageIncludes: { ...base.languageIncludes, ...(prev?.languageIncludes || {}) },
          linkIncludes: { ...base.linkIncludes, ...(prev?.linkIncludes || {}) },
          customEntries: prev?.customEntries?.length ? prev.customEntries : base.customEntries || [],
        };
      } else {
        acc[id] = mergeFormat(base, prev);
      }
      return acc;
    },
    {} as Record<CvTemplateId, CvFormatConfig>
  );

  return {
    defaultTemplate: saved?.defaultTemplate || DEFAULT_CV_CONFIG.defaultTemplate,
    revision: CV_CONFIG_REVISION,
    languages,
    expertise,
    formats,
    access: normalizeCvAccess(saved?.access),
  };
}

export function isCvTemplateId(value: string | null | undefined): value is CvTemplateId {
  return value === "professional" || value === "compact" || value === "executive";
}

export function cvPdfFilename(template: CvTemplateId): string {
  if (template === "compact") return "Prince-Parfait-GANZA-Resume.pdf";
  if (template === "executive") return "Prince-Parfait-GANZA-Executive-Profile.pdf";
  return "Prince-Parfait-GANZA-Professional-CV.pdf";
}

export function canAccessCvTemplate(
  settings: SiteSettings,
  template: CvTemplateId,
  isAdmin: boolean
): boolean {
  const config = getCvConfig(settings);
  if (isAdmin) return true;
  if (template === config.defaultTemplate) return true;
  return Boolean(config.formats[template]?.isPublic);
}

function itemIncluded(format: CvFormatConfig, key: string, fallback = true): boolean {
  if (key in format.itemIncludes) return format.itemIncludes[key] !== false;
  return fallback;
}

function sortByOrder<T extends { key: string }>(items: T[], format: CvFormatConfig): T[] {
  return [...items].sort((a, b) => {
    const ao = format.itemOrder[a.key] ?? 999;
    const bo = format.itemOrder[b.key] ?? 999;
    if (ao !== bo) return ao - bo;
    return 0;
  });
}

function applyItemOverride(item: CvResolvedItem, format: CvFormatConfig): CvResolvedItem {
  const over = format.itemOverrides[item.key];
  if (!over) return item;
  return {
    ...item,
    title: over.title?.trim() || item.title,
    subtitle: over.subtitle?.trim() || item.subtitle,
    summary: over.summary?.trim() || item.summary,
    highlights: over.highlights?.length ? over.highlights.filter(Boolean) : item.highlights,
  };
}

function normalizeText(value?: string): string | undefined {
  const t = value?.replace(/\s+/g, " ").trim();
  return t || undefined;
}

function normalizeUrl(url?: string): string | undefined {
  const t = url?.trim();
  if (!t) return undefined;
  if (t.startsWith("/") || /^https?:\/\//i.test(t)) return t;
  return undefined;
}

function orgKeyFrom(name?: string): string | undefined {
  const t = name?.trim().toLowerCase();
  if (!t) return undefined;
  if (t.includes("lerony")) return "lerony";
  return t.replace(/[^a-z0-9]+/g, "-");
}

/** Split date ranges from engagement labels used in site experience rows. */
function periodAndMeta(
  period?: string,
  opts?: { type?: string; category?: string }
): { period?: string; meta?: string } {
  const raw = period?.trim();
  const looksLikeDate = Boolean(raw && /(?:present|\d{4})/i.test(raw));
  if (raw && looksLikeDate) {
    const normalized = raw.replace(/\s*[–—-]\s*/g, " – ");
    if (opts?.type === "training") return { period: normalized, meta: "Training engagement" };
    return { period: normalized };
  }
  if (raw) return { meta: raw };
  if (opts?.type === "training") return { meta: "Training engagement" };
  if (opts?.category === "leadership") return { meta: "Selected engagement" };
  return {};
}

function projectCategoryLabel(category?: string): string | undefined {
  if (!category) return undefined;
  const map: Record<string, string> = {
    systems: "Business system",
    product: "Independent product",
    web: "Engagement work",
    technology: "Technology venture",
    saas: "Product platform",
    mobile: "Mobile product",
    ai: "AI system",
    "open-source": "Open source",
    other: "Selected work",
  };
  return map[category] || "Selected work";
}

/** Deduplicate: once an org or shared record id appears, skip clones later. */
function filterDedupe(
  items: CvResolvedItem[],
  claimed: Set<string>,
  claim = true
): CvResolvedItem[] {
  const out: CvResolvedItem[] = [];
  for (const item of items) {
    const keys = [item.orgKey, item.key.split(":")[1] ? `id:${item.key.split(":")[1]}` : undefined].filter(
      Boolean
    ) as string[];
    if (keys.some((key) => claimed.has(key))) continue;
    out.push(item);
    if (claim) {
      for (const key of keys) claimed.add(key);
    }
  }
  return out;
}

function experienceItems(
  format: CvFormatConfig,
  template: CvTemplateId,
  claimed: Set<string>,
  settings: SiteSettings
): CvResolvedItem[] {
  const dense = template === "compact";
  const rows = careerRoles(settings)
    .filter((item) => itemIncluded(format, `experience:${item.id}`, true))
    .map((item) => {
      const { period, meta } = periodAndMeta(item.period, {
        type: item.roleType || "work",
        category: item.category,
      });
      return applyItemOverride(
        {
          key: `experience:${item.id}`,
          title: item.title,
          subtitle: item.organization,
          period,
          location: item.location,
          summary: dense
            ? normalizeText(item.summary)?.split(/(?<=\.)\s+/)[0]
            : normalizeText(item.summary),
          highlights: dense ? undefined : item.highlights?.filter(Boolean).slice(0, 4),
          meta,
          href: normalizeUrl(item.website || item.relatedHref),
          orgKey: orgKeyFrom(item.organization) || item.id,
        },
        format
      );
    });
  return filterDedupe(sortByOrder(rows, format), claimed, true);
}

function leadershipItems(format: CvFormatConfig, claimed: Set<string>, settings: SiteSettings): CvResolvedItem[] {
  const fromExp = careerRoles(settings)
    .filter((item) => item.category === "leadership" || item.id === "lerony")
    .filter((item) => itemIncluded(format, `leadership:${item.id}`, item.id === "lerony"))
    .map((item) =>
      applyItemOverride(
        {
          key: `leadership:${item.id}`,
          title: item.title,
          subtitle: item.organization,
          period: item.period,
          location: item.location,
          summary: normalizeText(item.summary),
          highlights: item.highlights?.filter(Boolean).slice(0, 4),
          href: normalizeUrl(item.website),
          orgKey: orgKeyFrom(item.organization) || item.id,
        },
        format
      )
    );

  const fromTimeline = timeline
    .filter((item) => item.type === "leadership")
    .filter((item) => !fromExp.some((e) => e.orgKey === (orgKeyFrom(item.organization) || item.id)))
    .filter((item) => itemIncluded(format, `leadership:${item.id}`, false))
    .map((item) =>
      applyItemOverride(
        {
          key: `leadership:${item.id}`,
          title: item.title,
          subtitle: item.organization,
          period: item.year,
          location: item.location,
          summary: normalizeText(item.summary || item.description),
          highlights: item.highlights?.filter(Boolean).slice(0, 4),
          href: normalizeUrl(item.website || item.relatedHref),
          orgKey: orgKeyFrom(item.organization) || item.id,
        },
        format
      )
    );

  return filterDedupe(sortByOrder([...fromExp, ...fromTimeline], format), claimed, true);
}

function educationItems(format: CvFormatConfig, settings: SiteSettings): CvResolvedItem[] {
  const rows = careerEducation(settings)
    .filter((item) => {
      const rawId = item.id.startsWith("edu-") ? item.id.slice(4) : item.id;
      return itemIncluded(format, `education:${rawId}`, true) || itemIncluded(format, `education:${item.id}`, true);
    })
    .map((item) => {
      const rawId = item.id.startsWith("edu-") ? item.id.slice(4) : item.id;
      return applyItemOverride(
        {
          key: `education:${rawId}`,
          title: item.title,
          subtitle: item.organization,
          period: item.period,
          summary: [item.status, item.note || item.summary].filter(Boolean).join(". "),
        },
        format
      );
    });
  return sortByOrder(rows, format);
}

function certificationItems(format: CvFormatConfig, settings: SiteSettings): CvResolvedItem[] {
  const rows = careerCertifications(settings)
    .filter((item) => {
      const rawId = item.id.startsWith("cert-") ? item.id.slice(5) : item.id;
      return (
        itemIncluded(format, `certifications:${rawId}`, true) ||
        itemIncluded(format, `certifications:${item.id}`, true)
      );
    })
    .map((item) => {
      const rawId = item.id.startsWith("cert-") ? item.id.slice(5) : item.id;
      return applyItemOverride(
        {
          key: `certifications:${rawId}`,
          title: item.title,
          subtitle: item.organization,
          period: item.period,
          summary: `${item.summary}${item.completedOn ? `. Completed ${item.completedOn}.` : ""}`,
          href: normalizeUrl(item.verifyUrl || item.relatedHref),
        },
        format
      );
    });
  return sortByOrder(rows, format);
}

function projectItems(
  format: CvFormatConfig,
  template: CvTemplateId,
  claimed: Set<string>
): CvResolvedItem[] {
  const dense = template === "compact";
  const rows = siteProjects
    .filter((item) => itemIncluded(format, `projects:${item.id}`, item.featured && item.id !== "lerony"))
    .map((item) =>
      applyItemOverride(
        {
          key: `projects:${item.id}`,
          title: item.title,
          subtitle: item.organization || item.myRole,
          period: item.period,
          summary: normalizeText(item.description),
          highlights: dense ? undefined : item.highlights?.filter(Boolean).slice(0, 3),
          meta:
            template === "professional"
              ? projectCategoryLabel(item.category)
              : item.technologies?.slice(0, 6).join(" · "),
          href: normalizeUrl(item.links.live || item.links.case_study),
          orgKey: orgKeyFrom(item.organization) || item.id,
        },
        format
      )
    );
  // Projects never claim — they only avoid orgs/ids already used as roles/leadership.
  return filterDedupe(sortByOrder(rows, format), claimed, false);
}

function achievementItems(format: CvFormatConfig): CvResolvedItem[] {
  const rows = timeline
    .filter((item) => item.type === "milestone")
    .filter((item) => itemIncluded(format, `achievements:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `achievements:${item.id}`,
          title: item.title,
          subtitle: item.organization,
          period: item.year,
          summary: normalizeText(item.description),
        },
        format
      )
    );
  return sortByOrder(rows, format);
}

function trainingItems(format: CvFormatConfig, settings: SiteSettings): CvResolvedItem[] {
  const fromExp = careerRoles(settings)
    .filter((item) => item.roleType === "training")
    .filter((item) => itemIncluded(format, `training:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `training:${item.id}`,
          title: item.title,
          subtitle: item.organization,
          period: item.period,
          location: item.location,
          summary: normalizeText(item.summary),
          highlights: item.highlights?.filter(Boolean).slice(0, 3),
        },
        format
      )
    );

  const fromSpeaking = speakingEngagements
    .filter((_, index) => itemIncluded(format, `training:speak-${index}`, true))
    .filter((item) => {
      const org = orgKeyFrom(item.event || item.location);
      return !fromExp.some((row) => row.orgKey && org && row.orgKey === org);
    })
    .map((item, index) =>
      applyItemOverride(
        {
          key: `training:speak-${index}`,
          title: item.title,
          subtitle: item.event,
          period: item.date,
          location: item.location,
          summary: normalizeText(item.topic),
          orgKey: orgKeyFrom(item.event),
        },
        format
      )
    );

  return sortByOrder([...fromExp, ...fromSpeaking], format);
}

function skillGroups(
  format: CvFormatConfig
): { category: string; names: string[] }[] {
  const included = siteSkills.filter((skill) => {
    if (format.skillGroupIncludes[skill.category] === false) return false;
    return itemIncluded(format, `skills:${skill.name}`, true);
  });
  const map = new Map<string, string[]>();
  for (const skill of included) {
    const label = SKILL_GROUP_LABELS[skill.category] || skill.category;
    const list = map.get(label) || [];
    list.push(skill.name);
    map.set(label, list);
  }
  return Array.from(map.entries()).map(([category, names]) => ({ category, names }));
}

function linkItems(
  settings: SiteSettings,
  format: CvFormatConfig
): CvResolvedItem[] {
  const socials = resolvedSocials(settings).filter((link) => link.enabled && link.url);
  const website = {
    id: "website",
    label: "Website",
    url: "https://www.princeparfait.com",
  };
  const pool = [
    website,
    ...socials.map((s) => ({ id: s.id, label: s.label, url: s.url })),
  ];

  const rows = pool
    .filter((link) => {
      if (link.id in format.linkIncludes) return format.linkIncludes[link.id] !== false;
      return (ESSENTIAL_LINK_IDS as readonly string[]).includes(link.id);
    })
    .map((link) =>
      applyItemOverride(
        {
          key: `links:${link.id}`,
          title: link.label,
          href: normalizeUrl(link.url),
          summary: normalizeUrl(link.url)?.replace(/^https?:\/\//, ""),
        },
        format
      )
    )
    .filter((item) => item.href);

  return sortByOrder(rows, format);
}

function sectionTitle(
  format: CvFormatConfig,
  id: CvSectionId,
  template: CvTemplateId
): string {
  const cfg = format.sections.find((s) => s.id === id);
  if (cfg?.titleOverride?.trim()) return cfg.titleOverride.trim();
  if (template === "executive" && EXECUTIVE_TITLES[id]) return EXECUTIVE_TITLES[id]!;
  return SECTION_TITLES[id];
}

function takeMax<T>(items: T[], max?: number): T[] {
  if (typeof max === "number" && max > 0) return items.slice(0, max);
  return items;
}

function customEntriesFor(
  format: CvFormatConfig,
  sectionId: CvCustomEntry["sectionId"]
): CvResolvedItem[] {
  const rows = (format.customEntries || [])
    .filter((row) => row.sectionId === sectionId && row.title.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return rows.map((row) =>
    applyItemOverride(
      {
        key: `custom:${row.id}`,
        title: row.title.trim(),
        subtitle: row.subtitle?.trim() || undefined,
        period: row.period?.trim() || undefined,
        location: row.location?.trim() || undefined,
        summary: normalizeText(row.summary),
        highlights: row.highlights?.filter(Boolean),
        meta: row.meta?.trim() || undefined,
      },
      format
    )
  );
}

function withCustoms(
  items: CvResolvedItem[],
  format: CvFormatConfig,
  sectionId: CvCustomEntry["sectionId"],
  maxItems?: number
): CvResolvedItem[] {
  return takeMax([...items, ...customEntriesFor(format, sectionId)], maxItems);
}

function defaultProfile(template: CvTemplateId, settings: SiteSettings): string {
  const bio = settings.bio?.trim() || "";
  if (!bio) return "";
  if (template === "compact") {
    return bio.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
  }
  return bio;
}

export function resolveCvDocument(
  settings: SiteSettings,
  templateId?: CvTemplateId,
  options?: { origin?: string }
): CvResolvedDocument {
  const config = getCvConfig(settings);
  const template = templateId || config.defaultTemplate;
  const format = config.formats[template];
  const name = settings.siteTitle?.trim() || "Prince Parfait GANZA";
  const headline = format.headline?.trim() || IDENTITY_ROLE_LINE;
  const profile = normalizeText(format.profileOverride) || defaultProfile(template, settings);
  const appearance = format.appearance || defaultAppearance(template);
  const photoSource =
    appearance.showPhoto
      ? appearance.photoUrl?.trim() || settings.heroImageUrl || settings.emailPortraitUrl || ""
      : "";
  const origin = options?.origin || siteUrl();
  const resolvedPhotoUrl = appearance.showPhoto
    ? absolutizeCvMedia(photoSource, origin)
    : undefined;

  const orderedSections = [...format.sections]
    .filter((s) => s.included)
    .sort((a, b) => a.order - b.order);

  const claimedOrgs = new Set<string>();
  const sections: CvResolvedDocument["sections"] = [];

  // Process leadership before experience/projects for correct dedupe when both enabled
  const sectionIds = orderedSections.map((s) => s.id);
  const leadershipFirst = sectionIds.includes("leadership");

  const built = new Map<CvSectionId, CvResolvedDocument["sections"][number]>();

  if (leadershipFirst) {
    const cfg = orderedSections.find((s) => s.id === "leadership")!;
    const items = takeMax(leadershipItems(format, claimedOrgs, settings), cfg.maxItems);
    if (items.length) {
      built.set("leadership", {
        id: "leadership",
        title: sectionTitle(format, "leadership", template),
        items,
      });
    }
  }

  for (const section of orderedSections) {
    if (section.id === "profile") {
      if (!profile) continue;
      built.set("profile", {
        id: "profile",
        title: sectionTitle(format, "profile", template),
        items: [],
        body: profile,
      });
      continue;
    }
    if (section.id === "expertise") {
      const chips = [...config.expertise]
        .sort((a, b) => a.order - b.order)
        .filter((item) => format.expertiseIncludes[item.id] !== false)
        .map((item) => item.label);
      if (chips.length) {
        built.set("expertise", {
          id: "expertise",
          title: sectionTitle(format, "expertise", template),
          items: [],
          chips,
        });
      }
      continue;
    }
    if (section.id === "leadership") {
      if (!built.has("leadership")) {
        const items = withCustoms(
          leadershipItems(format, claimedOrgs, settings),
          format,
          "leadership",
          section.maxItems
        );
        if (items.length) {
          built.set("leadership", {
            id: "leadership",
            title: sectionTitle(format, "leadership", template),
            items,
          });
        }
      }
      continue;
    }
    if (section.id === "experience") {
      const items = withCustoms(
        experienceItems(format, template, claimedOrgs, settings),
        format,
        "experience",
        section.maxItems
      );
      if (items.length) {
        built.set("experience", {
          id: "experience",
          title: sectionTitle(format, "experience", template),
          items,
        });
      }
      continue;
    }
    if (section.id === "projects") {
      const items = withCustoms(
        projectItems(format, template, claimedOrgs),
        format,
        "projects",
        section.maxItems
      );
      if (items.length) {
        built.set("projects", {
          id: "projects",
          title: sectionTitle(format, "projects", template),
          items,
        });
      }
      continue;
    }
    if (section.id === "education") {
      const items = withCustoms(educationItems(format, settings), format, "education", section.maxItems);
      if (items.length) {
        built.set("education", {
          id: "education",
          title: sectionTitle(format, "education", template),
          items,
        });
      }
      continue;
    }
    if (section.id === "skills") {
      const skillsByCategory = skillGroups(format);
      if (skillsByCategory.length) {
        built.set("skills", {
          id: "skills",
          title: sectionTitle(format, "skills", template),
          items: [],
          skillsByCategory,
        });
      }
      continue;
    }
    if (section.id === "languages") {
      const languages = [...config.languages]
        .sort((a, b) => a.order - b.order)
        .filter((lang) => lang.showOnCv && format.languageIncludes[lang.id] !== false)
        .filter((lang) => lang.name.trim())
        .map((lang) => ({
          name: lang.name.trim(),
          proficiency: lang.proficiency.trim() || undefined,
          note: lang.note?.trim() || undefined,
        }));
      if (languages.length) {
        built.set("languages", {
          id: "languages",
          title: sectionTitle(format, "languages", template),
          items: [],
          languages,
        });
      }
      continue;
    }
    if (section.id === "achievements") {
      const items = withCustoms(achievementItems(format), format, "achievements", section.maxItems);
      if (items.length) {
        built.set("achievements", {
          id: "achievements",
          title: sectionTitle(format, "achievements", template),
          items,
        });
      }
      continue;
    }
    if (section.id === "training") {
      const items = withCustoms(trainingItems(format, settings), format, "training", section.maxItems);
      if (items.length) {
        built.set("training", {
          id: "training",
          title: sectionTitle(format, "training", template),
          items,
        });
      }
      continue;
    }
    if (section.id === "certifications") {
      const items = withCustoms(certificationItems(format, settings), format, "certifications", section.maxItems);
      const legacyNote = format.itemOverrides["certifications:note"]?.summary?.trim();
      if (items.length || legacyNote) {
        built.set("certifications", {
          id: "certifications",
          title: sectionTitle(format, "certifications", template),
          items,
          body: items.length ? undefined : legacyNote,
        });
      }
      continue;
    }
    if (section.id === "links") {
      const items = takeMax(linkItems(settings, format), section.maxItems ?? 4);
      if (items.length) {
        built.set("links", {
          id: "links",
          title: sectionTitle(format, "links", template),
          items,
        });
      }
      continue;
    }
    if (section.id === "references") {
      const body = normalizeText(format.referencesText) || "References available on request.";
      built.set("references", {
        id: "references",
        title: sectionTitle(format, "references", template),
        items: [],
        body,
      });
    }
  }

  for (const section of orderedSections) {
    const builtSection = built.get(section.id);
    if (builtSection) sections.push(builtSection);
  }

  const headerLinks = linkItems(settings, {
    ...format,
    linkIncludes: {
      linkedin: format.linkIncludes.linkedin !== false,
      github: format.linkIncludes.github !== false,
      website: false,
    },
  }).map((item) => ({
    id: item.key.replace(/^links:/, ""),
    label: item.title,
    url: item.href || "",
  }));

  return {
    template,
    label: format.label,
    name,
    headline,
    profile,
    appearance: {
      ...appearance,
      photoUrl: photoSource,
      resolvedPhotoUrl,
    },
    contact: {
      email: normalizeText(contactEmailsFrom(settings).primary),
      emailSecondary: normalizeText(contactEmailsFrom(settings).secondary) || undefined,
      phone: normalizeText(settings.phoneNumber),
      location: normalizeText(settings.location) || "Kigali, Rwanda",
      website: "https://www.princeparfait.com",
      links: headerLinks,
    },
    sections,
  };
}

export function cvCatalogItems(settings?: SiteSettings): {
  key: string;
  label: string;
  group: "Experience" | "Leadership" | "Projects" | "Education" | "Certifications" | "Training" | "Achievements";
}[] {
  const items: {
    key: string;
    label: string;
    group: "Experience" | "Leadership" | "Projects" | "Education" | "Certifications" | "Training" | "Achievements";
  }[] = [];

  const career = careerFrom(settings);

  for (const item of career.records.filter((row) => row.kind === "role")) {
    items.push({
      key: `experience:${item.id}`,
      label: `${item.title} — ${item.organization}`,
      group: "Experience",
    });
    if (item.category === "leadership" || item.id === "lerony") {
      items.push({
        key: `leadership:${item.id}`,
        label: `${item.title} — ${item.organization}`,
        group: "Leadership",
      });
    }
    if (item.roleType === "training") {
      items.push({
        key: `training:${item.id}`,
        label: `${item.title} — ${item.organization}`,
        group: "Training",
      });
    }
  }
  for (const item of career.records.filter((row) => row.kind === "education")) {
    const rawId = item.id.startsWith("edu-") ? item.id.slice(4) : item.id;
    items.push({
      key: `education:${rawId}`,
      label: `${item.title} — ${item.organization}`,
      group: "Education",
    });
  }
  for (const item of career.records.filter((row) => row.kind === "certification")) {
    const rawId = item.id.startsWith("cert-") ? item.id.slice(5) : item.id;
    items.push({
      key: `certifications:${rawId}`,
      label: `${item.title} — ${item.organization}`,
      group: "Certifications",
    });
  }
  for (const item of siteProjects) {
    items.push({ key: `projects:${item.id}`, label: item.title, group: "Projects" });
  }
  speakingEngagements.forEach((item, index) => {
    items.push({
      key: `training:speak-${index}`,
      label: `${item.title} — ${item.event}`,
      group: "Training",
    });
  });
  timeline
    .filter((item) => item.type === "milestone")
    .forEach((item) => {
      items.push({ key: `achievements:${item.id}`, label: item.title, group: "Achievements" });
    });
  return items;
}

export const CV_SECTION_OPTIONS: { id: CvSectionId; label: string }[] = (
  Object.keys(SECTION_TITLES) as CvSectionId[]
).map((id) => ({ id, label: SECTION_TITLES[id] }));

export const CV_TEMPLATE_OPTIONS: {
  id: CvTemplateId;
  label: string;
  hint: string;
  description: string;
  tags: [string, string];
  viewLabel: string;
}[] = [
  {
    id: "professional",
    label: TEMPLATE_LABELS.professional,
    hint: "Detailed professional document, typically 2–3 pages",
    description: "Detailed document with full experience, projects, skills and education.",
    tags: ["2–3 pages", "Complete profile"],
    viewLabel: "View CV",
  },
  {
    id: "compact",
    label: TEMPLATE_LABELS.compact,
    hint: "Concise resume, ideally 1 page",
    description: "Concise and focused. Ideal for quick sharing and applications.",
    tags: ["1–2 pages", "Key highlights"],
    viewLabel: "View Resume",
  },
  {
    id: "executive",
    label: TEMPLATE_LABELS.executive,
    hint: "Leadership, ventures, major engagements, selected impact",
    description: "Leadership-focused profile, highlighting entrepreneurship and key engagements.",
    tags: ["1–2 pages", "Leadership & impact"],
    viewLabel: "View Profile",
  },
];

export function skillGroupOptions(): { id: string; label: string }[] {
  return [...new Set(siteSkills.map((s) => s.category))].map((id) => ({
    id,
    label: SKILL_GROUP_LABELS[id] || id,
  }));
}
