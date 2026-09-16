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
  "Case studies of software systems built by Prince Parfait GANZA, including organizational reporting, inventory operations, ticket accounting, and product work.";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects & Case Studies | Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/projects",
  absoluteTitle: true,
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
            name: "Projects & Case Studies | Prince Parfait GANZA",
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
