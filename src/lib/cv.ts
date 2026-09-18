import {
  education as siteEducation,
  experience as siteExperience,
  projects as siteProjects,
  skills as siteSkills,
  speakingEngagements,
  timeline,
} from "@/data/site-data";
import { socialsFor } from "@/lib/socials";
import type { SiteSettings } from "@/lib/supabase";

export type CvTemplateId = "professional" | "compact" | "executive";

export type CvSectionId =
  | "summary"
  | "contact"
  | "experience"
  | "education"
  | "projects"
  | "skills"
  | "leadership"
  | "achievements"
  | "training"
  | "certifications"
  | "links"
  | "references";

export type CvSectionConfig = {
  id: CvSectionId;
  included: boolean;
  order: number;
};

export type CvItemOverride = {
  title?: string;
  subtitle?: string;
  summary?: string;
  highlights?: string[];
};

export type CvFormatConfig = {
  template: CvTemplateId;
  label: string;
  /** Visible as an alternate download on the public /cv page */
  isPublic: boolean;
  sections: CvSectionConfig[];
  /** Keyed as `source:id` e.g. `experience:lerony` */
  itemIncludes: Record<string, boolean>;
  itemOrder: Record<string, number>;
  overrides: {
    headline?: string;
    summary?: string;
    references?: string;
    items?: Record<string, CvItemOverride>;
  };
};

export type CvConfig = {
  defaultTemplate: CvTemplateId;
  formats: Record<CvTemplateId, CvFormatConfig>;
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
};

export type CvResolvedDocument = {
  template: CvTemplateId;
  label: string;
  name: string;
  headline: string;
  summary: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    links: { label: string; url: string }[];
  };
  sections: {
    id: CvSectionId;
    title: string;
    items: CvResolvedItem[];
    body?: string;
    skillsByCategory?: { category: string; names: string[] }[];
  }[];
};

const SECTION_TITLES: Record<CvSectionId, string> = {
  summary: "Profile",
  contact: "Contact",
  experience: "Experience",
  education: "Education",
  projects: "Selected work",
  skills: "Skills",
  leadership: "Leadership",
  achievements: "Achievements",
  training: "Training & speaking",
  certifications: "Certifications",
  links: "Links",
  references: "References",
};

const TEMPLATE_LABELS: Record<CvTemplateId, string> = {
  professional: "Professional CV",
  compact: "Compact Resume",
  executive: "Executive / Profile CV",
};

function sectionsFor(
  ids: { id: CvSectionId; included?: boolean }[]
): CvSectionConfig[] {
  return ids.map((item, index) => ({
    id: item.id,
    included: item.included !== false,
    order: index,
  }));
}

function defaultFormat(template: CvTemplateId): CvFormatConfig {
  if (template === "compact") {
    return {
      template,
      label: TEMPLATE_LABELS.compact,
      isPublic: false,
      sections: sectionsFor([
        { id: "summary" },
        { id: "contact" },
        { id: "experience" },
        { id: "education" },
        { id: "skills" },
        { id: "projects", included: false },
        { id: "links", included: false },
        { id: "leadership", included: false },
        { id: "achievements", included: false },
        { id: "training", included: false },
        { id: "certifications", included: false },
        { id: "references", included: false },
      ]),
      itemIncludes: {},
      itemOrder: {},
      overrides: {},
    };
  }
  if (template === "executive") {
    return {
      template,
      label: TEMPLATE_LABELS.executive,
      isPublic: false,
      sections: sectionsFor([
        { id: "summary" },
        { id: "contact" },
        { id: "leadership" },
        { id: "achievements" },
        { id: "projects" },
        { id: "experience" },
        { id: "skills" },
        { id: "education" },
        { id: "training", included: false },
        { id: "links" },
        { id: "certifications", included: false },
        { id: "references", included: false },
      ]),
      itemIncludes: {},
      itemOrder: {},
      overrides: {},
    };
  }
  return {
    template: "professional",
    label: TEMPLATE_LABELS.professional,
    isPublic: true,
    sections: sectionsFor([
      { id: "summary" },
      { id: "contact" },
      { id: "experience" },
      { id: "leadership", included: false },
      { id: "education" },
      { id: "projects" },
      { id: "skills" },
      { id: "training" },
      { id: "achievements" },
      { id: "links" },
      { id: "certifications", included: false },
      { id: "references", included: false },
    ]),
    itemIncludes: {},
    itemOrder: {},
    overrides: {},
  };
}

export const DEFAULT_CV_CONFIG: CvConfig = {
  defaultTemplate: "professional",
  formats: {
    professional: defaultFormat("professional"),
    compact: defaultFormat("compact"),
    executive: defaultFormat("executive"),
  },
};

function mergeFormat(base: CvFormatConfig, saved?: Partial<CvFormatConfig>): CvFormatConfig {
  if (!saved) return base;
  const sectionMap = new Map(base.sections.map((s) => [s.id, s]));
  for (const s of saved.sections || []) {
    const prev = sectionMap.get(s.id);
    if (prev) sectionMap.set(s.id, { ...prev, ...s });
  }
  const sections = Array.from(sectionMap.values()).sort((a, b) => a.order - b.order);
  return {
    ...base,
    ...saved,
    template: base.template,
    label: saved.label || base.label,
    isPublic: saved.isPublic ?? base.isPublic,
    sections,
    itemIncludes: { ...base.itemIncludes, ...(saved.itemIncludes || {}) },
    itemOrder: { ...base.itemOrder, ...(saved.itemOrder || {}) },
    overrides: {
      ...base.overrides,
      ...(saved.overrides || {}),
      items: { ...(base.overrides.items || {}), ...(saved.overrides?.items || {}) },
    },
  };
}

export function getCvConfig(settings: SiteSettings | null | undefined): CvConfig {
  const saved = settings?.cvConfig;
  return {
    defaultTemplate: saved?.defaultTemplate || DEFAULT_CV_CONFIG.defaultTemplate,
    formats: {
      professional: mergeFormat(DEFAULT_CV_CONFIG.formats.professional, saved?.formats?.professional),
      compact: mergeFormat(DEFAULT_CV_CONFIG.formats.compact, saved?.formats?.compact),
      executive: mergeFormat(DEFAULT_CV_CONFIG.formats.executive, saved?.formats?.executive),
    },
  };
}

export function isCvTemplateId(value: string | null | undefined): value is CvTemplateId {
  return value === "professional" || value === "compact" || value === "executive";
}

export function cvPdfFilename(template: CvTemplateId): string {
  if (template === "compact") return "Prince-Parfait-GANZA-Resume.pdf";
  if (template === "executive") return "Prince-Parfait-GANZA-Executive-CV.pdf";
  return "Prince-Parfait-GANZA-CV.pdf";
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
  const over = format.overrides.items?.[item.key];
  if (!over) return item;
  return {
    ...item,
    title: over.title?.trim() || item.title,
    subtitle: over.subtitle?.trim() || item.subtitle,
    summary: over.summary?.trim() || item.summary,
    highlights: over.highlights?.length ? over.highlights : item.highlights,
  };
}

function experienceItems(format: CvFormatConfig, template: CvTemplateId): CvResolvedItem[] {
  const compact = template === "compact";
  const rows = siteExperience
    .filter((item) => itemIncluded(format, `experience:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `experience:${item.id}`,
          title: item.role,
          subtitle: item.organization,
          period: item.period,
          location: item.location,
          summary: item.summary,
          highlights: compact ? undefined : item.highlights,
          href: item.website || item.relatedHref,
        },
        format
      )
    );
  return sortByOrder(rows, format);
}

function leadershipItems(format: CvFormatConfig): CvResolvedItem[] {
  const fromExp = siteExperience
    .filter((item) => item.category === "leadership")
    .filter((item) => itemIncluded(format, `leadership:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `leadership:${item.id}`,
          title: item.role,
          subtitle: item.organization,
          period: item.period,
          location: item.location,
          summary: item.summary,
          highlights: item.highlights,
          href: item.website,
        },
        format
      )
    );

  const fromTimeline = timeline
    .filter((item) => item.type === "leadership")
    .filter((item) => !fromExp.some((e) => e.key === `leadership:${item.id}`))
    .filter((item) => itemIncluded(format, `leadership:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `leadership:${item.id}`,
          title: item.title,
          subtitle: item.organization,
          period: item.year,
          location: item.location,
          summary: item.summary || item.description,
          highlights: item.highlights,
          href: item.website || item.relatedHref,
        },
        format
      )
    );

  return sortByOrder([...fromExp, ...fromTimeline], format);
}

function educationItems(format: CvFormatConfig): CvResolvedItem[] {
  const rows = siteEducation
    .filter((item) => itemIncluded(format, `education:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `education:${item.id}`,
          title: item.program,
          subtitle: item.institution,
          period: item.period,
          summary: [item.status, item.note].filter(Boolean).join(". "),
        },
        format
      )
    );
  return sortByOrder(rows, format);
}

function projectItems(format: CvFormatConfig, template: CvTemplateId): CvResolvedItem[] {
  const preferFeatured = true;
  const highlightLimit = template === "executive" ? 3 : template === "compact" ? 0 : 3;
  const rows = siteProjects
    .filter((item) => (preferFeatured ? item.featured : true))
    .filter((item) => itemIncluded(format, `projects:${item.id}`, item.featured))
    .map((item) =>
      applyItemOverride(
        {
          key: `projects:${item.id}`,
          title: item.title,
          subtitle: item.organization || item.myRole,
          period: item.period,
          summary: item.description,
          highlights:
            highlightLimit > 0 ? item.highlights?.slice(0, highlightLimit) : undefined,
          meta: item.technologies?.slice(0, 6).join(" · "),
          href: item.links.live || item.links.case_study,
        },
        format
      )
    );
  return sortByOrder(rows, format);
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
          summary: item.description,
        },
        format
      )
    );
  return sortByOrder(rows, format);
}

function trainingItems(format: CvFormatConfig): CvResolvedItem[] {
  const fromExp = siteExperience
    .filter((item) => item.type === "training")
    .filter((item) => itemIncluded(format, `training:${item.id}`, true))
    .map((item) =>
      applyItemOverride(
        {
          key: `training:${item.id}`,
          title: item.role,
          subtitle: item.organization,
          period: item.period,
          location: item.location,
          summary: item.summary,
          highlights: item.highlights,
        },
        format
      )
    );

  const fromSpeaking = speakingEngagements
    .filter((_, index) => itemIncluded(format, `training:speak-${index}`, true))
    .map((item, index) =>
      applyItemOverride(
        {
          key: `training:speak-${index}`,
          title: item.title,
          subtitle: item.event,
          period: item.date,
          location: item.location,
          summary: item.topic,
        },
        format
      )
    );

  return sortByOrder([...fromExp, ...fromSpeaking], format);
}

function skillGroups(format: CvFormatConfig): { category: string; names: string[] }[] {
  const included = siteSkills.filter((skill) =>
    itemIncluded(format, `skills:${skill.name}`, true)
  );
  const map = new Map<string, string[]>();
  for (const skill of included) {
    const list = map.get(skill.category) || [];
    list.push(skill.name);
    map.set(skill.category, list);
  }
  return Array.from(map.entries()).map(([category, names]) => ({ category, names }));
}

function linkItems(settings: SiteSettings, format: CvFormatConfig): CvResolvedItem[] {
  const socials = socialsFor(settings, "footer").filter((link) =>
    itemIncluded(format, `links:${link.id}`, true)
  );
  const rows = socials.map((link) =>
    applyItemOverride(
      {
        key: `links:${link.id}`,
        title: link.label,
        href: link.url,
        summary: link.url,
      },
      format
    )
  );
  return sortByOrder(rows, format);
}

export function resolveCvDocument(
  settings: SiteSettings,
  templateId?: CvTemplateId
): CvResolvedDocument {
  const config = getCvConfig(settings);
  const template = templateId || config.defaultTemplate;
  const format = config.formats[template];
  const name = settings.siteTitle?.trim() || "Prince Parfait GANZA";
  const headline =
    format.overrides.headline?.trim() ||
    settings.siteSubtitle?.trim() ||
    "Founder · Entrepreneur · Technologist";
  const summary =
    format.overrides.summary?.trim() ||
    settings.bio?.trim() ||
    "Rwandan founder, entrepreneur and technologist working from Kigali.";

  const orderedSections = [...format.sections]
    .filter((s) => s.included)
    .sort((a, b) => a.order - b.order);

  const sections: CvResolvedDocument["sections"] = [];

  for (const section of orderedSections) {
    if (section.id === "summary") {
      sections.push({ id: "summary", title: SECTION_TITLES.summary, items: [], body: summary });
      continue;
    }
    if (section.id === "contact") {
      sections.push({
        id: "contact",
        title: SECTION_TITLES.contact,
        items: [],
        body: [settings.contactEmail, settings.phoneNumber, settings.location]
          .filter(Boolean)
          .join(" · "),
      });
      continue;
    }
    if (section.id === "experience") {
      const items = experienceItems(format, template);
      if (items.length) sections.push({ id: "experience", title: SECTION_TITLES.experience, items });
      continue;
    }
    if (section.id === "leadership") {
      const items = leadershipItems(format);
      if (items.length) sections.push({ id: "leadership", title: SECTION_TITLES.leadership, items });
      continue;
    }
    if (section.id === "education") {
      const items = educationItems(format);
      if (items.length) sections.push({ id: "education", title: SECTION_TITLES.education, items });
      continue;
    }
    if (section.id === "projects") {
      const items = projectItems(format, template);
      if (items.length) sections.push({ id: "projects", title: SECTION_TITLES.projects, items });
      continue;
    }
    if (section.id === "skills") {
      const skillsByCategory = skillGroups(format);
      if (skillsByCategory.length) {
        sections.push({
          id: "skills",
          title: SECTION_TITLES.skills,
          items: [],
          skillsByCategory,
        });
      }
      continue;
    }
    if (section.id === "achievements") {
      const items = achievementItems(format);
      if (items.length) sections.push({ id: "achievements", title: SECTION_TITLES.achievements, items });
      continue;
    }
    if (section.id === "training") {
      const items = trainingItems(format);
      if (items.length) sections.push({ id: "training", title: SECTION_TITLES.training, items });
      continue;
    }
    if (section.id === "certifications") {
      // No verified certifications in site-data; keep section available for overrides only.
      const body = format.overrides.items?.["certifications:note"]?.summary?.trim();
      if (body) {
        sections.push({ id: "certifications", title: SECTION_TITLES.certifications, items: [], body });
      }
      continue;
    }
    if (section.id === "links") {
      const items = linkItems(settings, format);
      if (items.length) sections.push({ id: "links", title: SECTION_TITLES.links, items });
      continue;
    }
    if (section.id === "references") {
      const body =
        format.overrides.references?.trim() ||
        "References available on request.";
      sections.push({ id: "references", title: SECTION_TITLES.references, items: [], body });
    }
  }

  const links = socialsFor(settings, "footer")
    .slice(0, 6)
    .map((link) => ({ label: link.label, url: link.url }));

  return {
    template,
    label: format.label,
    name,
    headline,
    summary,
    contact: {
      email: settings.contactEmail,
      phone: settings.phoneNumber,
      location: settings.location,
      website: "https://www.princeparfait.com",
      links,
    },
    sections,
  };
}

export function cvCatalogItems(template: CvTemplateId): { key: string; label: string; group: string }[] {
  const format = defaultFormat(template);
  void format;
  const items: { key: string; label: string; group: string }[] = [];
  for (const item of siteExperience) {
    items.push({ key: `experience:${item.id}`, label: `${item.role} — ${item.organization}`, group: "Experience" });
    if (item.category === "leadership") {
      items.push({ key: `leadership:${item.id}`, label: `${item.role} — ${item.organization}`, group: "Leadership" });
    }
    if (item.type === "training") {
      items.push({ key: `training:${item.id}`, label: `${item.role} — ${item.organization}`, group: "Training" });
    }
  }
  for (const item of siteEducation) {
    items.push({ key: `education:${item.id}`, label: `${item.program} — ${item.institution}`, group: "Education" });
  }
  for (const item of siteProjects) {
    items.push({ key: `projects:${item.id}`, label: item.title, group: "Projects" });
  }
  for (const skill of siteSkills) {
    items.push({ key: `skills:${skill.name}`, label: skill.name, group: `Skills · ${skill.category}` });
  }
  timeline
    .filter((item) => item.type === "milestone")
    .forEach((item) => {
      items.push({ key: `achievements:${item.id}`, label: item.title, group: "Achievements" });
    });
  speakingEngagements.forEach((item, index) => {
    items.push({ key: `training:speak-${index}`, label: `${item.title} — ${item.event}`, group: "Training" });
  });
  return items;
}

export const CV_SECTION_OPTIONS: { id: CvSectionId; label: string }[] = (
  Object.keys(SECTION_TITLES) as CvSectionId[]
).map((id) => ({ id, label: SECTION_TITLES[id] }));

export const CV_TEMPLATE_OPTIONS: { id: CvTemplateId; label: string; hint: string }[] = [
  { id: "professional", label: TEMPLATE_LABELS.professional, hint: "Detailed, approximately two pages" },
  { id: "compact", label: TEMPLATE_LABELS.compact, hint: "Concise, ideally one page" },
  { id: "executive", label: TEMPLATE_LABELS.executive, hint: "Leadership, ventures, selected work" },
];
