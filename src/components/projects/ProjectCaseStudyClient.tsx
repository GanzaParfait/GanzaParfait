"use client";

import Link from "next/link";
import {
  RiArrowLeftLine,
  RiExternalLinkLine,
  RiGithubFill,
  RiBuilding2Line,
  RiCodeBoxLine,
  RiCheckDoubleLine,
  RiLightbulbFlashLine,
  RiFocus2Line,
} from "react-icons/ri";
import { RiPlayFill } from "react-icons/ri";
import { useState } from "react";
import { Project, projects as defaultProjects } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import ShareActions from "@/components/ui/ShareActions";
import { useSiteSettings } from "@/hooks/useSiteSettings";

function PosterVideo({ src, poster, title }: { src: string; poster?: string; title: string }) {
  const [ready, setReady] = useState(false);
  if (!ready) {
    return (
      <button type="button" className="poster-video" onClick={() => setReady(true)} aria-label={`Play ${title}`}>
        {poster ? <img src={poster} alt="" /> : <span className="announcement-video-fallback" style={{ minHeight: "16rem" }} />}
        <span><RiPlayFill size={26} /></span>
      </button>
    );
  }
  return <video src={src} poster={poster} controls autoPlay preload="metadata" playsInline style={{ width: "100%", borderRadius: "1rem" }} />;
}

export default function ProjectCaseStudyClient({ project }: { project: Project }) {
  const settings = useSiteSettings();
  const saved = settings.projectRecords?.find((item) => item.id === project.id);
  const live = saved ? { ...project, ...saved, title: saved.title || project.title, description: saved.description || project.description } : project;
  project = live;
  return (
    <article className="min-h-screen bg-[var(--color-bg)] pt-8 pb-20">
      <div className="container max-w-4xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-text-3)] hover:text-[var(--color-primary)] transition-colors mb-8"
        >
          <RiArrowLeftLine /> Back to work
        </Link>

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

          <div className="flex flex-wrap gap-4 mb-8">
            {project.links?.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary px-6 py-3 rounded-xl gap-2 font-bold shadow-lg shadow-blue-500/20"
              >
                Live Project <RiExternalLinkLine size={18} />
              </a>
            )}
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline px-6 py-3 rounded-xl gap-2 font-bold"
              >
                <RiGithubFill size={18} /> Source Code
              </a>
            )}
          </div>

          <ShareActions
            title={`${project.title} by Prince Parfait GANZA`}
            excerpt={project.description}
            campaign={`project-${project.id}`}
            content={project.id}
          />
        </AnimatedSection>

        {project.image && project.image !== "/images/projects/project-placeholder.png" && (
          <AnimatedSection delay={100} className="mb-8 mt-10">
            <img src={project.image} alt={`${project.title} interface`} className="case-shot rounded-3xl border border-[var(--color-border)]" />
          </AnimatedSection>
        )}
        {project.video ? (
          <div className="mb-8">
            <PosterVideo src={project.video} poster={project.videoPoster || project.image} title={project.title} />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mt-12">
          <div className="md:col-span-8 flex flex-col gap-12">
            {project.context && (
              <AnimatedSection delay={160}>
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">Context</h2>
                <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.context}</p>
              </AnimatedSection>
            )}

            {(project.challenge || project.problem) && (
              <AnimatedSection delay={200}>
                <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-text)] mb-4">
                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                    <RiFocus2Line size={20} />
                  </div>
                  Challenge
                </h2>
                <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.challenge || project.problem}</p>
              </AnimatedSection>
            )}

            {(project.solution || project.whatIBuilt) && (
              <AnimatedSection delay={280}>
                <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-text)] mb-4">
                  <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                    <RiBuilding2Line size={20} />
                  </div>
                  Solution
                </h2>
                <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.solution || project.whatIBuilt}</p>
              </AnimatedSection>
            )}

            {(project.outcome || project.result) && (
              <AnimatedSection delay={360}>
                <h2 className="flex items-center gap-3 text-2xl font-bold text-[var(--color-text)] mb-4">
                  <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                    <RiCheckDoubleLine size={20} />
                  </div>
                  Outcome
                </h2>
                <div className="p-6 border border-[var(--color-border)] rounded-2xl bg-[var(--color-surface)]">
                  <p className="text-[var(--color-text-2)] leading-loose text-lg">{project.outcome || project.result}</p>
                </div>
              </AnimatedSection>
            )}

            {project.independent && (
              <p className="text-sm text-[var(--color-text-3)]">
                Independent product-development work, distinct from commercially deployed client systems.
              </p>
            )}

            {project.screenshots && project.screenshots.length > 0 && (
              <AnimatedSection delay={440}>
                <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">Evidence</h2>
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

          <div className="md:col-span-4">
            <AnimatedSection delay={300} className="sticky top-24 flex flex-col gap-8">
              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                  <RiCodeBoxLine size={16} /> Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 bg-[var(--color-bg)] border border-[var(--color-border)] text-sm font-semibold rounded-lg text-[var(--color-text-2)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {project.myRole && (
                <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                    <RiLightbulbFlashLine size={16} /> My Role
                  </h3>
                  <p className="text-[var(--color-text)] font-semibold">{project.myRole}</p>
                </div>
              )}

              <div className="p-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-3)] mb-4">
                  Project Info
                </h3>
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs text-[var(--color-text-3)] font-bold mb-1">PERIOD</p>
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {project.period || (project.year ? String(project.year) : "Not published")}
                    </p>
                  </div>
                  {project.organization && (
                    <div>
                      <p className="text-xs text-[var(--color-text-3)] font-bold mb-1">ORGANIZATION</p>
                      <p className="text-sm font-semibold text-[var(--color-text)]">{project.organization}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[var(--color-text-3)] font-bold mb-1">STATUS</p>
                    <p className="text-sm font-semibold text-[var(--color-text)] capitalize">
                      {project.status.replace("-", " ")}
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <AnimatedSection className="mt-16">
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">Related work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {defaultProjects
              .filter((item) => item.id !== project.id)
              .slice(0, 4)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`/projects/${item.id}`}
                  className="card p-5"
                  style={{ textDecoration: "none" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--color-primary)" }}>
                    {item.organization || "Work"}
                  </p>
                  <h3 className="theme-heading text-lg mb-2">{item.title}</h3>
                  <p className="text-sm theme-copy">{item.description}</p>
                </Link>
              ))}
          </div>
        </AnimatedSection>
      </div>
    </article>
  );
}
