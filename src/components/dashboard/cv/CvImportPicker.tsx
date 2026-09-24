"use client";

import { useEffect, useMemo, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import {
  CV_IMPORT_KIND_OPTIONS,
  cvImportCandidates,
  duplicateImportItem,
  type CvImportKind,
  type CvItem,
} from "@/lib/cv-library";
import type { SiteSettings } from "@/lib/supabase";

/**
 * Picks career / project records to import as CV items. Imported values are
 * snapshots: they carry `sourceValue` so the editor can reset or re-suggest.
 */
export default function CvImportPicker({
  open,
  settings,
  initialKind,
  onClose,
  onImport,
}: {
  open: boolean;
  settings: SiteSettings;
  initialKind: CvImportKind;
  onClose: () => void;
  onImport: (items: CvItem[]) => void;
}) {
  const [kind, setKind] = useState<CvImportKind>(initialKind);
  const [picked, setPicked] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setKind(initialKind);
      setPicked([]);
    }
  }, [open, initialKind]);

  const candidates = useMemo(
    () => (open ? cvImportCandidates(settings, kind) : []),
    [open, settings, kind]
  );

  if (!open) return null;

  const toggle = (key: string) =>
    setPicked((prev) => (prev.includes(key) ? prev.filter((row) => row !== key) : [...prev, key]));

  const confirm = () => {
    const items = candidates
      .filter((row) => picked.includes(row.key))
      .map((row) => duplicateImportItem(row.item));
    if (items.length) onImport(items);
    onClose();
  };

  return (
    <div className="cv-lib-modal" role="dialog" aria-modal="true" aria-label="Import from portfolio">
      <div className="cv-lib-modal-panel">
        <div className="cv-lib-modal-bar">
          <div>
            <p className="cv-lib-modal-kicker">Import</p>
            <h2>Add from portfolio</h2>
          </div>
          <button type="button" className="cv-lib-icon-btn" aria-label="Close" onClick={onClose}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="cv-lib-modal-body">
          <div className="cv-editor-tabs dash-hscroll">
            {CV_IMPORT_KIND_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={kind === opt.id ? "is-active" : undefined}
                onClick={() => setKind(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="cv-editor-hint">
            Imported entries are copies. Editing them here never changes portfolio or career records.
          </p>

          {candidates.length === 0 ? (
            <p className="cv-editor-empty">No records available for this group.</p>
          ) : (
            <ul className="cv-lib-pick-list">
              {candidates.map((row) => (
                <li key={row.key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={picked.includes(row.key)}
                      onChange={() => toggle(row.key)}
                    />
                    <span>
                      <strong>{row.label}</strong>
                      {row.meta ? <em>{row.meta}</em> : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cv-lib-modal-foot">
          <span className="cv-editor-hint">{picked.length} selected</span>
          <div className="cv-lib-modal-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!picked.length}
              onClick={confirm}
            >
              Add {picked.length || ""} to section
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
