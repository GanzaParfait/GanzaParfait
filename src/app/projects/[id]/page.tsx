"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { RiArrowLeftLine, RiExternalLinkLine, RiGithubFill, RiBuilding2Line, RiCodeBoxLine, RiCheckDoubleLine, RiLightbulbFlashLine, RiFocus2Line } from "react-icons/ri";
import { Project, projects as defaultProjects } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function ProjectCaseStudy() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first for dashboard edits, then fallback to default
    try {
      const cached = localStorage.getItem("ppg_projects_list");
      let found: Project | undefined;
      if (cached) {
        const parsed = JSON.parse(cached);
        found = parsed.find((p: Project) => p.id === id);
      }
      if (!found) {
        found = defaultProjects.find((p) => p.id === id);
      }
      if (found) {
        setProject(found);
      } else {
        router.push("/projects");
      }
    } catch (e) {
      const found = defaultProjects.find((p) => p.id === id);
      if (found) setProject(found);
      else router.push("/projects");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading case study...</div>;
  if (!project) return null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] pt-24 pb-20">
      <div className="container max-w-4xl">
        
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-3)] hover:text-[var(--color-primary)] transition-colors mb-8">
          <RiArrowLeftLine /> Back to Projects
        </Link>

        {/* Header section */}
        <AnimatedSection>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold uppercase tracking-widest mb-4">
            {project.category}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--color-text)] tracking-tight leading-[1.1] mb-6">
            {project.title}
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-text-2)] leading-relaxed mb-8">
            {project.longDescription || project.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-12">
            {project.links?.live && (
              <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="btn btn-primary px-6 py-3 rounded-xl gap-2 font-bold shadow-lg shadow-blue-500/20">
                Live Project <RiExternalLinkLine size={18} />
              </a>
            )}
            {project.links?.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline px-6 py-3 rounded-xl gap-2 font-bold">
                <RiGithubFill size={18} /> Source Code
              </a>
            )}
          </div>
        </AnimatedSection>

        {/* Hero Image */}
        {project.image && project.image !== "/images/projects/project-placeholder.png" && (
          <AnimatedSection delay={100} className="mb-16">
            <div className="w-full aspect-[16/9] md:aspect-[21/9] relative rounded-3xl overflow-hidden border border-[var(--color-border)] shadow-2xl">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            </div>
          </AnimatedSection>
        )}

        {/* Case Study Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Main Content */}
          <div className="md:col-span-8 flex flex-col gap-12">
            
            {project.problem && (
              <AnimatedSection delay={200}>
                <h3 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-text)] mb-4">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg"><RiFocus2Line size={20} /></div>
                  The Problem
                </h3>
                <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.problem}</p>
              </AnimatedSection>
            )}

            {project.whatIBuilt && (
              <AnimatedSection delay={300}>
                <h3 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-text)] mb-4">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><RiBuilding2Line size={20} /></div>
                  What I Built
                </h3>
                <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.whatIBuilt}</p>
              </AnimatedSection>
            )}

            {project.result && (
              <AnimatedSection delay={400}>
                <h3 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-text)] mb-4">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><RiCheckDoubleLine size={20} /></div>
                  Result & Impact
                </h3>
                <div className="p-6 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.result}</p>
                </div>
              </AnimatedSection>
            )}

            {project.screenshots && project.screenshots.length > 0 && (
              <AnimatedSection delay={500}>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-6">Visuals</h3>
                <div className="grid grid-cols-1 gap-6">
                  {project.screenshots.map((src, idx) => (
                    <div key={idx} className="w-full rounded-2xl overflow-hidden border border-[var(--color-border)]">
                      <img src={src} alt={`${project.title} screenshot ${idx + 1}`} className="w-full h-auto" />
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            )}

          </div>

          {/* Sidebar */}
          <div className="md:col-span-4">
            <AnimatedSection delay={300} className="sticky top-24 flex flex-col gap-8">
              
              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                  <RiCodeBoxLine size={16} /> Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <span key={tech} className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-sm font-semibold rounded-lg text-[var(--color-text-2)]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.myRole && (
                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                  <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                    <RiLightbulbFlashLine size={16} /> My Role
                  </h4>
                  <p className="text-[var(--color-text)] font-semibold">{project.myRole}</p>
                </div>
              )}

              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                  Project Info
                </h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-3)] font-bold mb-1">YEAR</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{project.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-3)] font-bold mb-1">STATUS</p>
                    <p className="text-sm font-semibold text-[var(--color-text)] capitalize">{project.status.replace('-', ' ')}</p>
                  </div>
                </div>
              </div>

            </AnimatedSection>
          </div>

        </div>

      </div>
    </main>
  );
}
