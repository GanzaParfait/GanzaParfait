import type { Metadata } from "next";
import { projects } from "@/data/site-data";
import ProjectCard from "@/components/ui/ProjectCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
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

const breadcrumbItems = [
  { name: "Home", path: "/" },
  { name: "Work", path: "/projects" },
];

export default function ProjectsPage() {
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);
  const ordered = [...featuredProjects, ...otherProjects];

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

      <section className="section page-compact-hero" aria-label="Work header">
        <div className="container max-w-3xl">
          <AnimatedSection>
            <p className="section-label">Work</p>
            <h1 className="theme-heading mb-3">Selected systems and products.</h1>
            <p className="theme-copy leading-relaxed max-w-2xl">
              Problem, contribution, and technology. Client names appear only where the relationship is already public.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section pt-0 pb-12" aria-label="Work list">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ordered.map((project, i) => (
              <AnimatedSection key={project.id} delay={i * 60}>
                <ProjectCard project={project} featured={project.featured} />
              </AnimatedSection>
            ))}
          </div>
          <div className="page-compact-cta">
            <Link href="/contact" className="btn btn-primary">
              Discuss a project <RiArrowRightLine size={16} />
            </Link>
            <Link href="/experience" className="btn btn-outline">
              View experience
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
