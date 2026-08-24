import type { Metadata } from "next";
import { projects, siteConfig } from "@/data/site-data";
import ProjectCard from "@/components/ui/ProjectCard";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { buildBreadcrumbJsonLd, buildPageMetadata, buildWebPageJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Projects by PPG — Software & AI Portfolio",
  description:
    "Explore software projects built by Prince Parfait GANZA (PPG) — web applications, AI tools, SaaS products, and open-source work from Rwanda.",
  path: "/projects",
  keywords: ["PPG projects", "Prince Parfait GANZA portfolio", "Lerony projects", "Rwanda software projects"],
});

export default function ProjectsPage() {
  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);

  const schema = [
    buildWebPageJsonLd({
      name: "Projects by Prince Parfait GANZA (PPG)",
      description: "Software and AI projects portfolio by PPG from Rwanda.",
      path: "/projects",
    }),
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Projects", path: "/projects" },
    ]),
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Prince Parfait GANZA (PPG) Projects",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteConfig.url}/projects/${project.id}`,
        name: project.title,
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="section pt-32 pb-10 relative dot-grid overflow-hidden" aria-label="Projects header">
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-radial pointer-events-none" />
        <div className="container relative z-10 max-w-4xl">
          <AnimatedSection>
            <p className="section-label">Portfolio</p>
            <h1 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              Things I&apos;ve built.
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
              A curated selection of projects by Prince Parfait GANZA (PPG) spanning web development, AI
              integration, SaaS products, and open-source contributions.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {featuredProjects.length > 0 && (
        <section className="section bg-mesh" aria-label="Featured projects">
          <div className="container">
            <AnimatedSection className="mb-10">
              <p className="section-label">Featured</p>
              <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Highlights.
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <section className="section" aria-label="Other projects">
          <div className="container">
            <AnimatedSection className="mb-10">
              <p className="section-label">More Work</p>
              <h2 className="text-white" style={{ fontFamily: "var(--font-heading)" }}>
                Other projects.
              </h2>
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

      <section className="section" aria-label="GitHub call to action">
        <div className="container">
          <AnimatedSection className="text-center">
            <p className="section-label justify-center">Open Source</p>
            <h2 className="text-white mb-4" style={{ fontFamily: "var(--font-heading)" }}>
              More on GitHub.
            </h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              These are my highlighted projects. Find more experiments,
              open-source contributions, and work-in-progress on GitHub.
            </p>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-lg"
              aria-label="View GitHub profile (opens in new tab)"
            >
              View GitHub Profile
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
