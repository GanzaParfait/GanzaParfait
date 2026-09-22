import Link from "next/link";
import { type Project } from "@/data/site-data";
import { RiExternalLinkLine, RiGithubFill, RiArrowRightLine } from "react-icons/ri";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

const statusConfig: Record<Project["status"], { label: string; className: string }> = {
  live: { label: "Live", className: "badge-success" },
  "in-progress": { label: "In Progress", className: "badge-primary" },
  staging: { label: "Staging", className: "badge-primary" },
  completed: { label: "Completed", className: "badge-success" },
  ongoing: { label: "Ongoing", className: "badge-primary" },
  archived: { label: "Archived", className: "badge-outline" },
};

const categoryLabels: Record<Project["category"], string> = {
  web: "Web",
  mobile: "Mobile",
  ai: "AI-enabled",
  saas: "Company",
  technology: "Technology & Innovation",
  "open-source": "Open Source",
  systems: "Systems",
  product: "Product",
  other: "Other",
};

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const status = statusConfig[project.status];

  return (
    <article
      className={`card group relative flex flex-col h-full ${featured ? "p-7" : "p-6"}`}
      aria-label={`Project: ${project.title}`}
    >
      {project.image && !project.image.includes("placeholder") ? (
        <img src={project.image} alt="" loading="lazy" decoding="async" className="case-shot mb-4 rounded-xl border border-[var(--color-border)]" />
      ) : null}
      {/* Status + Category */}
      <div className="flex items-center justify-between mb-4">
        <span className={`badge ${status.className}`}>{status.label}</span>
        <span className="text-xs theme-muted font-medium">
          {categoryLabels[project.category]}
          {project.period ? ` · ${project.period}` : project.year ? ` · ${project.year}` : ""}
        </span>
      </div>

      {/* Title */}
      <h3
        className={`font-semibold theme-heading mb-2 group-hover:text-[#60a5fa] transition-colors duration-200 ${
          featured ? "text-xl" : "text-lg"
        }`}
        style={{ fontFamily: "var(--font-heading)" }}
      >
        {project.title}
      </h3>

      {/* Description */}
      <p className="text-sm theme-copy leading-relaxed flex-1 mb-5">
        {project.description}
      </p>

      {/* Tech stack */}
      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5" aria-label="Technologies used">
          {project.technologies.slice(0, featured ? 6 : 4).map((tech) => (
            <span key={tech} className="tech-tag">
              {tech}
            </span>
          ))}
          {project.technologies.length > (featured ? 6 : 4) && (
            <span className="tech-tag theme-muted">
              +{project.technologies.length - (featured ? 6 : 4)}
            </span>
          )}
        </div>
      )}

      {/* Evidence Section */}
      {(project.problem || project.whatIBuilt || project.myRole || project.outcome || project.result) && (
        <div className="flex-1 flex flex-col gap-3 mt-2 mb-6 border-l-2 border-[var(--color-border)] pl-4">
          {project.problem && (
            <div>
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider theme-muted mb-1">Problem</span>
              <p className="text-sm theme-copy">{project.problem}</p>
            </div>
          )}
          {project.whatIBuilt && (
            <div>
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider theme-muted mb-1">What I Built</span>
              <p className="text-sm theme-copy">{project.whatIBuilt}</p>
            </div>
          )}
          {project.myRole && (
            <div>
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider theme-muted mb-1">My Role</span>
              <p className="text-sm theme-copy">{project.myRole}</p>
            </div>
          )}
          {project.outcome && (
            <div>
              <span className="block text-[0.65rem] font-bold uppercase tracking-wider theme-muted mb-1">Outcome</span>
              <p className="text-sm theme-copy">{project.outcome}</p>
            </div>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-3 pt-4 border-t border-[rgba(14,82,168,0.1)]">
        <Link
          href={`/projects/${project.id}`}
          className="btn btn-primary btn-sm"
          style={{ fontWeight: 700 }}
        >
          Read Case Study
          <RiArrowRightLine size={14} />
        </Link>
        
        {project.links.live && (
          <a
            href={project.links.live}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            aria-label={`Visit ${project.title} (opens in new tab)`}
          >
            <RiExternalLinkLine size={14} />
            Live
          </a>
        )}
        {project.links.github && (
          <a
            href={project.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm theme-copy ml-auto"
            aria-label={`View ${project.title} on GitHub (opens in new tab)`}
          >
            <RiGithubFill size={14} />
            Code
          </a>
        )}
      </div>
    </article>
  );
}
