"use client";

import Link from "next/link";
import {
  RiArrowRightLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiBuildingLine,
  RiGraduationCapLine,
  RiFlashlightLine,
  RiSparklingLine,
  RiFocus3Line,
  RiGlobalLine,
  RiDiamondLine,
  RiSettings3Line,
  RiUserHeartLine,
  RiLineChartLine,
} from "react-icons/ri";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import {
  aboutPageFrom,
  type AboutFactIcon,
  type AboutPageContent,
  type AboutValueIcon,
} from "@/lib/about-page";
import AnimatedSection from "@/components/ui/AnimatedSection";
import EngineeringToolkitSection from "@/components/about/EngineeringToolkitSection";
import { siteConfig } from "@/data/site-data";

function FactIcon({ icon }: { icon: AboutFactIcon }) {
  if (icon === "briefcase") return <RiBriefcaseLine size={16} />;
  if (icon === "building") return <RiBuildingLine size={16} />;
  if (icon === "grad") return <RiGraduationCapLine size={16} />;
  if (icon === "bolt") return <RiFlashlightLine size={16} />;
  if (icon === "sparkle") return <RiSparklingLine size={16} />;
  if (icon === "target") return <RiFocus3Line size={16} />;
  if (icon === "globe") return <RiGlobalLine size={16} />;
  return <RiMapPinLine size={16} />;
}

function ValueIcon({ icon }: { icon: AboutValueIcon }) {
  if (icon === "gear") return <RiSettings3Line size={18} />;
  if (icon === "person") return <RiUserHeartLine size={18} />;
  if (icon === "chart") return <RiLineChartLine size={18} />;
  return <RiDiamondLine size={18} />;
}

/**
 * Public About order:
 * who → specializations → selected evidence → toolkit → principles → contact.
 * Journey lives on the homepage — not duplicated here.
 */
export default function AboutPageView({
  content: contentOverride,
  embedded = false,
}: {
  content?: AboutPageContent;
  embedded?: boolean;
} = {}) {
  const settings = useSiteSettings();
  const page = contentOverride || aboutPageFrom(settings);
  const locationFact = page.hero.facts.find((fact) => fact.label === "Location");
  const location = locationFact?.value.replace(/\n/g, " ") || "Kigali, Rwanda";

  return (
    <div className={embedded ? "about-page about-embedded" : "about-page"}>
      <section className="about-hero" aria-label="About introduction">
        <div className="container about-hero-grid">
          <AnimatedSection direction="left" className="about-hero-visual">
            <span className="about-portrait-aura" aria-hidden />
            <div className="about-portrait-wrap">
              {page.hero.portrait ? (
                <img
                  src={page.hero.portrait}
                  alt={siteConfig.portraitAlt}
                  className="about-portrait"
                  width={1200}
                  height={1200}
                  fetchPriority="high"
                  decoding="async"
                />
              ) : null}
              <span className="about-portrait-place">
                <RiMapPinLine size={12} /> {location}
              </span>
            </div>
          </AnimatedSection>

          <AnimatedSection className="about-hero-copy">
            <p className="section-label">{page.hero.label}</p>
            <h1>{page.hero.title}</h1>
            <p className="about-lead">{page.hero.body}</p>
            <div className="about-actions">
              <Link href={page.hero.primaryCtaHref} className="btn btn-primary">
                {page.hero.primaryCtaLabel} <RiArrowRightLine size={15} />
              </Link>
              <Link href={page.hero.secondaryCtaHref} className="btn btn-outline">
                {page.hero.secondaryCtaLabel}
              </Link>
              <Link href="/cv?source=about" className="btn btn-outline about-cv-btn">
                View CV <RiArrowRightLine size={15} />
              </Link>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={80} direction="right" className="about-facts">
            <ul>
              {page.hero.facts.map((fact) => (
                <li key={`${fact.label}-${fact.value}`}>
                  <span className="about-fact-icon" aria-hidden>
                    <FactIcon icon={fact.icon} />
                  </span>
                  <span>
                    <small>{fact.label}</small>
                    <strong>{fact.value}</strong>
                  </span>
                </li>
              ))}
            </ul>
          </AnimatedSection>
        </div>
      </section>

      <section className="about-band" aria-label={page.focus.title}>
        <div className="container">
          <div className="about-band-head">
            <p className="section-label">{page.focus.label}</p>
            <h2>{page.focus.title}</h2>
          </div>
          <ol className="about-spec-grid">
            {page.focus.items.map((item, index) => (
              <li key={item.title} className="about-spec-item">
                <span className="about-spec-num" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {page.facts.items.length ? (
        <section className="about-band" aria-label={page.facts.title}>
          <div className="container">
            <div className="about-band-head">
              <p className="section-label">{page.facts.label}</p>
              <h2>{page.facts.title}</h2>
            </div>
            <div className="about-key-grid" data-count={page.facts.items.length}>
              {page.facts.items.map((item) => {
                const external = /^https?:\/\//i.test(item.href);
                if (external) {
                  return (
                    <a
                      key={item.title}
                      href={item.href}
                      className="about-key-card"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                      <em>{item.meta}</em>
                      <i aria-hidden>
                        <RiArrowRightLine size={14} />
                      </i>
                    </a>
                  );
                }
                return (
                  <Link key={item.title} href={item.href} className="about-key-card">
                    <strong>{item.title}</strong>
                    <span>{item.subtitle}</span>
                    <em>{item.meta}</em>
                    <i aria-hidden>
                      <RiArrowRightLine size={14} />
                    </i>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {!embedded ? <EngineeringToolkitSection /> : null}

      {page.values.items.length ? (
        <section className="about-band is-soft" aria-label={page.values.title}>
          <div className="container">
            <div className="about-band-head">
              <p className="section-label">{page.values.label}</p>
              <h2>{page.values.title}</h2>
            </div>
            <div className="about-values-grid" data-count={page.values.items.length}>
              {page.values.items.map((item) => (
                <article key={item.title} className="about-value-card">
                  <span aria-hidden>
                    <ValueIcon icon={item.icon} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="about-cta" aria-label="Contact">
        <div className="container">
          <div className="about-cta-panel">
            <div>
              <p className="section-label">{page.cta.label}</p>
              <h2>{page.cta.title}</h2>
              {page.cta.body ? <p>{page.cta.body}</p> : null}
            </div>
            <div className="about-actions">
              <Link href={page.cta.primaryCtaHref} className="btn btn-primary">
                {page.cta.primaryCtaLabel} <RiArrowRightLine size={15} />
              </Link>
              <Link href={page.cta.secondaryCtaHref} className="btn btn-outline">
                {page.cta.secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
