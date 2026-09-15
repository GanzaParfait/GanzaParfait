import type { Metadata } from "next";
import AboutPageView from "@/components/about/AboutPageView";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildProfilePageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const PAGE_DESCRIPTION =
  "The founder story of Prince Parfait GANZA: leading Lerony from Kigali, building technology, products and ventures, with software engineering as evidence rather than the ceiling.";

export const metadata: Metadata = buildPageMetadata({
  title: "About Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
  description: PAGE_DESCRIPTION,
  path: "/about",
  ogType: "profile",
  absoluteTitle: true,
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildProfilePageJsonLd({
            path: "/about",
            name: "About Prince Parfait GANZA | Founder, Entrepreneur & Technologist",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/about"),
        ])}
      />
      <Breadcrumbs items={breadcrumbItems} />
      <AboutPageView />
    </>
  );
}
