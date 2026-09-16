import type { Metadata } from "next";
import ExperiencePageView from "@/components/experience/ExperiencePageView";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbListJsonLd, buildGraph, buildWebPageJsonLd } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const PAGE_DESCRIPTION =
  "Professional record for Prince Parfait GANZA: Founder and CEO of LERONY Ltd, with software engineering, client systems, training, and education kept as evidence.";

export const metadata: Metadata = buildPageMetadata({
  title: "Experience | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/experience",
  absoluteTitle: true,
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
          buildWebPageJsonLd({
            path: "/experience",
            name: "Experience | Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/experience"),
        ])}
      />
      <ExperiencePageView />
    </>
  );
}
