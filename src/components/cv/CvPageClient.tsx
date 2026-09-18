"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RiDownloadLine, RiEyeLine, RiLoader4Line } from "react-icons/ri";
import type { SiteSettings } from "@/lib/supabase";
import {
  cvPdfFilename,
  getCvConfig,
  resolveCvDocument,
  type CvTemplateId,
} from "@/lib/cv";

function CvArticle({ template, settings }: { template: CvTemplateId; settings: SiteSettings }) {
  const doc = useMemo(() => resolveCvDocument(settings, template), [settings, template]);

  return (
    <article className="cv-article" data-template={doc.template}>
      <header className="cv-article-head">
        <h1>{doc.name}</h1>
        <p className="cv-article-headline">{doc.headline}</p>
        <p className="cv-article-contact">
          {[doc.contact.email, doc.contact.phone, doc.contact.location, doc.contact.website]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>

      {doc.sections.map((section) => {
        if (section.id === "contact") return null;
        return (
          <section key={section.id} className="cv-article-section">
            <h2>{section.title}</h2>
            {section.body ? <p>{section.body}</p> : null}
            {section.skillsByCategory?.map((group) => (
              <p key={group.category} className="cv-skills-row">
                <strong>{group.category}:</strong> {group.names.join(", ")}
              </p>
            ))}
            {section.items.map((item) => (
              <div key={item.key} className="cv-article-item">
                <div className="cv-article-item-head">
                  <h3>{item.title}</h3>
                  {item.period ? <span>{item.period}</span> : null}
                </div>
                {item.subtitle || item.location ? (
                  <p className="cv-article-sub">
                    {[item.subtitle, item.location].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
                {item.summary ? <p>{item.summary}</p> : null}
                {item.highlights?.length ? (
                  <ul>
                    {item.highlights.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}
                {item.meta ? <p className="cv-article-meta">{item.meta}</p> : null}
              </div>
            ))}
          </section>
        );
      })}
    </article>
  );
}

export default function CvPageClient({ settings }: { settings: SiteSettings }) {
  const config = getCvConfig(settings);
  const [active, setActive] = useState<CvTemplateId>(config.defaultTemplate);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const publicTemplates = (Object.keys(config.formats) as CvTemplateId[]).filter(
    (id) => id === config.defaultTemplate || config.formats[id].isPublic
  );

  const download = async (template: CvTemplateId) => {
    setError("");
    setDownloading(true);
    try {
      const res = await fetch(`/api/cv/pdf?template=${template}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Download failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cvPdfFilename(template);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="cv-page">
      <div className="container cv-page-inner">
        <header className="cv-page-hero">
          <p className="cv-page-kicker">Curriculum Vitae</p>
          <h1>CV / Resume</h1>
          <p className="cv-page-lead">
            View and download a selectable-text PDF of Prince Parfait GANZA&apos;s professional
            profile. Content is managed from the Control Center and grounded in verified portfolio
            data.
          </p>
          <div className="cv-page-actions">
            <a href="#cv-preview" className="btn btn-primary">
              <RiEyeLine size={18} /> View CV
            </a>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={downloading}
              onClick={() => download(active)}
            >
              {downloading ? <RiLoader4Line size={18} className="cv-spin" /> : <RiDownloadLine size={18} />}
              {downloading ? "Preparing PDF…" : "Download PDF"}
            </button>
            <Link href="/contact" className="cv-page-link">
              Contact
            </Link>
          </div>
          {error ? <p className="cv-page-error" role="alert">{error}</p> : null}
        </header>

        {publicTemplates.length > 1 ? (
          <div className="cv-format-tabs" role="tablist" aria-label="CV formats">
            {publicTemplates.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active === id}
                className={active === id ? "is-active" : undefined}
                onClick={() => setActive(id)}
              >
                {config.formats[id].label}
                {id === config.defaultTemplate ? " · Default" : ""}
              </button>
            ))}
          </div>
        ) : null}

        <div id="cv-preview" className="cv-preview-shell">
          <div className="cv-preview-toolbar">
            <span>{config.formats[active].label}</span>
            <button type="button" disabled={downloading} onClick={() => download(active)}>
              <RiDownloadLine size={16} /> {cvPdfFilename(active)}
            </button>
          </div>
          <CvArticle template={active} settings={settings} />
        </div>
      </div>
    </div>
  );
}
