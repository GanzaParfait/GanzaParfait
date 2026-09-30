import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProjectsPageView from "@/components/work/ProjectsPageView";
import { getPublicProjects } from "@/lib/projects";
import { projectIdFromShareQuery } from "@/lib/share-target";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

const PAGE_DESCRIPTION =
  "Selected systems and case studies by Prince Parfait GANZA — software engineer and technology entrepreneur in Kigali — including research and survey platforms, indicator systems, inventory operations, ticket accounting, and product builds.";

export const metadata: Metadata = buildPageMetadata({
  title: "Work & Case Studies | Software Engineer in Kigali — Prince Parfait GANZA",
  description: PAGE_DESCRIPTION,
  path: "/projects",
  absoluteTitle: true,
  keywords: [
    "Prince Parfait GANZA projects",
    "Prince Parfait GANZA case studies",
    "software systems Kigali",
    "research technology Rwanda",
    "digital data collection Kigali",
    "AskField",
    "Caritas Rwanda systems",
    "business systems Rwanda",
  ],
});

export const revalidate = 60;

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/projects" },
];

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const projects = await getPublicProjects();
  const params = await searchParams;
  const sharedProject = projectIdFromShareQuery(
    {
      utm_content: firstParam(params.utm_content),
      utm_campaign: firstParam(params.utm_campaign),
    },
    projects.map((project) => project.id),
  );
  if (sharedProject) {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      const item = firstParam(value);
      if (item) next.set(key, item);
    }
    const query = next.toString();
    redirect(query ? `/projects/${sharedProject}?${query}` : `/projects/${sharedProject}`);
  }

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
      <ProjectsPageView
        initialFocus={firstParam(params.focus) || firstParam(params.type) || firstParam(params.category) || null}
        initialQuery={firstParam(params.q) || firstParam(params.tech) || null}
        initialSort={firstParam(params.sort) || null}
      />
    </>
  );
}
