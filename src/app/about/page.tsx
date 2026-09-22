import type { Metadata } from "next";
import AboutPageView from "@/components/about/AboutPageView";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildPersonJsonLd,
  buildProfilePageJsonLd,
  PORTRAIT_PATH,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { IDENTITY_PORTRAIT_ALT } from "@/lib/identity";

const PAGE_DESCRIPTION =
  "About Prince Parfait GANZA — software engineer and technology entrepreneur in Kigali. Founder and CEO of LERONY Ltd. Builds software systems, research technology and organizational data systems.";

export const metadata: Metadata = buildPageMetadata({
  title: "About Prince Parfait GANZA | Software Engineer & Technology Entrepreneur in Kigali",
  description: PAGE_DESCRIPTION,
  path: "/about",
  ogType: "profile",
  absoluteTitle: true,
  keywords: [
    "About Prince Parfait GANZA",
    "Prince Parfait GANZA Kigali",
    "Software engineer Kigali",
    "Technology entrepreneur Rwanda",
    "Research technology Kigali",
    "Data systems Rwanda",
    "LERONY Ltd founder",
  ],
  ogImage: PORTRAIT_PATH,
  ogImageAlt: IDENTITY_PORTRAIT_ALT,
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
          buildPersonJsonLd(),
          buildProfilePageJsonLd({
            path: "/about",
            name: "About Prince Parfait GANZA | Software Engineer & Technology Entrepreneur in Kigali",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/about"),
        ])}
      />
      <AboutPageView />
    </>
  );
}
