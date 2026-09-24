import type { Metadata } from "next";
import ServicesPageView from "@/components/services/ServicesPageView";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildNamedPathItemListJsonLd,
  buildPersonJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { DEFAULT_SERVICES_PAGE } from "@/lib/services-page";

const SEO = DEFAULT_SERVICES_PAGE.seo;

export const metadata: Metadata = buildPageMetadata({
  title: SEO.title,
  description: SEO.description,
  path: "/services",
  absoluteTitle: true,
  keywords: [
    "Prince Parfait GANZA",
    "Prince Parfait GANZA services",
    "Prince Parfait GANZA Kigali",
    "software engineering Rwanda",
    "software engineer Kigali",
    "research technology Rwanda",
    "digital data collection Kigali",
    "survey programming Rwanda",
    "data systems Kigali",
    "business systems Kigali",
    "technology consulting Kigali",
  ],
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
];

const listItems = DEFAULT_SERVICES_PAGE.families.map((family, index) => ({
  name: `${family.title} — Prince Parfait GANZA`,
  path: `/services#${family.id}`,
  position: index + 1,
}));

/**
 * Static shell like About/Experience — content comes from SiteSettingsProvider.
 * Focus filters stay client-only so chip changes do not re-fetch RSC.
 */
export default function ServicesPage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildPersonJsonLd(),
          buildWebPageJsonLd({
            path: "/services",
            name: SEO.title,
            description: SEO.description,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/services"),
          buildNamedPathItemListJsonLd({
            name: "Services by Prince Parfait GANZA",
            path: "/services",
            items: listItems,
          }),
        ])}
      />
      <ServicesPageView />
    </>
  );
}
