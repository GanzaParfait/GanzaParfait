"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiArrowRightLine,
  RiBookOpenLine,
  RiBox3Line,
  RiBrainLine,
  RiCheckboxCircleLine,
  RiCompass3Line,
  RiDatabase2Line,
  RiExternalLinkLine,
  RiFlashlightLine,
  RiGlobalLine,
  RiLinkM,
  RiMailLine,
  RiPaletteLine,
  RiSearchLine,
  RiSettings3Line,
  RiShareLine,
  RiShoppingBagLine,
  RiStackLine,
  RiStore2Line,
  RiToolsLine,
  RiUserHeartLine,
  RiWhatsappLine,
} from "react-icons/ri";
import type { ElementType } from "react";
import { siteConfig } from "@/data/site-data";
import AnimatedSection from "@/components/ui/AnimatedSection";
import {
  SERVICE_FOCUS_IDS,
  orderedFamilies,
  itemsForFamily,
  parseServiceFocus,
  serviceFocusHref,
  type ServiceFocus,
  type ServiceItem,
  type ServicesPageContent,
} from "@/lib/services-page";

const ICONS: Record<string, ElementType> = {
  code: RiStackLine,
  globe: RiGlobalLine,
  puzzle: RiDatabase2Line,
  layers: RiLinkM,
  box: RiBox3Line,
  store: RiStore2Line,
  radar: RiSearchLine,
  share: RiShareLine,
  cart: RiShoppingBagLine,
  palette: RiPaletteLine,
  search: RiSearchLine,
  flow: RiFlashlightLine,
  chart: RiDatabase2Line,
  link: RiLinkM,
  bolt: RiFlashlightLine,
  brain: RiBrainLine,
  compass: RiCompass3Line,
  guide: RiCompass3Line,
  "globe-people": RiUserHeartLine,
  wrench: RiToolsLine,
  book: RiBookOpenLine,
  settings: RiSettings3Line,
};

function ServiceIcon({ name }: { name: string }) {
  const Icon = ICONS[name] || RiCheckboxCircleLine;
  return <Icon size={18} aria-hidden="true" />;
}

function RelatedWork({
  item,
  titles,
}: {
  item: ServiceItem;
  titles: Map<string, string>;
}) {
  const links = item.relatedProjects
    .map((id) => ({ id, title: titles.get(id) }))
    .filter((entry): entry is { id: string; title: string } => Boolean(entry.title));
  if (!links.length && !item.relatedExperience.length) return null;
  return (
    <div className="svc-related-block">
      {links.length ? (
        <p className="svc-related">
          <span>Seen in selected work</span>
          {links.map((link, index) => (
            <span key={link.id}>
              {index > 0 ? ", " : " → "}
              <Link href={`/projects/${link.id}`}>{link.title}</Link>
            </span>
          ))}
        </p>
      ) : null}
      {item.relatedExperience.length ? (
        <p className="svc-related">
          <span>Related experience</span>
          {" → "}
          <Link href="/experience">View timeline</Link>
        </p>
      ) : null}
    </div>
  );
}

export default function ServicesPageView({
  content,
  initialFocus,
  projectTitles,
  whatsappUrl,
}: {
  content: ServicesPageContent;
  initialFocus: ServiceFocus | null;
  projectTitles: Record<string, string>;
  whatsappUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusFromUrl = parseServiceFocus(searchParams.get("focus"));
  const [focus, setFocus] = useState<ServiceFocus | null>(initialFocus ?? focusFromUrl);
  const titles = useMemo(() => new Map(Object.entries(projectTitles)), [projectTitles]);

  useEffect(() => {
    setFocus(focusFromUrl);
  }, [focusFromUrl]);

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`family-${focus}`);
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 40);
  }, [focus]);

  const selectFocus = (next: ServiceFocus | null) => {
    setFocus(next);
    const href = serviceFocusHref(next);
    router.push(href, { scroll: false });
  };

  const families = orderedFamilies(content, focus);

  return (
    <div className="svc-page">
      <section className="section page-compact-hero svc-hero" aria-labelledby="services-heading">
        <div className="container">
          <AnimatedSection>
            <p className="section-label">{content.hero.label}</p>
            <h1 id="services-heading" className="theme-heading svc-hero-title">
              {content.hero.title}
            </h1>
            <p className="theme-copy text-lg leading-relaxed svc-hero-body">{content.hero.body}</p>
          </AnimatedSection>

          <div className="svc-filter" role="tablist" aria-label="Capability families">
            <button
              type="button"
              role="tab"
              aria-selected={focus === null}
              className={focus === null ? "is-on" : undefined}
              onClick={() => selectFocus(null)}
            >
              All
            </button>
            {SERVICE_FOCUS_IDS.map((id) => {
              const family = content.families.find((item) => item.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={focus === id}
                  className={focus === id ? "is-on" : undefined}
                  onClick={() => selectFocus(id)}
                >
                  {family?.label || id}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <nav className="svc-navigator" aria-label="Service families">
        <div className="container svc-navigator-inner">
          {SERVICE_FOCUS_IDS.map((id) => {
            const family = content.families.find((item) => item.id === id);
            return (
              <a
                key={id}
                href={`#family-${id}`}
                className={focus === id ? "is-on" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  selectFocus(id);
                }}
              >
                {family?.label || id}
              </a>
            );
          })}
        </div>
      </nav>

      {families.map((family) => {
        const items = itemsForFamily(content, family.id);
        const emphasized = focus === family.id;
        return (
          <section
            key={family.id}
            id={`family-${family.id}`}
            className={`section svc-family is-${family.layout}${emphasized ? " is-focus" : ""}${focus && focus !== family.id ? " is-dim" : ""}`}
            aria-labelledby={`family-title-${family.id}`}
          >
            <div className="container">
              <div className="svc-family-head">
                <div>
                  <p className="section-label">{family.label}</p>
                  <h2 id={`family-title-${family.id}`} className="theme-heading">
                    {family.title}
                  </h2>
                  <p className="theme-copy svc-family-summary">{family.summary}</p>
                </div>
                {emphasized ? <span className="svc-focus-chip">Focused from Knowledge</span> : null}
              </div>

              <div className={`svc-grid is-${family.layout}`}>
                {items.map((item, index) => (
                  <article
                    key={item.id}
                    className={`svc-card${item.featured ? " is-featured" : ""}`}
                    aria-label={item.title}
                  >
                    <div className="svc-card-top">
                      <span className="svc-card-icon">
                        <ServiceIcon name={item.icon} />
                      </span>
                      {item.shortTitle ? <span className="svc-card-kicker">{item.shortTitle}</span> : null}
                    </div>
                    <h3>{item.title}</h3>
                    <p className="svc-card-summary">{item.summary}</p>
                    <p className="svc-card-desc">{item.description}</p>
                    {item.capabilities.length ? (
                      <ul className="svc-caps">
                        {item.capabilities.slice(0, family.layout === "feature" ? 4 : 6).map((cap) => (
                          <li key={cap}>
                            <RiCheckboxCircleLine size={14} aria-hidden="true" />
                            <span>{cap}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {item.technologies.length ? (
                      <p className="svc-tech">{item.technologies.join(" · ")}</p>
                    ) : null}
                    <RelatedWork item={item} titles={titles} />
                    {index === 0 && family.layout === "feature" ? (
                      <Link href="/contact" className="svc-inline-cta">
                        Discuss this capability <RiArrowRightLine size={14} />
                      </Link>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="section svc-audiences" aria-labelledby="audiences-heading">
        <div className="container">
          <AnimatedSection>
            <p className="section-label">{content.audiences.label}</p>
            <h2 id="audiences-heading" className="theme-heading">
              {content.audiences.title}
            </h2>
            <p className="theme-copy svc-family-summary">{content.audiences.body}</p>
          </AnimatedSection>
          <div className="svc-audience-grid">
            {content.audiences.items.map((item) => (
              <article key={item.title} className="svc-audience-card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section svc-process" aria-labelledby="process-heading">
        <div className="container">
          <AnimatedSection className="svc-process-head">
            <p className="section-label">{content.process.label}</p>
            <h2 id="process-heading" className="theme-heading">
              {content.process.title}
            </h2>
          </AnimatedSection>
          <ol className="svc-steps">
            {content.process.steps.map((step) => (
              <li key={step.n}>
                <span>{step.n}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {content.leronyNote ? (
            <p className="svc-lerony">
              {content.leronyNote}{" "}
              <a href={siteConfig.company.url} target="_blank" rel="noopener noreferrer">
                {siteConfig.company.name} <RiExternalLinkLine size={14} aria-hidden="true" />
              </a>
            </p>
          ) : null}
        </div>
      </section>

      <section className="section svc-cta" aria-labelledby="services-cta-heading">
        <div className="container svc-cta-inner">
          <div>
            <h2 id="services-cta-heading" className="theme-heading">
              {content.cta.title}
            </h2>
            <p className="theme-copy">{content.cta.body}</p>
          </div>
          <div className="svc-cta-actions">
            <Link href={content.cta.primaryHref} className="btn btn-primary btn-lg">
              {content.cta.primaryLabel}
              <RiArrowRightLine size={18} />
            </Link>
            <a href={content.cta.secondaryHref} className="btn btn-outline btn-lg">
              <RiMailLine size={17} />
              {content.cta.secondaryLabel}
            </a>
            {whatsappUrl ? (
              <a href={whatsappUrl} className="btn btn-outline btn-lg" target="_blank" rel="noopener noreferrer">
                <RiWhatsappLine size={17} />
                {content.cta.whatsappLabel}
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
