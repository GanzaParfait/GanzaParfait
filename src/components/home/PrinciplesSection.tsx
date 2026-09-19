"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiBox3Line,
  RiLineChartLine,
  RiSearchLine,
} from "react-icons/ri";
import type { HomepageContent, PrincipleIcon } from "@/lib/homepage";

function PrincipleGlyph({ icon }: { icon: PrincipleIcon }) {
  if (icon === "cube") return <RiBox3Line size={22} />;
  if (icon === "trend") return <RiLineChartLine size={22} />;
  return <RiSearchLine size={22} />;
}

export default function PrinciplesSection({
  principles,
  attribution,
  embedded = false,
}: {
  principles: HomepageContent["principles"];
  attribution?: string;
  embedded?: boolean;
}) {
  const cite = principles.quoteAttribution || attribution || "Prince Parfait GANZA";

  return (
    <section
      className={embedded ? "principles principles-embedded" : "principles"}
      aria-label="Working principles"
      id="principles"
      data-page-section={embedded ? undefined : true}
      data-section-label={embedded ? undefined : "Principles"}
    >
      <div className="container">
        <div className="principles-head">
          <div className="principles-intro">
            <p className="section-label">{principles.label}</p>
            <h2>{principles.title}</h2>
            {principles.subtitle ? <p className="principles-lead">{principles.subtitle}</p> : null}
          </div>

          {principles.quote ? (
            <blockquote className="principles-quote">
              <p>{principles.quote}</p>
              <cite>— {cite}</cite>
            </blockquote>
          ) : null}
        </div>

        <ol className="principles-grid">
          {principles.items.map((item) => (
            <li key={item.n}>
              <div className="principles-card-top">
                <span className="principles-icon" aria-hidden="true">
                  <PrincipleGlyph icon={item.icon || "search"} />
                </span>
                <div className="principles-card-meta">
                  <span className="principles-n">{item.n}</span>
                  <span className="principles-rule" aria-hidden="true" />
                </div>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </li>
          ))}
        </ol>

        {principles.ctaHref && principles.ctaLabel ? (
          <div className="principles-foot">
            <span />
            <Link href={principles.ctaHref} className="btn btn-outline principles-cta">
              {principles.ctaLabel} <RiArrowRightLine size={16} />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
