import {
  certifications,
  education,
  experience,
  siteConfig,
  type CertificationItem,
  type EducationItem,
  type ExperienceItem,
  type Project,
} from "@/data/site-data";

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
export const SITE_CONTENT_REVISED = "2026-09-22";

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
      caption: siteConfig.portraitAlt,
      name: siteConfig.portraitAlt,
    },
    jobTitle: ["Founder", "Entrepreneur", "Technologist", "Software Engineer", "AI Builder"],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Founder",
        occupationLocation: { "@type": "City", name: "Kigali", address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" } },
      },
      {
        "@type": "Occupation",
        name: "Software Engineer",
        occupationLocation: { "@type": "City", name: "Kigali", address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" } },
      },
      {
        "@type": "Occupation",
        name: "AI Builder",
        occupationLocation: { "@type": "City", name: "Kigali", address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" } },
      },
      { "@type": "Occupation", name: "Entrepreneur" },
      { "@type": "Occupation", name: "Technologist" },
    ],
    worksFor: leronyRef(),
    brand: {
      "@type": "Brand",
      name: "Prince Parfait GANZA",
      url: `${CANONICAL_ORIGIN}/`,
    },
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
      areaServed: ["RW", "Africa"],
      availableLanguage: ["en"],
    },
    sameAs: [
      siteConfig.social.linkedin,
      siteConfig.social.github,
      siteConfig.social.twitter,
      siteConfig.social.youtube,
      siteConfig.social.instagram,
      siteConfig.social.tiktok,
      siteConfig.social.threads,
      siteConfig.social.luma,
    ],
    knowsAbout: [
      "Software engineering",
      "Software engineering in Rwanda",
      "Software engineering in Kigali",
      "Software engineer Kigali",
      "Full-stack development",
      "AI builder",
      "AI builder in Kigali",
      "Practical AI integration",
      "Business systems",
      "Digital product development",
      "Digital products Kigali",
      "Digital presence",
      "Data and reporting systems",
      "Technology consulting",
      "Technology consulting Kigali",
      "Technical training",
      "Technology entrepreneurship",
      "Tech founder Kigali",
      "Tech founder",
      "Founder of LERONY Ltd",
      "AskField",
      "StockPro",
      "Caritas Rwanda information systems",
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
    description:
      "A Rwanda-based technology and innovation company building practical solutions that help organizations, businesses, and communities operate better, grow, and prepare for the future.",
    logo: absoluteAssetUrl("/images/projects/logos/lerony-icon.png"),
    image: absoluteAssetUrl("/images/projects/lerony/lerony-wide.jpg"),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kigali",
      addressCountry: "RW",
    },
    founder: personRef(),
    knowsAbout: [
      "Technology and innovation",
      "Digital solutions",
      "Smart systems",
      "Business transformation",
      "Software and platforms",
      "AI-enabled solutions",
      "Technology strategy and consulting",
      "Emerging technologies",
    ],
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${CANONICAL_ORIGIN}/`,
    name: "Prince Parfait GANZA",
    alternateName: [
      "Prince Parfait",
      "Prince Parfait Ganza",
      "Software engineer and AI builder in Kigali",
      "Tech founder Kigali",
      "LERONY founder",
    ],
    description: siteConfig.description,
    inLanguage: "en",
    about: personRef(),
    publisher: personRef(),
    creator: personRef(),
    keywords: siteConfig.keywords.join(", "),
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
    mainEntity: personRef(),
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
  name = "Selected work by Prince Parfait GANZA",
) {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl(pagePath)}#itemlist`,
    name,
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

function parsePeriodBounds(period: string): { startDate?: string; endDate?: string } {
  const years = period.match(/\d{4}/g) || [];
  const startDate = years[0];
  if (!startDate) return {};
  if (/present/i.test(period)) return { startDate };
  if (years[1]) return { startDate, endDate: years[1] };
  return { startDate };
}

export function buildOrganizationRoleJsonLd(item: ExperienceItem) {
  const bounds = parsePeriodBounds(item.period);
  return {
    "@type": "OrganizationRole",
    "@id": `${canonicalUrl("/experience")}#role-${item.id}`,
    roleName: item.role,
    description: item.summary,
    ...bounds,
    ...(item.location
      ? {
          location: {
            "@type": "Place",
            name: item.location,
          },
        }
      : {}),
    worksFor: {
      "@type": "Organization",
      name: item.organization,
      ...(item.website ? { url: item.website } : {}),
    },
    ...(item.skills?.length ? { skills: item.skills.join(", ") } : {}),
  };
}

export function buildExperienceItemListJsonLd() {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl("/experience")}#roles`,
    name: "Professional roles of Prince Parfait GANZA",
    numberOfItems: experience.length,
    itemListElement: experience.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildOrganizationRoleJsonLd(item),
    })),
  };
}

export function buildEducationItemListJsonLd() {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl("/experience")}#education`,
    name: "Education of Prince Parfait GANZA",
    numberOfItems: education.length,
    itemListElement: education.map((item: EducationItem, index) => {
      const bounds = parsePeriodBounds(item.period);
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "EducationalOccupationalProgram",
          "@id": `${canonicalUrl("/experience")}#education-${item.id}`,
          name: item.program,
          description: item.note || `${item.program} at ${item.institution}. Status: ${item.status}.`,
          provider: {
            "@type": "EducationalOrganization",
            name: item.institution,
          },
          ...bounds,
        },
      };
    }),
  };
}

export function buildCertificationItemListJsonLd() {
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl("/experience")}#certifications`,
    name: "Verified certifications of Prince Parfait GANZA",
    numberOfItems: certifications.length,
    itemListElement: certifications.map((item: CertificationItem, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "EducationalOccupationalCredential",
        "@id": `${canonicalUrl("/experience")}#credential-${item.id}`,
        name: item.title,
        description: item.program,
        credentialCategory: "Certificate",
        dateCreated: item.completedOn,
        recognizedBy: {
          "@type": "Organization",
          name: item.issuer,
        },
        url: item.verifyUrl,
        ...(item.image ? { image: absoluteAssetUrl(item.image) } : {}),
      },
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
  const type =
    project.category === "technology"
      ? (["Organization", "CreativeWork"] as const)
      : isSoftware
        ? (["SoftwareApplication", "CreativeWork"] as const)
        : "CreativeWork";

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
