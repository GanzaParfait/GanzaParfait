"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { RiDownloadLine, RiEyeLine, RiLoader4Line } from "react-icons/ri";
import type { SiteSettings } from "@/lib/supabase";
import {
  CV_TEMPLATE_OPTIONS,
  cvPdfFilename,
  getCvConfig,
  resolveCvDocument,
  type CvTemplateId,
} from "@/lib/cv";

function A4Preview({ settings, template }: { settings: SiteSettings; template: CvTemplateId }) {
  const doc = useMemo(() => resolveCvDocument(settings, template), [settings, template]);
  return (
    <article className="cv-sheet is-public" data-template={doc.template}>
      <header className="cv-sheet-head">
        <h1>{doc.name}</h1>
        <p className="cv-sheet-headline">{doc.headline}</p>
        <p className="cv-sheet-meta">
          {[doc.contact.location, doc.contact.email, doc.contact.phone]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      {doc.sections.slice(0, 6).map((section) => (
        <section key={section.id} className="cv-sheet-section">
          <h2>{section.title}</h2>
          {section.body ? <p>{section.body}</p> : null}
          {section.chips?.length ? (
            <p className="cv-sheet-chips">{section.chips.join(" · ")}</p>
          ) : null}
          {section.skillsByCategory?.slice(0, 3).map((group) => (
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
          {section.items.slice(0, 3).map((item) => (
            <div key={item.key} className="cv-sheet-item">
              <div className="cv-sheet-item-head">
                <h3>{item.title}</h3>
                {item.period ? <span>{item.period}</span> : null}
              </div>
              {item.subtitle ? <p className="cv-sheet-sub">{item.subtitle}</p> : null}
              {item.summary ? <p>{item.summary}</p> : null}
            </div>
          ))}
        </section>
      ))}
      <p className="cv-sheet-more">Preview excerpt — download the PDF for the full document.</p>
    </article>
  );
}

export default function CvPageClient({ settings }: { settings: SiteSettings }) {
  const config = getCvConfig(settings);
  const publicFormats = (Object.keys(config.formats) as CvTemplateId[]).filter(
    (id) => id === config.defaultTemplate || config.formats[id].isPublic
  );
  const [active, setActive] = useState<CvTemplateId>(config.defaultTemplate);
  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const download = async (template: CvTemplateId) => {
    setError("");
    setDownloading(true);
    try {
      const res = await fetch(`/api/cv/pdf?template=${template}&download=1`);
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
    <div className="cv-landing">
      <div className="container cv-landing-inner">
        <header className="cv-landing-hero">
          <p className="cv-landing-kicker">Curriculum Vitae</p>
          <h1>CV / Resume</h1>
          <p className="cv-landing-name">Prince Parfait GANZA</p>
          <p className="cv-landing-lead">
            Professionally typeset A4 documents — selectable text, print-ready, grounded in verified
            portfolio records. Choose a format, preview, or download PDF.
          </p>
          {error ? (
            <p className="cv-page-error" role="alert">
              {error}
            </p>
          ) : null}
        </header>

        <div className="cv-format-cards">
          {publicFormats.map((id) => {
            const opt = CV_TEMPLATE_OPTIONS.find((o) => o.id === id)!;
            const isDefault = id === config.defaultTemplate;
            return (
              <article key={id} className={active === id ? "cv-format-card is-active" : "cv-format-card"}>
                <div className="cv-format-card-top">
                  <h2>{opt.label}</h2>
                  {isDefault ? <span className="cv-format-badge">Default</span> : null}
                </div>
                <p>{opt.hint}</p>
                <p className="cv-format-headline">{config.formats[id].headline}</p>
                <div className="cv-format-card-actions">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setActive(id);
                      setViewing(true);
                    }}
                  >
                    <RiEyeLine size={16} /> View
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={downloading}
                    onClick={() => void download(id)}
                  >
                    {downloading && active === id ? (
                      <RiLoader4Line size={16} className="cv-spin" />
                    ) : (
                      <RiDownloadLine size={16} />
                    )}
                    Download PDF
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <p className="cv-landing-note">
          Prefer a conversation? <Link href="/contact">Contact</Link> ·{" "}
          <Link href="/experience">Experience</Link>
        </p>

        {viewing ? (
          <div className="cv-a4-stage">
            <div className="cv-a4-toolbar">
              <span>{config.formats[active].label}</span>
              <div className="cv-a4-toolbar-actions">
                <button type="button" onClick={() => void download(active)} disabled={downloading}>
                  <RiDownloadLine size={16} /> {cvPdfFilename(active)}
                </button>
                <button type="button" onClick={() => setViewing(false)}>
                  Close
                </button>
              </div>
            </div>
            <div className="cv-a4-frame">
              <A4Preview settings={settings} template={active} />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
