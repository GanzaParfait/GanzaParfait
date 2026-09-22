import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectCaseStudyClient from "@/components/projects/ProjectCaseStudyClient";
import { getPublicProject, getPublicProjects, isProjectIndexable } from "@/lib/projects";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildCreativeWorkJsonLd,
  buildGraph,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getPublicProjects();
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getPublicProject(id);
  if (!project) return { title: "Project Not Found", robots: { index: false, follow: true } };

  const title = project.seoTitle || `${project.title} | Prince Parfait GANZA`;
  const description = project.seoDescription || project.description;
  const indexable = isProjectIndexable(project);

  return buildPageMetadata({
    title,
    description,
    path: `/projects/${project.id}`,
    absoluteTitle: true,
    keywords: [project.title, project.organization || "", "Prince Parfait GANZA", ...project.technologies].filter(Boolean),
    ogImage: project.image,
    ogImageAlt: `${project.title} — case study by Prince Parfait GANZA`,
    noIndex: !indexable,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getPublicProject(id);
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
            name: project.seoTitle || `${project.title} | Case study`,
            description: project.seoDescription || project.description,
            includePersonImage: false,
          }),
          buildCreativeWorkJsonLd(project),
          buildBreadcrumbListJsonLd(crumbs, `/projects/${project.id}`),
        ])}
      />
      <ProjectCaseStudyClient project={project} />
    </>
  );
}
