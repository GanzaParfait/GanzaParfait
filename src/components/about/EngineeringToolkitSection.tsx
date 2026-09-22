"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toolkitWithEvidence } from "@/lib/engineering-toolkit";

/**
 * Restrained Engineering Toolkit — technologies linked to project evidence.
 */
export default function EngineeringToolkitSection() {
  const settings = useSiteSettings();
  const categories = useMemo(
    () => toolkitWithEvidence(settings.projectRecords),
    [settings.projectRecords],
  );
  const [active, setActive] = useState<string | null>(null);

  const activeItem = useMemo(() => {
    if (!active) return null;
    for (const category of categories) {
      const found = category.items.find((item) => item.name === active);
      if (found) return found;
    }
    return null;
  }, [active, categories]);

  return (
    <section className="about-band" aria-label="Engineering toolkit">
      <div className="container">
        <div className="about-band-head">
          <p className="section-label">Engineering toolkit</p>
          <h2>Technologies I use in real work</h2>
          <p className="about-toolkit-lead">
            Tools shown here connect to project evidence where possible, not a decorative skill cloud.
          </p>
        </div>

        <div className="about-toolkit-grid">
          {categories.map((category) => (
            <article key={category.id} className="about-toolkit-card">
              <h3>{category.title}</h3>
              <ul>
                {category.items.map((item) => {
                  const hasEvidence = item.evidence.length > 0;
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        className={active === item.name ? "is-on" : undefined}
                        onClick={() => setActive(active === item.name ? null : item.name)}
                        aria-pressed={active === item.name}
                        disabled={!hasEvidence}
                        title={
                          hasEvidence
                            ? `Show projects using ${item.name}`
                            : `${item.name} — documented capability; attach a project to surface evidence`
                        }
                      >
                        {item.name}
                        {hasEvidence ? <span className="about-toolkit-count">{item.evidence.length}</span> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </article>
          ))}
        </div>

        {activeItem ? (
          <div className="about-toolkit-evidence" role="region" aria-label={`${activeItem.name} evidence`}>
            <p>
              <strong>{activeItem.name}</strong> appears in:
            </p>
            <ul>
              {activeItem.evidence.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    {project.title} <RiArrowRightLine size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link className="about-toolkit-all" href={`/projects?tech=${encodeURIComponent(activeItem.name)}`}>
              Browse work using {activeItem.name} <RiArrowRightLine size={14} aria-hidden />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
