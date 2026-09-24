/**
 * Maps an editable `CvDocument` onto the `CvResolvedDocument` shape already
 * consumed by `CvDocumentSheet` and the PDF renderers, so library documents
 * reuse the Professional / Compact / Executive layouts unchanged.
 */

import {
  absolutizeCvMedia,
  type CvAppearance,
  type CvFooterStyle,
  type CvHeaderStyle,
  type CvResolvedDocument,
  type CvResolvedItem,
  type CvSectionId,
  type CvTemplateId,
} from "@/lib/cv";
import {
  cvLayoutTemplate,
  fieldText,
  fieldValue,
  resolvedSectionIdFor,
  supportsItemsPerRow,
  visibleBullets,
  type CvDocument,
  type CvItem,
  type CvLayoutId,
  type CvSection,
} from "@/lib/cv-library";
import { siteUrl } from "@/lib/env";

const HEADER_STYLE: Record<CvLayoutId, CvHeaderStyle> = {
  professional: "split",
  technical: "split",
  compact: "centered",
  modern: "banner",
};

const FOOTER_STYLE: Record<CvLayoutId, CvFooterStyle> = {
  professional: "paged",
  technical: "paged",
  compact: "centered",
  modern: "paged",
};

function csv(value?: string): string[] {
  return (value || "")
    .split(/[,;]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function itemToResolved(item: CvItem, section: CvSection): CvResolvedItem {
  const showDates = section.layout.showDates !== false;
  const showDescriptions = section.layout.showDescriptions !== false;
  const showTech = section.layout.showTechnologies !== false;
  const tech = showTech ? fieldText(item.technologies) : undefined;
  const bullets = showDescriptions ? visibleBullets(item) : [];

  return {
    key: item.id,
    title: fieldValue(item.title),
    subtitle: fieldText(item.organization),
    period: showDates ? fieldText(item.period) : undefined,
    location: fieldText(item.location),
    summary: showDescriptions ? fieldText(item.summary) : undefined,
    highlights: bullets.length ? bullets : undefined,
    meta: tech,
  };
}

function isChipSection(section: CvSection): boolean {
  if (!supportsItemsPerRow(section.kind)) return false;
  if (section.layout.itemsPerRow < 2) return false;
  const visible = section.items.filter((item) => !item.hidden);
  if (!visible.length) return false;
  return visible.every(
    (item) =>
      !fieldValue(item.summary) &&
      !fieldValue(item.organization) &&
      !fieldValue(item.period) &&
      !fieldValue(item.technologies) &&
      !visibleBullets(item).length
  );
}

function resolveSection(section: CvSection): CvResolvedDocument["sections"][number] | null {
  const id: CvSectionId = resolvedSectionIdFor(section.kind);
  const title = section.title?.trim() || "";
  const body = fieldText(section.body);
  const items = section.items.filter((item) => !item.hidden && fieldValue(item.title));

  const base = { id, key: section.id, title, items: [] as CvResolvedItem[] };

  if (section.kind === "summary" || section.kind === "references") {
    if (!body) return null;
    return { ...base, body };
  }

  if (section.kind === "skills") {
    const groups = items
      .map((item) => ({ category: fieldValue(item.title), names: csv(fieldValue(item.technologies)) }))
      .filter((group) => group.category && group.names.length);
    if (groups.length) return { ...base, skillsByCategory: groups };
    if (items.length) return { ...base, chips: items.map((item) => fieldValue(item.title)) };
    return body ? { ...base, body } : null;
  }

  if (section.kind === "languages") {
    const languages = items.map((item) => ({
      name: fieldValue(item.title),
      proficiency: fieldText(item.summary),
      note: fieldText(item.organization),
    }));
    if (!languages.length) return body ? { ...base, body } : null;
    return { ...base, languages };
  }

  if (isChipSection(section)) {
    return { ...base, chips: items.map((item) => fieldValue(item.title)), body };
  }

  if (!items.length && !body) return null;

  return {
    ...base,
    items: items.map((item) => itemToResolved(item, section)),
    body: items.length ? undefined : body,
  };
}

export function cvDocumentTemplate(doc: CvDocument): CvTemplateId {
  return cvLayoutTemplate(doc.layoutId);
}

export function resolveLibraryDocument(
  doc: CvDocument,
  options?: { origin?: string }
): CvResolvedDocument {
  const template = cvLayoutTemplate(doc.layoutId);
  const ats = doc.atsSafe === true;
  const origin = options?.origin || siteUrl();
  const showPhoto = Boolean(doc.showPhoto) && !ats && Boolean(doc.photoUrl?.trim());

  const appearance: CvAppearance & { resolvedPhotoUrl?: string } = {
    headerStyle: HEADER_STYLE[doc.layoutId] || "split",
    footerStyle: ats ? "minimal" : FOOTER_STYLE[doc.layoutId] || "paged",
    showPhoto,
    photoUrl: doc.photoUrl || "",
    photoShape: doc.layoutId === "modern" ? "rounded" : "circle",
    // ATS exports drop decorative pull quotes; other layouts fall back to the
    // renderer default when empty.
    tagline: ats ? "" : doc.targetRole?.trim() || "",
    resolvedPhotoUrl: showPhoto ? absolutizeCvMedia(doc.photoUrl, origin) : undefined,
  };

  const sections = doc.sections
    .filter((section) => !section.hidden && section.kind !== "header")
    .map((section) => resolveSection(section))
    .filter(Boolean) as CvResolvedDocument["sections"];

  const summary = sections.find((section) => section.id === "profile")?.body || "";

  const links: { id: string; label: string; url: string }[] = [];
  const linkedin = fieldValue(doc.linkedin);
  const github = fieldValue(doc.github);
  if (linkedin) links.push({ id: "linkedin", label: "LinkedIn", url: linkedin });
  if (github) links.push({ id: "github", label: "GitHub", url: github });

  return {
    template,
    label: doc.targetRole?.trim() || doc.name,
    name: fieldValue(doc.displayName) || doc.name,
    headline: fieldValue(doc.headline),
    profile: summary,
    appearance,
    contact: {
      email: fieldText(doc.email),
      emailSecondary: fieldText(doc.emailSecondary),
      phone: fieldText(doc.phone),
      location: fieldText(doc.location),
      website: fieldText(doc.website),
      links,
    },
    sections,
  };
}
