import { siteConfig, type Project } from "@/data/site-data";

/** Production canonical origin. Always used for JSON-LD @id values. */
export const CANONICAL_ORIGIN =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "")) ||
  "https://www.princeparfait.com";

export const PERSON_ID = `${CANONICAL_ORIGIN}/#person`;
export const PERSON_IMAGE_ID = `${CANONICAL_ORIGIN}/#person-image`;
export const WEBSITE_ID = `${CANONICAL_ORIGIN}/#website`;
export const LERONY_ORG_ID = "https://lerony.com/#organization";

/** Stable Person image URL for Google. Never point JSON-LD at a CMS/media URL. Replace this file in place if the portrait changes. */
export const PORTRAIT_PATH = "/images/profile/prince-parfait-ganza-kigali-rwanda.webp";
export const OG_IMAGE_PATH = "/images/og/seo-share-image.jpg";

/** Date the public factual content was last revised. Do not stamp deploy time. */
export const SITE_CONTENT_REVISED = "2026-09-19";

/**
 * Canonical absolute URL.
 * Homepage has no trailing slash (matches Next.js default + live <link rel="canonical">).
 * Other paths never end with a slash. Optional `#fragment` is preserved.
 */
export function canonicalUrl(path = "/"): string {
  if (!path || path === "/") return CANONICAL_ORIGIN;
  const hashIndex = path.indexOf("#");
  const hash = hashIndex >= 0 ? path.slice(hashIndex + 1) : "";
  const pathname = hashIndex >= 0 ? path.slice(0, hashIndex) : path;
  const normalized = `/${pathname}`.replace(/\/{2,}/g, "/").replace(/\/+$/, "") || "";
  const base = normalized === "/" || !normalized ? CANONICAL_ORIGIN : `${CANONICAL_ORIGIN}${normalized}`;
  return hash ? `${base}#${hash}` : base;
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
    alternateName: ["Prince Parfait Ganza", "Prince Parfait", "PPG"],
    url: `${CANONICAL_ORIGIN}/`,
    description: siteConfig.description,
    disambiguatingDescription:
      "Rwandan founder, entrepreneur and technologist based in Kigali. Software engineer and AI builder. Founder and CEO of LERONY Ltd.",
    image: {
      "@type": "ImageObject",
      "@id": PERSON_IMAGE_ID,
      url: PORTRAIT_URL,
      contentUrl: PORTRAIT_URL,
      width: 1024,
      height: 919,
      encodingFormat: "image/webp",
      caption: "Prince Parfait GANZA",
      name: "Prince Parfait GANZA",
    },
    jobTitle: ["Founder", "Entrepreneur", "Technologist", "Software Engineer", "AI Builder"],
    hasOccupation: [
      { "@type": "Occupation", name: "Founder", occupationLocation: { "@type": "City", name: "Kigali" } },
      { "@type": "Occupation", name: "Entrepreneur" },
      { "@type": "Occupation", name: "Technologist" },
      { "@type": "Occupation", name: "Software Engineer" },
      { "@type": "Occupation", name: "AI Builder" },
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
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "SJITC Nyamirambo",
      },
      {
        "@type": "EducationalOrganization",
        name: "ALX Africa",
        url: "https://www.alxafrica.com",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "professional inquiries",
      email: siteConfig.contact.email,
      telephone: "+250792054846",
      areaServed: "RW",
      availableLanguage: "en",
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
      "Digital product development",
      "Digital presence",
      "Data and reporting systems",
      "Practical AI integration",
      "Technology consulting",
      "Technical training",
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

export function buildNamedPathItemListJsonLd(input: {
  name: string;
  path: string;
  items: { name: string; path: string; position?: number }[];
}) {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl(input.path)}#capability-families`,
    name: input.name,
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: item.position ?? index + 1,
      name: item.name,
      url: canonicalUrl(item.path),
    })),
  };
}

export function buildCreativeWorkJsonLd(project: Project) {
  const url = canonicalUrl(`/projects/${project.id}`);
  const roleProperty = project.contribution === "contributor" ? "contributor" : "creator";
  const imageSources = [
    ...(project.logo ? [project.logo] : []),
    ...(project.screenshots?.length ? project.screenshots : [project.image || OG_IMAGE_PATH]),
  ].filter((src): src is string => Boolean(src) && !src.includes("placeholder"));
  const uniqueImages = [...new Set(imageSources)].map((src) => absoluteAssetUrl(src));
  const videoSources = project.videos?.length ? project.videos : project.video ? [project.video] : [];
  const softwareCategories = new Set(["systems", "product", "saas", "web", "mobile", "ai"]);
  const isSoftware = softwareCategories.has(project.category);
  const type = isSoftware ? (["SoftwareApplication", "CreativeWork"] as const) : "CreativeWork";

  return {
    "@type": type,
    "@id": `${url}#work`,
    name: project.title,
    description: project.description,
    url,
    inLanguage: "en",
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    dateModified: SITE_CONTENT_REVISED,
    [roleProperty]: personRef(),
    isPartOf: websiteRef(),
    keywords: project.technologies.join(", "),
    image: uniqueImages,
    ...(project.logo ? { logo: absoluteAssetUrl(project.logo) } : {}),
    ...(project.organization
      ? {
          about: {
            "@type": "Organization",
            name: project.organization,
          },
        }
      : {}),
    ...(isSoftware
      ? {
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          ...(project.links.live
            ? {
                offers: {
                  "@type": "Offer",
                  url: project.links.live,
                  availability: "https://schema.org/OnlineOnly",
                },
              }
            : {}),
        }
      : {}),
    ...(videoSources.length
      ? {
          video: videoSources.map((src) => ({
            "@type": "VideoObject",
            name: `${project.title} walkthrough`,
            description: project.description,
            contentUrl: absoluteAssetUrl(src),
            thumbnailUrl: absoluteAssetUrl(project.videoPoster || project.image || OG_IMAGE_PATH),
            uploadDate: project.year ? `${project.year}-01-01` : SITE_CONTENT_REVISED,
          })),
        }
      : {}),
    ...(project.links.live ? { sameAs: project.links.live } : {}),
  };
}

export function buildGraph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
}
