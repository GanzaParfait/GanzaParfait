import type { Metadata } from "next";
import { projects } from "@/data/site-data";
import ProjectCard from "@/components/ui/ProjectCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { buildPageMetadata } from "@/lib/seo";
import {
  buildBreadcrumbListJsonLd,
  buildGraph,
  buildItemListJsonLd,
  buildWebPageJsonLd,
} from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { PublicSocialAnchor } from "@/components/public/PublicContact";

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
      <Breadcrumbs items={breadcrumbItems} />

      <section className="section pt-8 pb-10" aria-label="Work header">
        <div className="container max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Work</p>
            <h1 className="theme-heading mb-4">Selected systems and products.</h1>
            <p className="theme-copy text-lg leading-relaxed max-w-2xl">
              Each piece of work is framed as a problem, a contribution, and the technologies involved. Client names appear only where the relationship is already public. Outcomes without evidence are omitted.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section className="section pt-0" aria-label="Featured work">
          <div className="container">
            <AnimatedSection className="mb-10">
              <p className="section-label">Featured</p>
              <h2 className="theme-heading">Primary evidence.</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredProjects.map((project, i) => (
                <AnimatedSection key={project.id} delay={i * 80}>
                  <ProjectCard project={project} featured />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {otherProjects.length > 0 && (
        <section className="section" aria-label="Additional work" style={{ background: "var(--color-bg-2)" }}>
          <div className="container">
            <AnimatedSection className="mb-10">
              <p className="section-label">Also</p>
              <h2 className="theme-heading">Further work.</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherProjects.map((project, i) => (
                <AnimatedSection key={project.id} delay={i * 80}>
                  <ProjectCard project={project} />
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-label="GitHub">
        <div className="container text-center">
          <AnimatedSection>
            <p className="section-label justify-center">Source</p>
            <h2 className="theme-heading mb-4">Public code on GitHub.</h2>
            <p className="theme-copy mb-8 max-w-md mx-auto">
              Experiments and public repositories live on GitHub. Client systems stay off this page when they cannot be shown.
            </p>
            <PublicSocialAnchor platform="github" className="btn btn-primary btn-lg">
              GitHub profile
            </PublicSocialAnchor>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
