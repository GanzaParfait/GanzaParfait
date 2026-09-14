import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/site-data";
import ProjectCaseStudyClient from "@/components/projects/ProjectCaseStudyClient";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildCreativeWorkJsonLd,
  buildGraph,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) return { title: "Project Not Found", robots: { index: false, follow: true } };

  return buildPageMetadata({
    title: `${project.title} | Prince Parfait GANZA`,
    description: project.description,
    path: `/projects/${project.id}`,
    absoluteTitle: true,
    keywords: [project.title, project.organization || "", "Prince Parfait GANZA", ...project.technologies].filter(Boolean),
    ogImage: project.image,
    ogImageAlt: `${project.title} — case study by Prince Parfait GANZA`,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Work", path: "/projects" },
    { name: project.title, path: `/projects/${project.id}` },
  ];

  return (
    <>
      <JsonLd
        data={buildGraph([
          buildWebPageJsonLd({
            path: `/projects/${project.id}`,
            name: `${project.title} | Case study`,
            description: project.description,
            includePersonImage: false,
          }),
          buildCreativeWorkJsonLd(project),
          buildBreadcrumbListJsonLd(crumbs, `/projects/${project.id}`),
        ])}
      />
      <Breadcrumbs items={crumbs} />
      <ProjectCaseStudyClient project={project} />
    </>
  );
}
