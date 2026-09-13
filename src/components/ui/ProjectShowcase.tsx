"use client";

import Link from "next/link";
import { RiArrowRightLine } from "react-icons/ri";
import AnimatedSection from "@/components/ui/AnimatedSection";
import type { Project } from "@/data/site-data";

export default function ProjectShowcase({ projects }: { projects: Project[] }) {
  return (
    <section className="section selected-work" aria-label="Selected work">
      <div className="container">
        <AnimatedSection className="selected-work-head">
          <div>
            <p className="section-label">Selected work</p>
            <h2>Evidence, not a catalogue.</h2>
          </div>
          <Link href="/projects" className="btn btn-ghost selected-work-all">
            All work <RiArrowRightLine size={16} />
          </Link>
        </AnimatedSection>

        <div className="selected-work-list">
          {projects.map((project, index) => (
            <article key={project.id} className="selected-work-entry">
              <p className="selected-work-index">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <p className="selected-work-meta">
                  <span>{project.category}</span>
                  <span>{project.myRole || "Builder"}</span>
                  <span>{project.period || project.year || "Current"}</span>
                </p>
                <h3>{project.title}</h3>
                {project.organization ? <p className="selected-work-org">{project.organization}</p> : null}
                <p className="selected-work-problem">{project.problem || project.challenge || project.description}</p>
                <p className="selected-work-body">
                  <strong>Contribution. </strong>
                  {project.whatIBuilt || project.solution}
                </p>
                <p className="selected-work-body">
                  <strong>Status. </strong>
                  {project.outcome || project.result || "In use as documented."}
                </p>
                <Link href={`/projects/${project.id}`} className="selected-work-link">
                  Read the case <RiArrowRightLine size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
