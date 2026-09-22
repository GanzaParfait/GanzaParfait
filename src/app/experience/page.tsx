import type { Metadata } from "next";
import ExperiencePageView from "@/components/experience/ExperiencePageView";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildCertificationItemListJsonLd,
  buildEducationItemListJsonLd,
  buildExperienceItemListJsonLd,
  buildGraph,
  buildPersonJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const PAGE_DESCRIPTION =
  "Experience of Prince Parfait GANZA in Kigali: Founder and CEO of LERONY Ltd, software engineer and AI builder, with client systems, training, education, and verified ALX certifications as evidence.";

export const metadata: Metadata = buildPageMetadata({
  title: "Experience | Software Engineer & AI Builder in Kigali — Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/experience",
  absoluteTitle: true,
  keywords: [
    "Prince Parfait GANZA experience",
    "LERONY Ltd founder",
    "LERONY founder",
    "software engineer Kigali",
    "software engineer Rwanda",
    "AI builder Kigali",
    "ALX Africa certificates",
    "AskField",
    "PSTA",
  ],
});

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Experience", path: "/experience" },
];

export default function ExperiencePage() {
  return (
    <>
      <JsonLd
        data={buildGraph([
          buildPersonJsonLd(),
          buildWebPageJsonLd({
            path: "/experience",
            name: "Experience | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
            type: "CollectionPage",
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/experience"),
          buildExperienceItemListJsonLd(),
          buildEducationItemListJsonLd(),
          buildCertificationItemListJsonLd(),
        ])}
      />
      <ExperiencePageView />
    </>
  );
}
