import type { Metadata } from "next";
import {
  CANONICAL_ORIGIN,
  OG_IMAGE_PATH,
  SITE_CONTENT_REVISED,
  absoluteAssetUrl,
  canonicalUrl,
} from "@/lib/schema";

export const DEFAULT_OG_IMAGE = OG_IMAGE_PATH;

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
  return canonicalUrl(path);
}

export function buildPageMetadata(input: PageSeoInput): Metadata {
  const canonical = canonicalUrl(input.path);
  const ogImage = absoluteAssetUrl(input.ogImage || DEFAULT_OG_IMAGE);
  const robots = input.noIndex
    ? { index: false, follow: true }
    : { index: true, follow: true };

  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical },
    robots,
    openGraph: {
      title: input.title,
      description: input.description,
      url: canonical,
      type: input.ogType || "website",
      siteName: "Prince Parfait GANZA",
      locale: "en_US",
      publishedTime: input.publishedTime,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Prince Parfait GANZA",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@prince_parfait1",
      creator: "@prince_parfait1",
      title: input.title,
      description: input.description,
      images: [ogImage],
    },
  };
}

export function sitemapLastModified(): Date {
  return new Date(`${SITE_CONTENT_REVISED}T00:00:00.000Z`);
}

export { CANONICAL_ORIGIN };
