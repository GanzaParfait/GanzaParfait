import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projects } from "@/data/site-data";
import ProjectCaseStudyClient from "@/components/projects/ProjectCaseStudyClient";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildProjectJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({ id: project.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) return { title: "Project Not Found" };

  return buildPageMetadata({
    title: `${project.title} — Project by PPG`,
    description: `${project.description} Built by Prince Parfait GANZA (PPG), software engineer and founder from Rwanda.`,
    path: `/projects/${project.id}`,
    keywords: [...project.technologies, project.title, "PPG project", "Prince Parfait GANZA portfolio"],
    ogImage: project.image,
  });
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = projects.find((item) => item.id === id);
  if (!project) notFound();

  const schema = [
    buildProjectJsonLd(project),
    buildWebPageJsonLd({
      name: `${project.title} — Prince Parfait GANZA (PPG)`,
      description: project.description,
      path: `/projects/${project.id}`,
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
      { name: project.title, path: `/projects/${project.id}` },
    ]),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <ProjectCaseStudyClient />
    </>
  );
}
