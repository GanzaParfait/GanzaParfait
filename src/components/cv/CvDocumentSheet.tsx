"use client";

import { useMemo } from "react";
import {
  resolveCvDocument,
  splitDisplayName,
  type CvResolvedDocument,
  type CvResolvedItem,
  type CvSectionId,
  type CvTemplateId,
} from "@/lib/cv";
import type { SiteSettings } from "@/lib/supabase";

const LEFT_COL: CvSectionId[] = ["education", "training", "certifications", "leadership"];
const RIGHT_COL: CvSectionId[] = ["skills", "languages", "links", "achievements", "expertise", "references"];
const FULL_FLOW: CvSectionId[] = ["profile", "experience", "projects"];

function photoClass(shape: string) {
  if (shape === "rounded") return "is-rounded";
  if (shape === "square") return "is-square";
  return "is-circle";
}

function ProEntry({ item, mode = "experience" }: { item: CvResolvedItem; mode?: "experience" | "project" }) {
  const title =
    mode === "project" ? item.title : item.subtitle ? `${item.title} – ${item.subtitle}` : item.title;
  return (
    <div className="cv-pro-entry">
      <div className="cv-pro-entry-head">
        <h3>{title}</h3>
        {mode === "project" ? (
          item.meta ? <span className="cv-pro-tag">{item.meta}</span> : null
        ) : item.period ? (
          <span className="cv-pro-period">{item.period}</span>
        ) : null}
      </div>
      {mode === "experience" && (item.location || item.meta) ? (
        <div className="cv-pro-entry-meta">
          <span>{item.location || ""}</span>
          {item.meta ? <span className="cv-pro-tag">{item.meta}</span> : null}
        </div>
      ) : null}
      {mode === "project" && item.subtitle ? <p className="cv-pro-sub">{item.subtitle}</p> : null}
      {item.summary ? <p className="cv-pro-summary">{item.summary}</p> : null}
      {item.highlights?.length ? (
        <ul className="cv-pro-bullets">
          {item.highlights.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ProSectionBody({ section }: { section: CvResolvedDocument["sections"][number] }) {
  if (section.id === "profile" && section.body) {
    return <p className="cv-pro-body">{section.body}</p>;
  }
  if (section.id === "skills" && section.skillsByCategory?.length) {
    return (
      <div className="cv-pro-skills">
        {section.skillsByCategory.map((group) => (
          <div key={group.category} className="cv-pro-skill-row">
            <strong>{group.category}</strong>
            <span>{group.names.join(", ")}</span>
          </div>
        ))}
      </div>
    );
  }
  if (section.id === "languages" && section.languages?.length) {
    return (
      <div className="cv-pro-langs">
        {section.languages.map((lang) => (
          <div key={lang.name} className="cv-pro-lang-row">
            <strong>{lang.name}</strong>
            <span>{lang.proficiency || lang.note || ""}</span>
          </div>
        ))}
      </div>
    );
  }
  if (section.id === "links" && section.items.length) {
    return (
      <div className="cv-pro-links">
        {section.items.map((item) => (
          <div key={item.key} className="cv-pro-link-row">
            <strong>{item.title}</strong>
            <span>{(item.href || "").replace(/^https?:\/\//, "") || item.title}</span>
          </div>
        ))}
      </div>
    );
  }
  if (section.id === "projects") {
    return section.items.map((item) => <ProEntry key={item.key} item={item} mode="project" />);
  }
  return section.items.map((item) => <ProEntry key={item.key} item={item} />);
}

function ProfessionalSheet({ doc }: { doc: CvResolvedDocument }) {
  const byId = new Map(doc.sections.map((s) => [s.id, s]));
  const full = FULL_FLOW.map((id) => byId.get(id)).filter(Boolean) as CvResolvedDocument["sections"];
  const left = LEFT_COL.map((id) => byId.get(id)).filter(Boolean) as CvResolvedDocument["sections"];
  const right = RIGHT_COL.map((id) => byId.get(id)).filter(Boolean) as CvResolvedDocument["sections"];
  const placed = new Set([...FULL_FLOW, ...LEFT_COL, ...RIGHT_COL]);
  const extras = doc.sections.filter((s) => !placed.has(s.id));
  const tagline =
    doc.appearance.tagline?.trim() ||
    "Technology for people. Practical solutions for real impact.";
  const photo = doc.appearance.showPhoto
    ? doc.appearance.photoUrl || doc.appearance.resolvedPhotoUrl
    : undefined;
  const site = doc.contact.website?.replace(/^https?:\/\//, "") || "www.princeparfait.com";
  const linkedin = doc.contact.links.find((l) => l.id === "linkedin");
  const github = doc.contact.links.find((l) => l.id === "github");
  const { given, family } = splitDisplayName(doc.name);

  return (
    <article className="cv-sheet cv-pro" data-template="professional" data-header="pro">
      <header className="cv-pro-head">
        <div className="cv-pro-head-top">
          <div className="cv-pro-head-main">
            <h1>
              {family ? (
                <>
                  {given}
                  <span className="cv-pro-family">{family}</span>
                </>
              ) : (
                doc.name
              )}
            </h1>
            <p className="cv-pro-headline">{doc.headline}</p>
          </div>
          <div className="cv-pro-head-side">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className={`cv-sheet-photo ${photoClass(doc.appearance.photoShape)}`} />
            ) : null}
            <p className="cv-pro-tagline">{tagline}</p>
          </div>
        </div>
        <ul className="cv-pro-contact">
          {doc.contact.location ? <li data-icon="pin">{doc.contact.location}</li> : null}
          {doc.contact.email ? <li data-icon="mail">{doc.contact.email}</li> : null}
          {doc.contact.phone ? <li data-icon="phone">{doc.contact.phone}</li> : null}
          <li data-icon="web">{site}</li>
          {linkedin ? <li data-icon="in">LinkedIn</li> : null}
          {github ? <li data-icon="gh">GitHub</li> : null}
        </ul>
      </header>

      {full.map((section) => (
        <section key={section.id} className="cv-pro-section">
          <h2>{section.title}</h2>
          <ProSectionBody section={section} />
        </section>
      ))}

      {extras.map((section) => (
        <section key={section.id} className="cv-pro-section">
          <h2>{section.title}</h2>
          <ProSectionBody section={section} />
        </section>
      ))}

      {(left.length > 0 || right.length > 0) && (
        <div className="cv-pro-cols">
          <div className="cv-pro-col">
            {left.map((section) => (
              <section key={section.id} className="cv-pro-section">
                <h2>{section.title}</h2>
                <ProSectionBody section={section} />
              </section>
            ))}
          </div>
          <div className="cv-pro-col">
            {right.map((section) => (
              <section key={section.id} className="cv-pro-section">
                <h2>{section.title}</h2>
                <ProSectionBody section={section} />
              </section>
            ))}
          </div>
        </div>
      )}

      <footer className="cv-pro-foot">
        <span>{doc.name}</span>
        <span> </span>
        <span>{doc.label}</span>
      </footer>
    </article>
  );
}

function SheetHeader({ doc }: { doc: CvResolvedDocument }) {
  const appearance = doc.appearance;
  const photo = appearance.showPhoto
    ? appearance.photoUrl || appearance.resolvedPhotoUrl
    : undefined;
  const site = doc.contact.website?.replace(/^https?:\/\//, "");
  const social = doc.contact.links.filter((l) => l.id !== "website");
  const tagline = appearance.tagline?.trim();
  const quote =
    tagline ||
    (doc.profile ? doc.profile.split(/(?<=\.)\s+/)[0] : "Practical technology for people and progress.");

  if (appearance.headerStyle === "banner") {
    return (
      <header className="cv-sheet-head is-banner">
        <div className="cv-sheet-banner-band">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className={`cv-sheet-photo ${photoClass(appearance.photoShape)}`} />
          ) : null}
          <h1>{doc.name}</h1>
          <p className="cv-sheet-headline">{doc.headline}</p>
          <p className="cv-sheet-meta">
            {[doc.contact.location, doc.contact.email, doc.contact.phone, site].filter(Boolean).join(" · ")}
          </p>
          {social.length ? (
            <p className="cv-sheet-meta">{social.map((l) => l.label).join(" · ")}</p>
          ) : null}
        </div>
        <div className="cv-sheet-banner-quote">
          <p>{quote}</p>
        </div>
      </header>
    );
  }

  if (appearance.headerStyle === "centered") {
    return (
      <header className="cv-sheet-head is-centered">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className={`cv-sheet-photo ${photoClass(appearance.photoShape)}`} />
        ) : null}
        <h1>{doc.name}</h1>
        <p className="cv-sheet-headline">{doc.headline}</p>
        <p className="cv-sheet-meta">
          {[doc.contact.location, doc.contact.email, doc.contact.phone, site].filter(Boolean).join(" · ")}
        </p>
        {social.length ? (
          <p className="cv-sheet-meta">{social.map((l) => l.label).join(" · ")}</p>
        ) : null}
      </header>
    );
  }

  return (
    <header className="cv-sheet-head is-classic">
      <div className="cv-sheet-classic-row">
        <div>
          <h1>{doc.name}</h1>
          <p className="cv-sheet-headline">{doc.headline}</p>
          <p className="cv-sheet-meta">
            {[doc.contact.location, doc.contact.email, doc.contact.phone, site].filter(Boolean).join(" · ")}
          </p>
          {social.length ? (
            <p className="cv-sheet-meta">{social.map((l) => l.label).join(" · ")}</p>
          ) : null}
        </div>
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" className={`cv-sheet-photo ${photoClass(appearance.photoShape)}`} />
        ) : null}
      </div>
    </header>
  );
}

function SheetFooter({ doc }: { doc: CvResolvedDocument }) {
  const style = doc.appearance.footerStyle;
  if (style === "none") return null;
  const site = doc.contact.website?.replace(/^https?:\/\//, "") || "princeparfait.com";
  if (style === "centered") {
    return (
      <footer className="cv-sheet-foot is-centered">
        {doc.name} · {site}
      </footer>
    );
  }
  if (style === "minimal") {
    return <footer className="cv-sheet-foot is-minimal">Page preview</footer>;
  }
  return (
    <footer className="cv-sheet-foot is-paged">
      <span>
        {doc.name} · {site}
      </span>
      <span>{doc.label}</span>
    </footer>
  );
}

export function CvDocumentSheet({
  settings,
  template,
  className = "",
}: {
  settings: SiteSettings;
  template: CvTemplateId;
  className?: string;
}) {
  const doc = useMemo(() => resolveCvDocument(settings, template), [settings, template]);

  if (doc.template === "professional") {
    return (
      <div className={className || undefined}>
        <ProfessionalSheet doc={doc} />
      </div>
    );
  }

  const headerStyle = doc.appearance.headerStyle;
  const hideProfile = headerStyle === "banner";

  return (
    <article
      className={`cv-sheet ${className}`.trim()}
      data-template={doc.template}
      data-header={headerStyle}
      data-footer={doc.appearance.footerStyle}
    >
      <SheetHeader doc={doc} />
      {doc.sections.map((section) => {
        if (section.id === "profile" && hideProfile) return null;
        return (
          <section key={section.id} className="cv-sheet-section">
            <h2>{section.title}</h2>
            {section.body ? <p>{section.body}</p> : null}
            {section.chips?.length ? (
              <div
                className={
                  headerStyle === "centered" || doc.template === "compact"
                    ? "cv-sheet-chip-row"
                    : "cv-sheet-expertise-grid"
                }
              >
                {section.chips.map((chip) => (
                  <span
                    key={chip}
                    className={
                      headerStyle === "centered" || doc.template === "compact"
                        ? "cv-sheet-chip"
                        : "cv-sheet-expertise-cell"
                    }
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
            {section.skillsByCategory?.map((group) => (
              <p key={group.category} className="cv-sheet-skill">
                <strong>{group.category}:</strong> {group.names.join(", ")}
              </p>
            ))}
            {section.languages?.map((lang) => (
              <p key={lang.name} className="cv-sheet-skill">
                <strong>{lang.name}</strong>
                {lang.proficiency ? ` — ${lang.proficiency}` : ""}
              </p>
            ))}
            {section.id === "leadership" && doc.template === "executive" && section.items[0] ? (
              <div className="cv-sheet-exec-card">
                {section.items.map((item) => (
                  <div key={item.key} className="cv-sheet-item">
                    <div className="cv-sheet-item-head">
                      <h3>{item.subtitle || item.title}</h3>
                      {item.period ? <span>{item.period}</span> : null}
                    </div>
                    {item.subtitle ? <p className="cv-sheet-sub">{item.title}</p> : null}
                    {item.summary ? <p>{item.summary}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              section.items.map((item) => (
                <div key={item.key} className="cv-sheet-item">
                  <div className="cv-sheet-item-head">
                    <h3>{item.title}</h3>
                    {item.period ? <span>{item.period}</span> : null}
                  </div>
                  {item.subtitle ? <p className="cv-sheet-sub">{item.subtitle}</p> : null}
                  {section.id !== "links" && item.summary ? <p>{item.summary}</p> : null}
                  {section.id === "links" && item.href ? (
                    <p className="cv-sheet-sub">{item.href.replace(/^https?:\/\//, "")}</p>
                  ) : null}
                </div>
              ))
            )}
          </section>
        );
      })}
      <SheetFooter doc={doc} />
    </article>
  );
}
