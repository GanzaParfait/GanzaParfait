import type { Metadata } from "next";
import ProjectsPageView from "@/components/work/ProjectsPageView";
import { getPublicProjects } from "@/lib/projects";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const PAGE_DESCRIPTION =
  "Selected systems and case studies by Prince Parfait GANZA in Kigali — reporting platforms, inventory operations, ticket accounting, and product builds for real organizations.";

export const metadata: Metadata = buildPageMetadata({
  title: "Work & Case Studies by Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/projects",
  absoluteTitle: true,
  keywords: [
    "Prince Parfait GANZA projects",
    "Prince Parfait GANZA case studies",
    "software systems Kigali",
    "LERONY projects",
  ],
});

export const revalidate = 60;

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/projects" },
];

export default async function ProjectsPage() {
  const projects = await getPublicProjects();

  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: "/projects",
            name: "Work & Case Studies by Prince Parfait GANZA",
            description: PAGE_DESCRIPTION,
            type: "CollectionPage",
          }),
          buildBreadcrumbListJsonLd(breadcrumbItems, "/projects"),
          buildItemListJsonLd(projects, "/projects"),
        ])}
      />
      <ProjectsPageView />
    </>
  );
}
