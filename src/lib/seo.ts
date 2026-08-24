import type { Metadata } from "next";
import { siteConfig } from "@/data/site-data";

export const DEFAULT_OG_IMAGE = "/images/profile/hero-photo.png";

export const PPG_SEO_KEYWORDS = [
  "PPG",
  "PPG Rwanda",
  "PPG developer",
  "PPG software engineer",
  "Prince Parfait GANZA PPG",
  "Prince Parfait GANZA",
  "Prince Parfait GANZA portfolio",
  "Prince Parfait GANZA Rwanda",
  "GANZA Prince Parfait",
  "Software Engineer Rwanda",
  "AI Builder Africa",
  "Full Stack Developer Kigali",
  "Technology Entrepreneur Rwanda",
  "Lerony founder",
  "princeparfait.com",
];

export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  publishedTime?: string;
  noIndex?: boolean;
  absoluteTitle?: boolean;
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized}`;
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const canonical = absoluteUrl(input.path);
  const ogImage = input.ogImage || DEFAULT_OG_IMAGE;
  const keywords = [...new Set([...(input.keywords || []), ...PPG_SEO_KEYWORDS.slice(0, 8)])];

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    keywords,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${input.title} | Prince Parfait GANZA (PPG)`,
      description: input.description,
      url: canonical,
      type: input.ogType || "website",
      siteName: "Prince Parfait GANZA (PPG)",
      locale: siteConfig.locale,
      publishedTime: input.publishedTime,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${input.title} — Prince Parfait GANZA (PPG)`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@_prince_parfait_1",
      creator: "@_prince_parfait_1",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildWebPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(input.path)}#webpage`,
    url: absoluteUrl(input.path),
    name: input.name,
    description: input.description,
    isPartOf: { "@id": `${siteConfig.url}/#website` },
    about: { "@id": `${siteConfig.url}/#person` },
    inLanguage: "en-US",
  };
}

export function buildProjectJsonLd(project: {
  id: string;
  title: string;
  description: string;
  year: number;
  technologies: string[];
  links?: { live?: string; github?: string };
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${siteConfig.url}/projects/${project.id}#project`,
    name: project.title,
    description: project.description,
    url: `${siteConfig.url}/projects/${project.id}`,
    dateCreated: `${project.year}`,
    author: { "@id": `${siteConfig.url}/#person` },
    creator: { "@id": `${siteConfig.url}/#person` },
    keywords: [...project.technologies, "PPG", "Prince Parfait GANZA"].join(", "),
    image: project.image ? absoluteUrl(project.image) : absoluteUrl(DEFAULT_OG_IMAGE),
    ...(project.links?.live ? { sameAs: project.links.live } : {}),
  };
}

export function buildFaqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
