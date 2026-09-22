/**
 * Canonical public identity for princeparfait.com.
 * Identity ≠ Specialization ≠ Capability ≠ Technology — do not flatten these.
 * Source of truth alongside docs/PORTFOLIO_CONTEXT.md.
 */

export const CANONICAL_NAME = "Prince Parfait GANZA";

/** Public role line — the only identity headline. */
export const IDENTITY_ROLE_LINE = "Software Engineer · Technology Entrepreneur · Founder";

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

/** Normalize stored settings identity fields to the canonical line/bio. */
export function canonicalizeIdentityFields<T extends { siteSubtitle?: string; bio?: string }>(
  settings: T,
): T {
  const next = { ...settings };
  if (isLegacyRoleLine(next.siteSubtitle)) {
    next.siteSubtitle = IDENTITY_ROLE_LINE;
  }
  if (isLegacyBio(next.bio)) {
    next.bio = IDENTITY_COMPACT_BIO;
  }
  return next;
}
