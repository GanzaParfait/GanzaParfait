/**
 * Canonical public identity for princeparfait.com.
 * Identity ≠ Specialization ≠ Capability ≠ Technology — do not flatten these.
 * Source of truth alongside docs/PORTFOLIO_CONTEXT.md.
 */

export const CANONICAL_NAME = "Prince Parfait GANZA";

/** Public role line — the only identity headline. */
export const IDENTITY_ROLE_LINE = "Software Engineer · Technology Entrepreneur · Founder";

/**
 * Homepage hero descriptor list only — not job titles. Never use for schema,
 * SEO titles, CV headlines, Contact or the global role line.
 */
export const HERO_DESCRIPTOR_LINE =
  "Software Engineer · Technology Entrepreneur · Research Technology · Data Systems & Analytics · Founder";

/** Default CV headlines. Targeted CVs may differ; these replace inherited legacy lines only. */
export const CV_DEFAULT_HEADLINES = {
  professional: "Software Engineer · Digital Systems",
  compact: "Software Engineer · Technology Entrepreneur",
  executive: "Founder & CEO · Technology & Innovation",
} as const;

/** Company leadership title — use only for LERONY Ltd. */
export const COMPANY_ROLE = "Founder & CEO, LERONY Ltd";

/** Recommended LinkedIn headline (not dumped into meta keywords). */
export const LINKEDIN_HEADLINE =
  "Software Engineer & Technology Entrepreneur | Research Technology & Data Systems | Founder & CEO, LERONY Ltd";

export const IDENTITY_POSITIONING =
  "I design and build software, research technology and data systems that help organizations collect information, run operations and make better decisions.";

export const IDENTITY_PAGE_TITLE =
  "Prince Parfait GANZA | Software Engineer & Technology Entrepreneur in Kigali";

export const IDENTITY_DESCRIPTION =
  "Prince Parfait GANZA is a software engineer and technology entrepreneur based in Kigali. Founder and CEO of LERONY Ltd. He builds digital systems, research and survey platforms, and organizational data systems for real operations.";

export const IDENTITY_SHORT_BIO =
  "Prince Parfait GANZA is a software engineer and technology entrepreneur based in Kigali. He leads LERONY Ltd and works across software systems, research technology, digital data collection and organizational reporting, turning operational problems into dependable tools.";

export const IDENTITY_COMPACT_BIO =
  "Software engineer and technology entrepreneur building software, research technology and data systems from Kigali.";

export const IDENTITY_PORTRAIT_ALT =
  "Prince Parfait GANZA, software engineer and Founder of LERONY Ltd";

/** Prefer this for module-level defaults — safe if imported before `PORTRAIT_PATHS` binds. */
export const DEFAULT_PORTRAIT_WEBP = "/images/profile/prince-parfait-ganza.webp";

/** Stable entity portrait paths (permanent filenames — never hashed CMS URLs). */
export const PORTRAIT_PATHS = {
  /** Primary canonical portrait for Person JSON-LD + About */
  canonical: "/images/profile/prince-parfait-ganza.jpg",
  webp: DEFAULT_PORTRAIT_WEBP,
  ratio1x1: "/images/profile/prince-parfait-ganza-1x1.jpg",
  ratio4x3: "/images/profile/prince-parfait-ganza-4x3.jpg",
  ratio16x9: "/images/profile/prince-parfait-ganza-16x9.jpg",
} as const;

/** Specialization pillars — evidence domains, not job titles. */
export const SPECIALIZATIONS = [
  {
    id: "software-systems",
    title: "Software Engineering & Digital Systems",
    summary:
      "Production web applications, business platforms and organizational software, from architecture and interfaces to backend services, databases, integrations and delivery.",
    evidence: ["askfield", "stockpro", "caritas-systems", "psta-accounting", "lerony", "apn-african-marketplace", "julia-foundation", "wakow-general", "goa-plus"],
  },
  {
    id: "research-technology",
    title: "Research Technology & Digital Data Collection",
    summary:
      "Digital research and survey systems: questionnaire programming, validation logic, CAPI/CATI/CAWI workflows, field operations, GPS-enabled collection, monitoring and research-data export.",
    evidence: ["askfield"],
  },
  {
    id: "data-decision",
    title: "Data Systems, Analytics & Decision Support",
    summary:
      "Organizational and research data structured for monitoring, reporting and decisions: indicators, dashboards, disaggregation, exports and analytical reporting.",
    evidence: ["caritas-systems", "eshuri"],
  },
] as const;

/** Known outdated identity strings — migrate to IDENTITY_ROLE_LINE. */
export const LEGACY_ROLE_LINES = [
  "Founder · Entrepreneur · Technologist · Software Engineer · AI Builder",
  "Founder · Entrepreneur · Technologist",
  "Founder • Software Engineer • AI Builder • Speaker • Entrepreneur",
  "Founder • Entrepreneur • Technologist • Software Engineer • AI Builder",
  "Software Engineer • AI Builder • Speaker • Entrepreneur",
  "Founder · Software Engineer · Technologist",
  "Founder · Software Engineer · AI Builder",
] as const;

export const LEGACY_BIOS = [
  "Rwandan founder, entrepreneur and technologist. Software engineer and AI builder working from Kigali.",
  "Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.",
  "I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.",
] as const;

export function isLegacyRoleLine(value: string | undefined | null): boolean {
  const v = (value || "").trim();
  if (!v) return true;
  if (LEGACY_ROLE_LINES.includes(v as (typeof LEGACY_ROLE_LINES)[number])) return true;
  // Old “identity dump” that treated AI Builder as a peer title
  if (/\bAI Builder\b/i.test(v) && /(Founder|Entrepreneur|Technologist|Software Engineer)/i.test(v)) {
    return true;
  }
  return false;
}

export function isLegacyBio(value: string | undefined | null): boolean {
  const v = (value || "").trim();
  if (!v) return true;
  return LEGACY_BIOS.includes(v as (typeof LEGACY_BIOS)[number]);
}

/** Keep a CV headline unless it is empty or an inherited legacy role line. */
export function cvHeadlineOr(value: string | undefined | null, fallback: string): string {
  const v = (value || "").trim();
  return v && !isLegacyRoleLine(v) ? v : fallback;
}

/** Saved descriptor lines that predate the five-line hero set. */
export function isLegacyHeroDescriptors(value: string | undefined | null): boolean {
  const v = (value || "").trim();
  return !v || v === IDENTITY_ROLE_LINE || isLegacyRoleLine(v);
}

type IdentityCopy = { siteSubtitle?: string; bio?: string; heroDescriptors?: string };

/** Per-layout hero copy overrides global settings, so it needs the same cleanup. */
function canonicalizeLayoutCopy<T extends IdentityCopy>(copy: T): T {
  const next = { ...copy };
  if (typeof next.heroDescriptors === "string" && isLegacyHeroDescriptors(next.heroDescriptors)) {
    next.heroDescriptors = HERO_DESCRIPTOR_LINE;
  }
  if (typeof next.siteSubtitle === "string" && isLegacyRoleLine(next.siteSubtitle)) {
    next.siteSubtitle = IDENTITY_ROLE_LINE;
  }
  if (typeof next.bio === "string" && isLegacyBio(next.bio)) {
    next.bio = IDENTITY_COMPACT_BIO;
  }
  return next;
}

function cvFallbackFor(key: unknown): string {
  return key === "professional" || key === "compact" || key === "executive"
    ? CV_DEFAULT_HEADLINES[key]
    : IDENTITY_ROLE_LINE;
}

type LooseRecord = Record<string, unknown>;
const isRecord = (value: unknown): value is LooseRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Stored CV headlines are serialized to the client with settings, so clean them at load too. */
function canonicalizeCvHeadlines(cvConfig: unknown, cvLibrary: unknown) {
  let nextConfig = cvConfig;
  if (isRecord(cvConfig) && isRecord(cvConfig.formats)) {
    const formats = Object.fromEntries(
      Object.entries(cvConfig.formats).map(([key, format]) => {
        if (!isRecord(format) || typeof format.headline !== "string") return [key, format];
        const headline = format.headline.trim();
        return [key, headline && isLegacyRoleLine(headline) ? { ...format, headline: cvFallbackFor(key) } : format];
      }),
    );
    nextConfig = { ...cvConfig, formats };
  }

  let nextLibrary = cvLibrary;
  if (isRecord(cvLibrary) && Array.isArray(cvLibrary.documents)) {
    const documents = cvLibrary.documents.map((doc) => {
      if (!isRecord(doc) || !isRecord(doc.headline) || typeof doc.headline.value !== "string") return doc;
      const value = doc.headline.value.trim();
      if (!value || !isLegacyRoleLine(value)) return doc;
      const fallback = doc.layoutId === "professional" || doc.layoutId === "compact"
        ? CV_DEFAULT_HEADLINES[doc.layoutId]
        : IDENTITY_ROLE_LINE;
      return {
        ...doc,
        headline: {
          ...doc.headline,
          value: fallback,
          ...("sourceValue" in doc.headline ? { sourceValue: fallback } : {}),
        },
      };
    });
    nextLibrary = { ...cvLibrary, documents };
  }
  return { cvConfig: nextConfig, cvLibrary: nextLibrary };
}

/** Normalize stored settings identity fields to the canonical line/bio. */
export function canonicalizeIdentityFields<
  T extends IdentityCopy & { heroLayoutCopy?: Partial<Record<string, IdentityCopy>> },
>(settings: T): T {
  const next = { ...settings };
  if (isLegacyRoleLine(next.siteSubtitle)) {
    next.siteSubtitle = IDENTITY_ROLE_LINE;
  }
  if (isLegacyBio(next.bio)) {
    next.bio = IDENTITY_COMPACT_BIO;
  }
  if (next.heroLayoutCopy && typeof next.heroLayoutCopy === "object") {
    next.heroLayoutCopy = Object.fromEntries(
      Object.entries(next.heroLayoutCopy).map(([layout, copy]) => [
        layout,
        copy && typeof copy === "object" ? canonicalizeLayoutCopy(copy) : copy,
      ]),
    ) as T["heroLayoutCopy"];
  }
  const loose = next as T & { cvConfig?: unknown; cvLibrary?: unknown };
  if (loose.cvConfig !== undefined || loose.cvLibrary !== undefined) {
    const cleaned = canonicalizeCvHeadlines(loose.cvConfig, loose.cvLibrary);
    if (loose.cvConfig !== undefined) loose.cvConfig = cleaned.cvConfig;
    if (loose.cvLibrary !== undefined) loose.cvLibrary = cleaned.cvLibrary;
  }
  return next;
}
