import type { Metadata } from "next";
import { siteConfig, identity, projects } from "@/data/site-data";
import { buildPageMetadata } from "@/lib/seo";
import { buildGraph, buildItemListJsonLd, buildPersonJsonLd, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import HeroSection from "@/components/hero/HeroSection";
import HomeJourney from "@/components/home/HomeJourney";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { heroImageFor } from "@/lib/hero";

export const metadata: Metadata = buildPageMetadata({
  title: identity.pageTitle,
  description: identity.description,
  path: "/",
  absoluteTitle: true,
  keywords: siteConfig.keywords,
});

export default async function HomePage() {
  const featured = projects.filter((project) => project.featured).slice(0, 6);
  const settings = await getServerSiteSettings();
  const heroSrc = heroImageFor(settings, settings.bannerLayout || "full_centered_floating");
  const preloadHero = heroSrc.startsWith("/") && !heroSrc.startsWith("//");

  return (
    <>
      {preloadHero ? (
        <link rel="preload" as="image" href={heroSrc} fetchPriority="high" />
      ) : null}
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
            "Featured work by Prince Parfait GANZA",
          ),
        ])}
      />
      <HeroSection />
      <HomeJourney />
    </>
  );
}
