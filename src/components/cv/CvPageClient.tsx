"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RiDownloadLine,
  RiEyeLine,
  RiFileTextLine,
  RiLoader4Line,
  RiMailLine,
  RiShieldCheckLine,
  RiSmartphoneLine,
  RiCloseLine,
} from "react-icons/ri";
import CvAccessDialog from "@/components/cv/CvAccessDialog";
import { CvDocumentSheet } from "@/components/cv/CvDocumentSheet";
import { useHistoryBackClose, dismissOnBackdrop } from "@/hooks/useHistoryBackClose";
import type { SiteSettings } from "@/lib/supabase";
import {
  CV_TEMPLATE_OPTIONS,
  cvPdfFilename,
  getCvConfig,
  resolveCvDocument,
  type CvResolvedDocument,
  type CvTemplateId,
} from "@/lib/cv";
import { resolveLibraryDocument } from "@/lib/cv-document-resolve";
import {
  cvDocumentFilename,
  cvLayoutLabel,
  defaultPublicCvDocument,
  getCvLibrary,
  publicCvDocuments,
  type CvDocument,
} from "@/lib/cv-library";
import {
  cvAccessFormatLabel,
  isCvActionGated,
  parseCvAccessSource,
  readCvUnlockedFromDocument,
  type CvAccessAction,
  type CvAccessSource,
} from "@/lib/cv-access";

function SkeletonLines({ widths }: { widths: string[] }) {
  return (
    <div className="cv-skel-lines" aria-hidden="true">
      {widths.map((width, index) => (
        <span key={`${width}-${index}`} className="cv-skel-line" style={{ width }} />
      ))}
    </div>
  );
}

function MiniDoc({
  doc,
  layer,
}: {
  doc: CvResolvedDocument;
  layer: "back" | "mid" | "front";
}) {
  const contactLine = [
    doc.contact.location,
    doc.contact.email,
    doc.contact.emailSecondary,
    doc.contact.phone,
  ]
    .filter(Boolean)
    .join("  |  ");
  const isFront = layer === "front";

  return (
    <article className={`cv-mini-doc is-${layer}`} aria-hidden={layer !== "front"}>
      <header className="cv-mini-doc-head">
        <p className="cv-mini-doc-name">{doc.name}</p>
        <p className="cv-mini-doc-headline">{doc.headline}</p>
        {isFront ? <p className="cv-mini-doc-meta">{contactLine}</p> : null}
      </header>

      {!isFront ? (
        <section className="cv-mini-doc-block">
          <h3>Projects</h3>
          <SkeletonLines widths={["86%", "72%", "64%"]} />
        </section>
      ) : null}

      <section className="cv-mini-doc-block">
        <h3>Professional Profile</h3>
        <SkeletonLines widths={isFront ? ["94%", "82%", "68%"] : ["90%", "74%"]} />
      </section>

      <section className="cv-mini-doc-block">
        <h3>Core Expertise</h3>
        <ul className="cv-mini-expertise" aria-hidden="true">
          {(isFront ? ["70%", "62%", "66%", "58%"] : ["68%", "60%", "64%", "54%"]).map((width, index) => (
            <li key={index}>
              <span className="cv-mini-bullet" />
              <span className="cv-skel-line" style={{ width }} />
            </li>
          ))}
        </ul>
      </section>

      <section className="cv-mini-doc-block">
        <h3>Experience</h3>
        <SkeletonLines widths={isFront ? ["88%", "74%", "60%"] : ["84%", "70%"]} />
      </section>
    </article>
  );
}

function FullPreview({
  resolved,
  label,
  onClose,
  onDownload,
  downloading,
}: {
  resolved: CvResolvedDocument;
  label: string;
  onClose: () => void;
  onDownload: () => void;
  downloading: boolean;
}) {
  useHistoryBackClose(true, onClose);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="cv-preview-layer"
      role="dialog"
      aria-modal="true"
      aria-label={`${label} preview`}
      onMouseDown={dismissOnBackdrop(onClose)}
    >
      <div className="cv-preview-dialog" onMouseDown={(event) => event.stopPropagation()}>
        <div className="cv-preview-dialog-bar">
          <div>
            <p className="cv-preview-dialog-kicker">Preview</p>
            <h2>{label}</h2>
          </div>
          <div className="cv-preview-dialog-actions">
            <button type="button" className="btn btn-primary" onClick={onDownload} disabled={downloading}>
              {downloading ? <RiLoader4Line size={16} className="cv-spin" /> : <RiDownloadLine size={16} />}
              Download PDF
            </button>
            <button type="button" className="cv-preview-close" onClick={onClose} aria-label="Close preview">
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>
        <div className="cv-a4-frame">
          <CvDocumentSheet resolved={resolved} className="is-public" />
        </div>
      </div>
    </div>
  );
}

type PublicCard =
  | { mode: "library"; doc: CvDocument; resolved: CvResolvedDocument; isDefault: boolean }
  | { mode: "legacy"; template: CvTemplateId; resolved: CvResolvedDocument; isDefault: boolean; label: string; description: string; tags: string[]; viewLabel: string; headline: string };

export default function CvPageClient({ settings }: { settings: SiteSettings }) {
  const searchParams = useSearchParams();
  const config = getCvConfig(settings);
  const library = useMemo(() => getCvLibrary(settings), [settings]);
  const libraryPublic = useMemo(() => publicCvDocuments(library), [library]);
  const useLibrary = libraryPublic.length > 0;
  const access = library.access || config.access;

  const cards: PublicCard[] = useMemo(() => {
    if (useLibrary) {
      const preferred = defaultPublicCvDocument(library);
      return libraryPublic.map((doc) => ({
        mode: "library" as const,
        doc,
        resolved: resolveLibraryDocument(doc),
        isDefault: preferred?.id === doc.id,
      }));
    }
    return CV_TEMPLATE_OPTIONS.filter(
      (opt) => opt.id === config.defaultTemplate || config.formats[opt.id].isPublic,
    ).map((opt) => ({
      mode: "legacy" as const,
      template: opt.id,
      resolved: resolveCvDocument(settings, opt.id),
      isDefault: opt.id === config.defaultTemplate,
      label: opt.label,
      description: opt.description,
      tags: opt.tags,
      viewLabel: opt.viewLabel,
      headline: config.formats[opt.id].headline,
    }));
  }, [useLibrary, library, libraryPublic, config, settings]);

  const [activeKey, setActiveKey] = useState(() =>
    cards[0]?.mode === "library" ? cards[0].doc.id : cards[0]?.mode === "legacy" ? cards[0].template : "",
  );
  const [viewing, setViewing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pending, setPending] = useState<{ key: string; action: CvAccessAction } | null>(null);
  const [toast, setToast] = useState("");
  const pendingRef = useRef<{ key: string; action: CvAccessAction } | null>(null);

  const source: CvAccessSource = useMemo(() => {
    const raw = searchParams.get("source");
    if (raw) return parseCvAccessSource(raw);
    if (typeof document !== "undefined" && !document.referrer) return "direct";
    return "cv_page";
  }, [searchParams]);

  useEffect(() => {
    setUnlocked(readCvUnlockedFromDocument());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  const activeCard = cards.find((card) =>
    card.mode === "library" ? card.doc.id === activeKey : card.template === activeKey,
  ) || cards[0];

  const stackDocs = useMemo(() => {
    const list = cards.map((card) => card.resolved).slice(0, 3);
    return list.length ? list : [resolveCvDocument(settings, config.defaultTemplate)];
  }, [cards, settings, config.defaultTemplate]);

  const frontDoc = stackDocs[0];

  const runDownload = async (card: PublicCard) => {
    setError("");
    setDownloading(true);
    const key = card.mode === "library" ? card.doc.id : card.template;
    setActiveKey(key);
    try {
      const url =
        card.mode === "library"
          ? `/api/cv/pdf?doc=${encodeURIComponent(card.doc.id)}&download=1`
          : `/api/cv/pdf?template=${card.template}&download=1`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Download failed.");
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download =
        card.mode === "library" ? cvDocumentFilename(card.doc) : cvPdfFilename(card.template);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setDownloading(false);
    }
  };

  const runView = (card: PublicCard) => {
    setActiveKey(card.mode === "library" ? card.doc.id : card.template);
    setViewing(true);
  };

  const requestAccess = (card: PublicCard, action: CvAccessAction) => {
    const key = card.mode === "library" ? card.doc.id : card.template;
    setActiveKey(key);
    if (!isCvActionGated(access, action) || unlocked) {
      if (action === "view") runView(card);
      else void runDownload(card);
      return;
    }
    const next = { key, action };
    pendingRef.current = next;
    setPending(next);
    setGateOpen(true);
  };

  const handleUnlocked = ({ skipped }: { skipped: boolean }) => {
    const next = pendingRef.current || pending;
    setGateOpen(false);
    setUnlocked(true);
    setPending(null);
    pendingRef.current = null;
    if (!next) return;
    const card = cards.find((row) =>
      row.mode === "library" ? row.doc.id === next.key : row.template === next.key,
    );
    if (!card) return;
    if (!skipped) {
      const label =
        card.mode === "library"
          ? card.doc.targetRole || card.doc.name
          : cvAccessFormatLabel(card.template, card.label);
      setToast(`You're in. ${label} unlocked.`);
    }
    if (next.action === "view") runView(card);
    else void runDownload(card);
  };

  return (
    <div className="cv-landing">
      <section className="cv-hero">
        <div className="container cv-hero-grid">
          <div className="cv-hero-copy">
            <p className="cv-landing-kicker">— CV / Resume</p>
            <h1>
              My professional profile
              <span className="cv-hero-break"> in one place.</span>
            </h1>
            <p className="cv-landing-lead">
              Download a professionally designed CV tailored to different contexts.
              <span className="cv-hero-break">
                {" "}All content is based on verified portfolio, experience and education data.
              </span>
            </p>
            <p className="cv-hero-script" aria-hidden="true">
              Ideas to impact
            </p>
            {error ? (
              <p className="cv-page-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className="cv-hero-stage" aria-hidden="true">
            <div className="cv-doc-stack">
              <div className="cv-doc-glow" />
              {stackDocs[2] ? (
                <MiniDoc doc={stackDocs[2]} layer="back" />
              ) : stackDocs.length === 1 ? (
                <MiniDoc doc={frontDoc} layer="back" />
              ) : null}
              {stackDocs[1] ? (
                <MiniDoc doc={stackDocs[1]} layer="mid" />
              ) : stackDocs.length === 1 ? (
                <MiniDoc doc={frontDoc} layer="mid" />
              ) : null}
              <MiniDoc doc={frontDoc} layer="front" />
            </div>
          </div>

          <aside className="cv-hero-aside">
            <div className="cv-hero-pillars">
              <span>Build</span>
              <span>Solve</span>
              <span>Collaborate</span>
              <span className="is-accent">Impact</span>
            </div>
            <p>A professional summary of my journey, skills and experience.</p>
          </aside>
        </div>
      </section>

      <section className="cv-formats-section">
        <div className="container">
          <div className="cv-format-cards">
            {cards.map((card) => {
              const key = card.mode === "library" ? card.doc.id : card.template;
              const title =
                card.mode === "library"
                  ? card.doc.targetRole || card.doc.name
                  : card.label;
              const description =
                card.mode === "library"
                  ? `${cvLayoutLabel(card.doc.layoutId)} · ${card.doc.pageSize.toUpperCase()}`
                  : card.description;
              const headline =
                card.mode === "library" ? card.resolved.headline : card.headline;
              const tags =
                card.mode === "library"
                  ? [cvLayoutLabel(card.doc.layoutId), card.doc.pageSize.toUpperCase()]
                  : card.tags;
              const viewLabel = card.mode === "library" ? "Preview" : card.viewLabel;
              return (
                <article
                  key={key}
                  className={card.isDefault ? "cv-format-card is-recommended" : "cv-format-card"}
                >
                  {card.isDefault ? <span className="cv-format-badge">Recommended</span> : null}
                  <div className="cv-format-icon" aria-hidden="true">
                    <RiFileTextLine size={22} />
                  </div>
                  <h2>{title}</h2>
                  <p className="cv-format-desc">{description}</p>
                  <p className="cv-format-headline">{headline}</p>
                  <div className="cv-format-tags">
                    {tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <div className="cv-format-card-actions">
                    <button
                      type="button"
                      className={card.isDefault ? "btn btn-primary" : "btn btn-outline"}
                      onClick={() => requestAccess(card, "view")}
                    >
                      <RiEyeLine size={16} /> {viewLabel}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      disabled={downloading}
                      onClick={() => requestAccess(card, "download")}
                    >
                      {downloading && activeKey === key ? (
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
        </div>
      </section>

      <section className="cv-trust-bar" aria-label="CV qualities">
        <div className="container cv-trust-grid">
          <div className="cv-trust-item">
            <span className="cv-trust-icon" aria-hidden="true">
              <RiShieldCheckLine size={20} />
            </span>
            <div>
              <strong>Verified information</strong>
              <p>Based on portfolio and experience data</p>
            </div>
          </div>
          <div className="cv-trust-item">
            <span className="cv-trust-icon" aria-hidden="true">
              <RiFileTextLine size={20} />
            </span>
            <div>
              <strong>Professionally designed</strong>
              <p>Clean, modern and print-ready</p>
            </div>
          </div>
          <div className="cv-trust-item">
            <span className="cv-trust-icon" aria-hidden="true">
              <RiSmartphoneLine size={20} />
            </span>
            <div>
              <strong>Always up to date</strong>
              <p>Managed from the control center</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cv-contact-cta">
        <div className="container">
          <div className="cv-contact-card">
            <div className="cv-contact-copy">
              <span className="cv-contact-icon" aria-hidden="true">
                <RiMailLine size={22} />
              </span>
              <div>
                <strong>Prefer a conversation instead?</strong>
                <p>I&apos;m open to new opportunities, collaborations and interesting ideas.</p>
              </div>
            </div>
            <Link href="/contact" className="btn btn-primary cv-contact-btn">
              Contact me →
            </Link>
          </div>
        </div>
      </section>

      {viewing && activeCard ? (
        <FullPreview
          resolved={activeCard.resolved}
          label={
            activeCard.mode === "library"
              ? activeCard.doc.targetRole || activeCard.doc.name
              : activeCard.label
          }
          onClose={() => setViewing(false)}
          onDownload={() => requestAccess(activeCard, "download")}
          downloading={downloading}
        />
      ) : null}

      {pending ? (
        <CvAccessDialog
          open={gateOpen}
          access={access}
          template={(() => {
            const card = cards.find((row) =>
              row.mode === "library" ? row.doc.id === pending.key : row.template === pending.key,
            );
            if (!card) return config.defaultTemplate;
            return card.mode === "legacy" ? card.template : card.resolved.template;
          })()}
          formatLabel={(() => {
            const card = cards.find((row) =>
              row.mode === "library" ? row.doc.id === pending.key : row.template === pending.key,
            );
            if (!card) return "CV";
            return card.mode === "library" ? card.doc.targetRole || card.doc.name : card.label;
          })()}
          action={pending.action}
          source={source}
          onClose={() => {
            setGateOpen(false);
            setPending(null);
          }}
          onUnlocked={handleUnlocked}
        />
      ) : null}

      {toast ? (
        <div className="cv-access-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
