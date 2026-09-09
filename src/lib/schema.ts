import { siteConfig, type Project } from "@/data/site-data";

/** Production canonical origin. Always used for JSON-LD @id values. */
export const CANONICAL_ORIGIN = "https://www.princeparfait.com";

export const PERSON_ID = `${CANONICAL_ORIGIN}/#person`;
export const PERSON_IMAGE_ID = `${CANONICAL_ORIGIN}/#person-image`;
export const WEBSITE_ID = `${CANONICAL_ORIGIN}/#website`;
export const LERONY_ORG_ID = "https://lerony.com/#organization";

/** Stable Person image URL for Google. Never point JSON-LD at a CMS/media URL. Replace this file in place if the portrait changes. */
export const PORTRAIT_PATH = "/images/profile/prince-parfait-ganza-kigali-rwanda.webp";
export const OG_IMAGE_PATH = "/images/og/seo-share-image.jpg";

/** Date the public factual content was last revised. Do not stamp deploy time. */
export const SITE_CONTENT_REVISED = "2026-08-28";

export function canonicalUrl(path = "/"): string {
  if (!path || path === "/") return `${CANONICAL_ORIGIN}/`;
  const normalized = `/${path}`.replace(/\/{2,}/g, "/");
  return `${CANONICAL_ORIGIN}${normalized.replace(/\/+$/, "")}`;
}

export function absoluteAssetUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${CANONICAL_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function personRef() {
  return { "@id": PERSON_ID };
}

export function websiteRef() {
  return { "@id": WEBSITE_ID };
}

export function leronyRef() {
  return { "@id": LERONY_ORG_ID };
}

const PORTRAIT_URL = absoluteAssetUrl(PORTRAIT_PATH);

export function buildPersonJsonLd() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Prince Parfait GANZA",
    givenName: "Prince Parfait",
    familyName: "GANZA",
    additionalName: "Parfait",
    alternateName: ["Prince Parfait Ganza", "Prince Parfait"],
    url: `${CANONICAL_ORIGIN}/`,
    description: siteConfig.description,
    disambiguatingDescription:
      "Rwandan founder and software engineer based in Kigali. Founder of LERONY Ltd.",
    image: {
      "@type": "ImageObject",
      "@id": PERSON_IMAGE_ID,
      url: PORTRAIT_URL,
      contentUrl: PORTRAIT_URL,
      caption: "Prince Parfait GANZA",
      name: "Prince Parfait GANZA",
    },
    jobTitle: ["Founder", "Software Engineer", "AI Builder", "Speaker", "Entrepreneur"],
    hasOccupation: [
      { "@type": "Occupation", name: "Founder", occupationLocation: { "@type": "City", name: "Kigali" } },
      { "@type": "Occupation", name: "Software Engineer" },
    ],
    worksFor: leronyRef(),
    homeLocation: {
      "@type": "Place",
      name: "Kigali, Rwanda",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kigali",
        addressCountry: "RW",
      },
    },
    nationality: {
      "@type": "Country",
      name: "Rwanda",
    },
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.github,
      siteConfig.social.twitter,
      siteConfig.social.youtube,
      siteConfig.social.instagram,
    ],
    knowsAbout: [
      "Software engineering",
      "Full-stack development",
      "Business systems",
      "AI-enabled software",
      "Technology entrepreneurship",
    ],
  };
}

export function buildLeronyOrganizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": LERONY_ORG_ID,
    name: "LERONY Ltd",
    url: "https://lerony.com",
    foundingDate: "2025",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
    founder: personRef(),
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${CANONICAL_ORIGIN}/`,
    name: "Prince Parfait GANZA",
    alternateName: ["Prince Parfait"],
    description: siteConfig.description,
    inLanguage: "en",
    publisher: personRef(),
  };
}

export function buildIdentityGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [buildPersonJsonLd(), buildLeronyOrganizationJsonLd(), buildWebSiteJsonLd()],
  };
}

export function buildWebPageJsonLd(input: {
  path: string;
  name: string;
  description: string;
  type?: "WebPage" | "ContactPage" | "CollectionPage" | "AboutPage";
  includePersonImage?: boolean;
}) {
  const url = canonicalUrl(input.path);
  const types = input.type && input.type !== "WebPage" ? ["WebPage", input.type] : "WebPage";
  return {
    "@type": types,
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "en",
    dateModified: SITE_CONTENT_REVISED,
    isPartOf: websiteRef(),
    about: personRef(),
    ...(input.includePersonImage !== false
      ? { primaryImageOfPage: { "@id": PERSON_IMAGE_ID } }
      : {}),
  };
}

export function buildProfilePageJsonLd(input: {
  path: string;
  name: string;
  description: string;
}) {
  const url = canonicalUrl(input.path);
  return {
    "@type": "ProfilePage",
    "@id": `${url}#webpage`,
    url,
    name: input.name,
    description: input.description,
    inLanguage: "en",
    dateModified: SITE_CONTENT_REVISED,
    isPartOf: websiteRef(),
    about: personRef(),
    mainEntity: personRef(),
    primaryImageOfPage: { "@id": PERSON_IMAGE_ID },
  };
}

export function buildBreadcrumbListJsonLd(
  items: { name: string; path: string }[],
  pagePath: string,
) {
  const url = canonicalUrl(pagePath);
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function buildItemListJsonLd(
  projects: Project[],
  pagePath: string,
) {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl(pagePath)}#itemlist`,
    name: "Selected work by Prince Parfait GANZA",
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: canonicalUrl(`/projects/${project.id}`),
      name: project.title,
    })),
  };
}

export function buildCreativeWorkJsonLd(project: Project) {
  const url = canonicalUrl(`/projects/${project.id}`);
  const roleProperty = project.contribution === "contributor" ? "contributor" : "creator";
  return {
    "@type": "CreativeWork",
    "@id": `${url}#work`,
    name: project.title,
    description: project.description,
    url,
    inLanguage: "en",
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    [roleProperty]: personRef(),
    isPartOf: websiteRef(),
    keywords: project.technologies.join(", "),
    image: absoluteAssetUrl(project.image || OG_IMAGE_PATH),
    ...(project.links.live ? { sameAs: project.links.live } : {}),
  };
}

export function buildGraph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
