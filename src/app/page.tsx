import type { Metadata } from "next";
import { siteConfig, identity, projects } from "@/data/site-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildGraph, buildItemListJsonLd, buildPersonJsonLd, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import HeroSection from "@/components/hero/HeroSection";
import HomeJourney from "@/components/home/HomeJourney";

export const metadata: Metadata = buildPageMetadata({
  title: identity.pageTitle,
  description: identity.description,
  path: "/",
  absoluteTitle: true,
  keywords: siteConfig.keywords,
  ogImageAlt: siteConfig.portraitAlt,
});

export default async function HomePage() {
  const featured = projects.filter((project) => project.featured).slice(0, 6);

  return (
    <>
      <JsonLd
        data={buildGraph([
          buildPersonJsonLd(),
          buildWebPageJsonLd({
            path: "/",
            name: identity.pageTitle,
            description: identity.description,
          }),
          buildItemListJsonLd(
            featured.length ? featured : projects.slice(0, 4),
            "/",
            "Featured work by Prince Parfait GANZA — software engineer and AI builder in Kigali",
          ),
        ])}
      />
      <HeroSection />
      <HomeJourney />
    </>
  );
}
