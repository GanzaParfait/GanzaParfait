"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  RiAddLine,
  RiArrowLeftLine,
  RiArrowRightLine,
  RiBookOpenLine,
  RiBox3Line,
  RiBrainLine,
  RiBriefcaseLine,
  RiBuilding2Line,
  RiCalendarLine,
  RiCheckboxCircleLine,
  RiCloseLine,
  RiCompass3Line,
  RiDatabase2Line,
  RiExternalLinkLine,
  RiFlashlightLine,
  RiGlobalLine,
  RiLineChartLine,
  RiLinkM,
  RiLoader4Line,
  RiMailLine,
  RiPaletteLine,
  RiRocketLine,
  RiSearchLine,
  RiSettings3Line,
  RiShareLine,
  RiShoppingBagLine,
  RiStackLine,
  RiStore2Line,
  RiSubtractLine,
  RiToolsLine,
  RiUserHeartLine,
  RiUserStarLine,
  RiWhatsappLine,
} from "react-icons/ri";
import type { ElementType } from "react";
import { siteConfig } from "@/data/site-data";
import {
  SERVICE_FOCUS_IDS,
  itemsForFamily,
  parseServiceFocus,
  serviceFocusHref,
  type ServiceFocus,
  type ServiceItem,
  type ServicesPageContent,
} from "@/lib/services-page";

export type ServicesProjectCard = {
  id: string;
  title: string;
  description: string;
  image: string;
  organization?: string;
};

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
  chart: RiLineChartLine,
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

const FAMILY_INDEX: Record<ServiceFocus, string> = {
  build: "01",
  grow: "02",
  transform: "03",
  support: "04",
};

const FAMILY_VISUAL: Record<
  ServiceFocus,
  { src: string; caption: string; alt: string; label: string }
> = {
  build: {
    src: "/images/services/svc-build.png",
    caption: "Useful. Modern. Built for people.",
    alt: "Product and systems work by Prince Parfait GANZA — desktop and mobile interfaces",
    label: "Build",
  },
  grow: {
    src: "/images/services/svc-grow.png",
    caption: "More reach. More opportunities.",
    alt: "Digital presence and growth channels supported by Prince Parfait GANZA",
    label: "Grow",
  },
  transform: {
    src: "/images/services/svc-transform.png",
    caption: "Data to decisions.",
    alt: "Data and operations improvement by Prince Parfait GANZA",
    label: "Transform",
  },
  support: {
    src: "/images/services/svc-support.png",
    caption: "Local insight. Global collaboration.",
    alt: "Local and international digital support from Prince Parfait GANZA in Kigali",
    label: "Support",
  },
};

const PROJECT_TAGS: Record<string, string> = {
  "caritas-systems": "Business System",
  askfield: "Data & Research",
  stockpro: "Operations",
  gotallnews: "Web Platform",
};

const AUDIENCE_ICONS: Record<string, ElementType> = {
  Businesses: RiBriefcaseLine,
  Organizations: RiBuilding2Line,
  Founders: RiUserStarLine,
  "International clients": RiGlobalLine,
};

const PROCESS_ICONS = [RiSearchLine, RiCalendarLine, RiSettings3Line, RiLineChartLine];
const FILTER_DELAY_MS = 500;

function ServiceIcon({ name, size = 15 }: { name: string; size?: number }) {
  const Icon = ICONS[name] || RiCheckboxCircleLine;
  return <Icon size={size} aria-hidden="true" />;
}

function FamilyVisual({
  focus,
  onOpen,
}: {
  focus: ServiceFocus;
  onOpen: () => void;
}) {
  const visual = FAMILY_VISUAL[focus];
  return (
    <figure className={`svc-visual is-${focus}`}>
      <button type="button" className="svc-visual-hit" onClick={onOpen} aria-label={`Preview ${visual.label} image`}>
        <Image
          src={visual.src}
          alt={visual.alt}
          width={640}
          height={480}
          sizes="(max-width: 860px) 90vw, 280px"
          className="svc-visual-img"
        />
        <span className="svc-visual-caption">{visual.caption}</span>
      </button>
    </figure>
  );
}

export default function ServicesPageView({
  content,
  initialFocus,
  projects,
  whatsappUrl,
}: {
  content: ServicesPageContent;
  initialFocus: ServiceFocus | null;
  projects: ServicesProjectCard[];
  whatsappUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusFromUrl = parseServiceFocus(searchParams.get("focus"));
  const [focus, setFocus] = useState<ServiceFocus | null>(initialFocus ?? focusFromUrl);
  const [search, setSearch] = useState("");
  const [draftSearch, setDraftSearch] = useState("");
  const [filtering, setFiltering] = useState(false);
  const [openItem, setOpenItem] = useState<ServiceItem | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const filterTimer = useRef<number | null>(null);
  const searchTimer = useRef<number | null>(null);

  const families = useMemo(
    () => [...content.families].sort((a, b) => a.sortOrder - b.sortOrder),
    [content.families],
  );

  const selectedProjects = useMemo(() => {
    const byId = new Map(projects.map((project) => [project.id, project]));
    return content.selectedWork.projectIds
      .map((id) => byId.get(id))
      .filter((project): project is ServicesProjectCard => Boolean(project));
  }, [content.selectedWork.projectIds, projects]);

  const previewSlides = useMemo(
    () =>
      SERVICE_FOCUS_IDS.map((id) => ({
        id,
        ...FAMILY_VISUAL[id],
      })),
    [],
  );

  const visibleFamilies = useMemo(() => {
    const query = search.trim().toLowerCase();
    return families.filter((family) => {
      if (focus && family.id !== focus) return false;
      if (!query) return true;
      const items = itemsForFamily(content, family.id);
      const haystack = [
        family.label,
        family.title,
        family.summary,
        ...items.map((item) => `${item.title} ${item.summary} ${item.description}`),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [content, families, focus, search]);

  useEffect(() => {
    setFocus(focusFromUrl);
  }, [focusFromUrl]);

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`family-${focus}`);
    if (!node) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    }, FILTER_DELAY_MS + 40);
  }, [focus]);

  useEffect(() => {
    return () => {
      if (filterTimer.current) window.clearTimeout(filterTimer.current);
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);

  useEffect(() => {
    if (previewIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreviewIndex(null);
      if (event.key === "ArrowRight") {
        setPreviewIndex((current) => (current === null ? 0 : (current + 1) % previewSlides.length));
      }
      if (event.key === "ArrowLeft") {
        setPreviewIndex((current) =>
          current === null ? 0 : (current - 1 + previewSlides.length) % previewSlides.length,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [previewIndex, previewSlides.length]);

  const runWithLoader = (action: () => void) => {
    setFiltering(true);
    if (filterTimer.current) window.clearTimeout(filterTimer.current);
    filterTimer.current = window.setTimeout(() => {
      action();
      setFiltering(false);
      filterTimer.current = null;
    }, FILTER_DELAY_MS);
  };

  const selectFocus = (next: ServiceFocus | null) => {
    runWithLoader(() => {
      setFocus(next);
      router.push(serviceFocusHref(next), { scroll: false });
    });
  };

  const onSearchChange = (value: string) => {
    setDraftSearch(value);
    setFiltering(true);
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      setSearch(value);
      setFiltering(false);
      searchTimer.current = null;
    }, FILTER_DELAY_MS);
  };

  const openPreview = (id: ServiceFocus) => {
    const index = previewSlides.findIndex((slide) => slide.id === id);
    setPreviewIndex(index >= 0 ? index : 0);
  };

  const preview = previewIndex !== null ? previewSlides[previewIndex] : null;

  return (
    <div className="svc-page">
      <header className="svc-hero" data-page-section data-section-label="Services">
        <div className="container svc-hero-grid">
          <div className="svc-hero-copy">
            <p className="section-label">{content.hero.label}</p>
            <h1>{content.hero.title}</h1>
            <p className="svc-hero-body">
              Services from{" "}
              <Link href="/about" className="svc-seo-name">
                {siteConfig.name}
              </Link>
              . {content.hero.body}
            </p>
          </div>
          <aside className="svc-hero-aside" aria-label="Service principles">
            <p className="svc-hero-aside-line">
              {content.hero.rail.map((item, index) => (
                <span key={item}>
                  {index > 0 ? <i aria-hidden="true">·</i> : null}
                  <strong>{item}</strong>
                </span>
              ))}
            </p>
            <p className="svc-hero-aside-note">{content.hero.railNote}</p>
          </aside>
        </div>

        <div className="container svc-toolbar">
          <div className="svc-filter" role="tablist" aria-label="Capability families">
            <button
              type="button"
              role="tab"
              aria-selected={focus === null}
              className={focus === null ? "is-on" : undefined}
              onClick={() => selectFocus(null)}
              disabled={filtering}
            >
              All
            </button>
            {SERVICE_FOCUS_IDS.map((id) => {
              const family = families.find((item) => item.id === id);
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={focus === id}
                  className={focus === id ? "is-on" : undefined}
                  onClick={() => selectFocus(id)}
                  disabled={filtering}
                >
                  {family?.label || id}
                </button>
              );
            })}
          </div>
          <label className="svc-search">
            <RiSearchLine size={15} aria-hidden="true" />
            <span className="sr-only">Search services</span>
            <input
              type="search"
              value={draftSearch}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search services…"
              autoComplete="off"
            />
            {filtering ? (
              <RiLoader4Line className="svc-search-spin" size={16} aria-label="Filtering" />
            ) : null}
          </label>
        </div>
      </header>

      <section className="svc-families" aria-label={`Services by ${siteConfig.name}`} aria-busy={filtering} data-page-section data-section-label="Capabilities">
        <div className={`container svc-families-list${filtering ? " is-loading" : ""}`}>
          {visibleFamilies.length ? (
            visibleFamilies.map((family) => {
              const items = itemsForFamily(content, family.id);
              const active = focus === family.id;
              const dimmed = Boolean(focus && focus !== family.id);
              return (
                <article
                  key={family.id}
                  id={`family-${family.id}`}
                  className={`svc-family-card is-${family.id}${active ? " is-active" : ""}${dimmed ? " is-dim" : ""}`}
                  data-advance-item
                  data-advance-label={family.label}
                  onDoubleClick={() => selectFocus(family.id)}
                  title="Double-click to focus this family"
                >
                  <div className="svc-family-info">
                    <span className="svc-family-icon" aria-hidden="true">
                      <ServiceIcon
                        name={
                          family.id === "build"
                            ? "box"
                            : family.id === "grow"
                              ? "chart"
                              : family.id === "transform"
                                ? "layers"
                                : "globe-people"
                        }
                        size={18}
                      />
                    </span>
                    <p className="svc-family-kicker">
                      {FAMILY_INDEX[family.id]} {family.label.toUpperCase()}
                    </p>
                    <h2>{family.title}</h2>
                    <p>{family.summary}</p>
                    <button type="button" className="svc-family-link" onClick={() => selectFocus(family.id)}>
                      Explore {family.label.toLowerCase()} services <RiArrowRightLine size={14} />
                    </button>
                  </div>

                  <div className="svc-family-visual">
                    <FamilyVisual focus={family.id} onOpen={() => openPreview(family.id)} />
                  </div>

                  <ul className="svc-family-services">
                    {items.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          className={openItem?.id === item.id ? "is-open" : undefined}
                          onClick={() => setOpenItem(openItem?.id === item.id ? null : item)}
                          aria-expanded={openItem?.id === item.id}
                        >
                          <span className="svc-family-service-icon">
                            <ServiceIcon name={item.icon} size={14} />
                          </span>
                          <span className="svc-family-service-label">{item.title}</span>
                          <span className="svc-family-service-toggle" aria-hidden="true">
                            {openItem?.id === item.id ? <RiSubtractLine size={15} /> : <RiAddLine size={15} />}
                          </span>
                        </button>
                        {openItem?.id === item.id ? (
                          <div className="svc-family-service-detail">
                            <p>{item.description}</p>
                            {item.capabilities.length ? (
                              <ul>
                                {item.capabilities.slice(0, 4).map((cap) => (
                                  <li key={cap}>{cap}</li>
                                ))}
                              </ul>
                            ) : null}
                            {item.relatedProjects.length ? (
                              <p className="svc-detail-work">
                                Seen in{" "}
                                {item.relatedProjects.slice(0, 2).map((id, index) => {
                                  const project = projects.find((entry) => entry.id === id);
                                  if (!project) return null;
                                  return (
                                    <span key={id}>
                                      {index > 0 ? ", " : ""}
                                      <Link href={`/projects/${id}`}>{project.title}</Link>
                                    </span>
                                  );
                                })}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })
          ) : (
            <p className="svc-empty">No services match that filter. Try another category or clear search.</p>
          )}
        </div>
      </section>

      {selectedProjects.length ? (
        <section className="svc-work" aria-labelledby="svc-work-heading" data-page-section data-section-label="Selected work">
          <div className="container">
            <div className="svc-work-head">
              <div>
                <p className="section-label">{content.selectedWork.label}</p>
                <h2 id="svc-work-heading">{content.selectedWork.title}</h2>
                {content.selectedWork.body ? <p className="svc-section-lead">{content.selectedWork.body}</p> : null}
              </div>
              <Link href={content.selectedWork.ctaHref} className="svc-work-all">
                {content.selectedWork.ctaLabel} <RiArrowRightLine size={14} />
              </Link>
            </div>
            <div className="svc-work-grid">
              {selectedProjects.map((project) => (
                <article
                  key={project.id}
                  className="svc-work-card"
                  data-advance-item
                  data-advance-label={project.title}
                >
                  <Link href={`/projects/${project.id}`} className="svc-work-media">
                    <Image
                      src={project.image}
                      alt={`${project.title} — project by ${siteConfig.name}`}
                      width={480}
                      height={300}
                    />
                  </Link>
                  <div className="svc-work-copy">
                    {PROJECT_TAGS[project.id] ? <span className="svc-work-tag">{PROJECT_TAGS[project.id]}</span> : null}
                    <h3>
                      <Link href={`/projects/${project.id}`}>{project.title}</Link>
                    </h3>
                    <p>{project.description}</p>
                    <Link href={`/projects/${project.id}`} className="svc-work-link">
                      View project <RiArrowRightLine size={13} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="svc-audiences" aria-labelledby="svc-audiences-heading" data-page-section data-section-label="Who I work with">
        <div className="container">
          <p className="section-label">{content.audiences.label}</p>
          <h2 id="svc-audiences-heading">{content.audiences.title}</h2>
          <div className="svc-audience-layout">
            <div className="svc-audience-row">
              {content.audiences.items.map((item) => {
                const Icon = AUDIENCE_ICONS[item.title] || RiRocketLine;
                return (
                  <article key={item.title} className="svc-audience-card">
                    <span aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    <Link href="/contact" className="svc-audience-go" aria-label={`Contact about ${item.title}`}>
                      <RiArrowRightLine size={14} />
                    </Link>
                  </article>
                );
              })}
            </div>
            {content.audiences.sideNote ? (
              <p className="svc-audience-aside">{content.audiences.sideNote}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="svc-process" aria-labelledby="svc-process-heading" data-page-section data-section-label="Process">
        <div className="container">
          <p className="section-label">{content.process.label}</p>
          <h2 id="svc-process-heading">{content.process.title}</h2>
          <div className="svc-process-layout">
            <ol className="svc-process-row">
              {content.process.steps.map((step, index) => {
                const Icon = PROCESS_ICONS[index] || RiCheckboxCircleLine;
                return (
                  <li key={step.n}>
                    <div>
                      <span className="svc-process-icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <strong>
                        {step.n} {step.title}
                      </strong>
                      <p>{step.body}</p>
                    </div>
                    {index < content.process.steps.length - 1 ? (
                      <RiArrowRightLine className="svc-process-arrow" size={16} aria-hidden="true" />
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {content.process.note ? (
              <aside className="svc-process-note">
                <span aria-hidden="true">
                  <RiMailLine size={18} />
                </span>
                <p>{content.process.note}</p>
              </aside>
            ) : null}
          </div>
          {content.leronyNote ? (
            <p className="svc-lerony">
              {content.leronyNote}{" "}
              <a href={siteConfig.company.url} target="_blank" rel="noopener noreferrer">
                {siteConfig.company.name} <RiExternalLinkLine size={12} aria-hidden="true" />
              </a>
            </p>
          ) : null}
        </div>
      </section>

      <section className="svc-cta" aria-labelledby="svc-cta-heading" data-page-section data-section-label="Let's work together">
        <div className="container svc-cta-banner">
          <div className="svc-cta-top">
            <div className="svc-cta-copy">
              {content.cta.label ? <p className="svc-cta-label">{content.cta.label}</p> : null}
              <h2 id="svc-cta-heading">{content.cta.title}</h2>
              <p>
                {content.cta.body} Talk with{" "}
                <Link href="/about" className="svc-seo-name">
                  {siteConfig.name}
                </Link>{" "}
                in Kigali, Rwanda.
              </p>
            </div>
            <div className="svc-cta-actions">
              <Link href={content.cta.primaryHref} className="btn btn-primary">
                <RiCalendarLine size={15} /> {content.cta.primaryLabel} <RiArrowRightLine size={15} />
              </Link>
              <a href={content.cta.secondaryHref} className="btn btn-outline">
                <RiMailLine size={15} /> {content.cta.secondaryLabel}
              </a>
              {whatsappUrl ? (
                <a href={whatsappUrl} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                  <RiWhatsappLine size={15} /> {content.cta.whatsappLabel}
                </a>
              ) : null}
            </div>
          </div>
          {content.cta.trust?.length ? (
            <ul className="svc-cta-trust">
              {content.cta.trust.map((item) => (
                <li key={item}>
                  <RiCheckboxCircleLine size={15} aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {preview ? (
        <div
          className="svc-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${preview.label} preview`}
          onClick={() => setPreviewIndex(null)}
        >
          <button type="button" className="svc-lightbox-close" aria-label="Close preview" onClick={() => setPreviewIndex(null)}>
            <RiCloseLine size={20} />
          </button>
          <button
            type="button"
            className="svc-lightbox-nav is-prev"
            aria-label="Previous image"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewIndex((current) =>
                current === null ? 0 : (current - 1 + previewSlides.length) % previewSlides.length,
              );
            }}
          >
            <RiArrowLeftLine size={20} />
          </button>
          <figure className="svc-lightbox-frame" onClick={(event) => event.stopPropagation()}>
            <Image src={preview.src} alt={preview.alt} width={1200} height={900} className="svc-lightbox-img" />
            <figcaption>
              <strong>{preview.label}</strong>
              <span>{preview.caption}</span>
            </figcaption>
          </figure>
          <button
            type="button"
            className="svc-lightbox-nav is-next"
            aria-label="Next image"
            onClick={(event) => {
              event.stopPropagation();
              setPreviewIndex((current) => (current === null ? 0 : (current + 1) % previewSlides.length));
            }}
          >
            <RiArrowRightLine size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}
