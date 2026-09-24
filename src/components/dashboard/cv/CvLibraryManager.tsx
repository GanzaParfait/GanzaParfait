"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEditLine,
  RiEyeLine,
  RiFileCopyLine,
  RiFileCopy2Line,
  RiMore2Line,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import {
  createBlankCvDocument,
  createCvFromProfile,
  cvLayoutLabel,
  cvOverflowWarning,
  defaultPublicCvDocument,
  duplicateCvDocument,
  estimateCvPages,
  getCvLibrary,
  hasStoredCvLibrary,
  removeCvDocument,
  upsertCvDocument,
  type CvDocument,
  type CvLibrary,
} from "@/lib/cv-library";
import { saveLocalSettings, type SiteSettings } from "@/lib/supabase";

function formatUpdated(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function CvLibraryManager({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const library = useMemo(() => getCvLibrary(settings), [settings]);
  const defaultDoc = defaultPublicCvDocument(library);

  // Persist one-time migration from legacy cvConfig so document ids stay stable.
  useEffect(() => {
    if (hasStoredCvLibrary(settings)) return;
    const migrated = getCvLibrary(settings);
    if (!migrated.documents.length) return;
    void saveLocalSettings({ cvLibrary: migrated }).then((saved) => {
      setSettings(saved);
      setMessage("Migrated existing CV formats into the document library");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = async (nextLibrary: CvLibrary, note?: string) => {
    setBusy(true);
    setMessage("");
    try {
      const saved = await saveLocalSettings({ cvLibrary: nextLibrary });
      setSettings(saved);
      setMessage(note || "Saved");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save");
    } finally {
      setBusy(false);
      setMenuId(null);
    }
  };

  const createBlank = async () => {
    const doc = createBlankCvDocument({
      name: "Blank CV",
      displayName: { value: settings.siteTitle || "Prince Parfait GANZA", sourceType: "profile" },
    });
    await persist(upsertCvDocument(library, doc), "Blank CV created");
    window.location.href = `/dashboard/cv/${doc.id}`;
  };

  const createFromProfile = async () => {
    const doc = createCvFromProfile(settings, { name: "CV from profile" });
    await persist(upsertCvDocument(library, doc), "CV created from profile");
    window.location.href = `/dashboard/cv/${doc.id}`;
  };

  const duplicate = async (doc: CvDocument) => {
    const copy = duplicateCvDocument(doc);
    await persist(upsertCvDocument(library, copy), "Duplicated");
  };

  const setDefault = async (doc: CvDocument) => {
    const next: CvLibrary = {
      ...library,
      defaultPublicId: doc.id,
      documents: library.documents.map((row) =>
        row.id === doc.id
          ? { ...row, status: "published", visibility: "public", updatedAt: new Date().toISOString() }
          : row
      ),
    };
    await persist(next, "Default public CV updated");
  };

  const remove = async (doc: CvDocument) => {
    if (!window.confirm(`Delete “${doc.name}”? This cannot be undone.`)) return;
    await persist(removeCvDocument(library, doc.id), "Deleted");
  };

  return (
    <div className="cv-lib">
      <header className="cv-lib-head">
        <div>
          <p className="cv-lib-kicker">CV / Resume</p>
          <h1>My CVs</h1>
          <p className="cv-lib-lead">
            Each document is independently editable. Portfolio data is only a suggestion — edits here never rewrite
            career or project records.
          </p>
        </div>
        <div className="cv-lib-head-actions">
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => void createBlank()}>
            <RiAddLine size={16} /> Create blank
          </button>
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void createFromProfile()}>
            <RiFileCopyLine size={16} /> Create from profile
          </button>
        </div>
      </header>

      {message ? (
        <p className="cv-lib-toast" role="status">
          {message}
        </p>
      ) : null}

      {library.documents.length === 0 ? (
        <div className="cv-lib-empty">
          <p>No CV documents yet.</p>
          <p>Start blank, or import a snapshot from your profile and trim it for a specific role.</p>
          <div className="cv-lib-empty-actions">
            <button type="button" className="btn btn-outline" onClick={() => void createBlank()}>
              Create blank
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void createFromProfile()}>
              Create from profile
            </button>
          </div>
        </div>
      ) : (
        <ul className="cv-lib-grid">
          {library.documents.map((doc) => {
            const pages = estimateCvPages(doc);
            const overflow = cvOverflowWarning(doc);
            const isDefault = defaultDoc?.id === doc.id;
            return (
              <li key={doc.id} className={isDefault ? "cv-lib-card is-default" : "cv-lib-card"}>
                <div className="cv-lib-card-top">
                  <div>
                    <h2>{doc.name}</h2>
                    {doc.targetRole ? <p className="cv-lib-target">{doc.targetRole}</p> : null}
                  </div>
                  <div className="cv-lib-card-menu">
                    <button
                      type="button"
                      className="cv-lib-icon-btn"
                      aria-label="More actions"
                      aria-expanded={menuId === doc.id}
                      onClick={() => setMenuId((current) => (current === doc.id ? null : doc.id))}
                    >
                      <RiMore2Line size={18} />
                    </button>
                    {menuId === doc.id ? (
                      <div className="cv-lib-menu" role="menu">
                        <button type="button" role="menuitem" onClick={() => void setDefault(doc)}>
                          {isDefault ? <RiStarFill size={14} /> : <RiStarLine size={14} />}
                          {isDefault ? "Default public" : "Set as default public"}
                        </button>
                        <button type="button" role="menuitem" onClick={() => void duplicate(doc)}>
                          <RiFileCopy2Line size={14} /> Duplicate
                        </button>
                        <button type="button" role="menuitem" className="is-danger" onClick={() => void remove(doc)}>
                          <RiDeleteBinLine size={14} /> Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <dl className="cv-lib-meta">
                  <div>
                    <dt>Layout</dt>
                    <dd>{cvLayoutLabel(doc.layoutId)}</dd>
                  </div>
                  <div>
                    <dt>Pages</dt>
                    <dd>
                      ~{pages.pages} · {doc.pageSize.toUpperCase()}
                    </dd>
                  </div>
                  <div>
                    <dt>Status</dt>
                    <dd>
                      {doc.status}
                      {doc.visibility === "public" ? " · public" : " · private"}
                    </dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{formatUpdated(doc.updatedAt)}</dd>
                  </div>
                </dl>

                {isDefault ? <p className="cv-lib-badge">Default public CV</p> : null}
                {overflow ? <p className="cv-lib-warn">{overflow}</p> : null}

                <div className="cv-lib-card-actions">
                  <Link href={`/dashboard/cv/${doc.id}`} className="btn btn-primary btn-sm">
                    <RiEditLine size={14} /> Edit
                  </Link>
                  <Link href={`/dashboard/cv/${doc.id}?tab=preview`} className="btn btn-outline btn-sm">
                    <RiEyeLine size={14} /> Preview
                  </Link>
                  <a
                    className="btn btn-outline btn-sm"
                    href={`/api/cv/pdf?doc=${encodeURIComponent(doc.id)}&download=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RiDownloadLine size={14} /> Export
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
