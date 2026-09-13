import type { Metadata } from "next";
import { siteConfig, identity } from "@/data/site-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import HeroSection from "@/components/hero/HeroSection";
import HomeJourney from "@/components/home/HomeJourney";

export const metadata: Metadata = buildPageMetadata({
  title: identity.pageTitle,
  description: identity.description,
  path: "/",
  absoluteTitle: true,
  keywords: siteConfig.keywords,
});

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/",
            name: identity.pageTitle,
            description: identity.description,
          }),
        ])}
      />
      <HeroSection />
      <HomeJourney />
    </>
  );
}
