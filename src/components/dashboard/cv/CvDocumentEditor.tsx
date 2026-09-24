"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowLeftLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiSaveLine,
} from "react-icons/ri";
import CvDocumentPreview, { type CvPreviewZoom } from "@/components/dashboard/cv/CvDocumentPreview";
import CvFieldEditor from "@/components/dashboard/cv/CvFieldEditor";
import CvImportPicker from "@/components/dashboard/cv/CvImportPicker";
import CvSectionList from "@/components/dashboard/cv/CvSectionList";
import { type CvEditorSelection } from "@/components/dashboard/cv/selection";
import {
  applyProfileToDocument,
  applySuggestion,
  createItem,
  createSection,
  cvOverflowWarning,
  cvProfileSnapshot,
  getCvLibrary,
  importKindForSection,
  newBullet,
  refreshItemSuggestions,
  sectionKindContent,
  setFieldValue,
  supportsItemsPerRow,
  upsertCvDocument,
  CV_LAYOUT_OPTIONS,
  type CvDensity,
  type CvDocument,
  type CvField,
  type CvImportKind,
  type CvItem,
  type CvLayoutId,
  type CvPageSize,
  type CvSection,
  type CvSectionKind,
  type CvTargetPages,
} from "@/lib/cv-library";
import { saveLocalSettings, type SiteSettings } from "@/lib/supabase";

type MobileTab = "structure" | "edit" | "preview";

function stamp(doc: CvDocument): CvDocument {
  return { ...doc, updatedAt: new Date().toISOString() };
}

function patchSection(doc: CvDocument, sectionId: string, updater: (section: CvSection) => CvSection): CvDocument {
  return stamp({
    ...doc,
    sections: doc.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
  });
}

function patchItem(
  doc: CvDocument,
  sectionId: string,
  itemId: string,
  updater: (item: CvItem) => CvItem,
): CvDocument {
  return patchSection(doc, sectionId, (section) => ({
    ...section,
    items: section.items.map((item) => (item.id === itemId ? updater(item) : item)),
  }));
}

export default function CvDocumentEditor({
  documentId,
  initialSettings,
  initialTab,
}: {
  documentId: string;
  initialSettings: SiteSettings;
  initialTab?: MobileTab;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const library = useMemo(() => getCvLibrary(settings), [settings]);
  const stored = library.documents.find((row) => row.id === documentId) || null;

  const [doc, setDoc] = useState<CvDocument | null>(stored);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [selection, setSelection] = useState<CvEditorSelection>({ kind: "document" });
  const [zoom, setZoom] = useState<CvPreviewZoom>("fit");
  const [mobileTab, setMobileTab] = useState<MobileTab>(initialTab || "edit");
  const [importOpen, setImportOpen] = useState(false);
  const [importKind, setImportKind] = useState<CvImportKind>("experience");
  const [importSectionId, setImportSectionId] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const latestDoc = useRef(doc);

  useEffect(() => {
    latestDoc.current = doc;
  }, [doc]);

  useEffect(() => {
    if (!stored) return;
    if (!dirty) setDoc(stored);
  }, [stored, dirty]);

  const snapshot = useMemo(() => cvProfileSnapshot(settings), [settings]);
  const overflow = doc ? cvOverflowWarning(doc) : null;

  const updateDoc = useCallback((next: CvDocument) => {
    setDoc(stamp(next));
    setDirty(true);
    setStatus("Unsaved changes");
  }, []);

  const persist = useCallback(
    async (nextDoc: CvDocument) => {
      setSaving(true);
      try {
        const nextLibrary = upsertCvDocument(getCvLibrary(settings), nextDoc);
        const saved = await saveLocalSettings({ cvLibrary: nextLibrary });
        setSettings(saved);
        setDoc(nextDoc);
        setDirty(false);
        setStatus("Saved");
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Save failed");
      } finally {
        setSaving(false);
      }
    },
    [settings],
  );

  useEffect(() => {
    if (!dirty || !doc) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void persist(doc);
    }, 900);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [dirty, doc, persist]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  if (!doc) {
    return (
      <div className="cv-editor-missing">
        <p>This CV document was not found.</p>
        <Link href="/dashboard/cv" className="btn btn-outline btn-sm">
          Back to My CVs
        </Link>
      </div>
    );
  }

  const selectedSection =
    selection.kind === "section" ? doc.sections.find((section) => section.id === selection.sectionId) || null : null;
  const selectedItem =
    selectedSection && selection.kind === "section" && selection.itemId
      ? selectedSection.items.find((item) => item.id === selection.itemId) || null
      : null;

  const setHeaderField = (key: keyof CvDocument, field: CvField) => {
    updateDoc({ ...doc, [key]: field } as CvDocument);
  };

  const openImport = (section: CvSection) => {
    setImportSectionId(section.id);
    setImportKind(importKindForSection(section.kind));
    setImportOpen(true);
  };

  const rightPane = (() => {
    if (selection.kind === "document") {
      return (
        <div className="cv-editor-pane-body">
          <h2>Document setup</h2>
          <label className="cv-editor-field">
            <span className="cv-editor-field-label">Internal name</span>
            <input
              className="cv-editor-input"
              value={doc.name}
              onChange={(event) => updateDoc({ ...doc, name: event.target.value })}
            />
          </label>
          <label className="cv-editor-field">
            <span className="cv-editor-field-label">Target role (optional)</span>
            <input
              className="cv-editor-input"
              value={doc.targetRole || ""}
              placeholder="e.g. Software Engineer"
              onChange={(event) => updateDoc({ ...doc, targetRole: event.target.value })}
            />
            <p className="cv-editor-hint">Organizational aid only — does not rewrite identity.</p>
          </label>

          <label className="cv-editor-field">
            <span className="cv-editor-field-label">Layout</span>
            <select
              className="cv-editor-input"
              value={doc.layoutId}
              onChange={(event) => updateDoc({ ...doc, layoutId: event.target.value as CvLayoutId })}
            >
              {CV_LAYOUT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </select>
          </label>

          <div className="cv-editor-grid-2">
            <label className="cv-editor-field">
              <span className="cv-editor-field-label">Page size</span>
              <select
                className="cv-editor-input"
                value={doc.pageSize}
                onChange={(event) => updateDoc({ ...doc, pageSize: event.target.value as CvPageSize })}
              >
                <option value="a4">A4</option>
                <option value="letter">US Letter</option>
              </select>
            </label>
            <label className="cv-editor-field">
              <span className="cv-editor-field-label">Target length</span>
              <select
                className="cv-editor-input"
                value={String(doc.targetPages ?? "none")}
                onChange={(event) => {
                  const raw = event.target.value;
                  const targetPages: CvTargetPages =
                    raw === "1" ? 1 : raw === "2" ? 2 : "none";
                  updateDoc({ ...doc, targetPages });
                }}
              >
                <option value="1">1 page</option>
                <option value="2">2 pages</option>
                <option value="none">No target</option>
              </select>
            </label>
          </div>

          <div className="cv-editor-grid-2">
            <label className="cv-editor-field">
              <span className="cv-editor-field-label">Density</span>
              <select
                className="cv-editor-input"
                value={doc.density}
                onChange={(event) => updateDoc({ ...doc, density: event.target.value as CvDensity })}
              >
                <option value="compact">Compact</option>
                <option value="standard">Standard</option>
                <option value="spacious">Spacious</option>
              </select>
            </label>
            <label className="cv-editor-field">
              <span className="cv-editor-field-label">Status</span>
              <select
                className="cv-editor-input"
                value={doc.status}
                onChange={(event) =>
                  updateDoc({
                    ...doc,
                    status: event.target.value as CvDocument["status"],
                  })
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
          </div>

          <label className="cv-editor-field">
            <span className="cv-editor-field-label">Visibility</span>
            <select
              className="cv-editor-input"
              value={doc.visibility}
              onChange={(event) =>
                updateDoc({
                  ...doc,
                  visibility: event.target.value as CvDocument["visibility"],
                })
              }
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </label>

          <label className="cv-editor-check">
            <input
              type="checkbox"
              checked={Boolean(doc.atsSafe)}
              onChange={(event) => updateDoc({ ...doc, atsSafe: event.target.checked })}
            />
            <span>ATS-safe mode (reduces decorative chrome; text stays selectable)</span>
          </label>

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              if (doc.displayName.isCustomized || doc.headline.isCustomized) {
                if (!window.confirm("Replace uncustomized header fields with the current profile snapshot?")) return;
              }
              updateDoc(applyProfileToDocument(doc, settings));
            }}
          >
            Suggest header from profile
          </button>
        </div>
      );
    }

    if (selection.kind === "header") {
      return (
        <div className="cv-editor-pane-body">
          <h2>Identity &amp; contact</h2>
          <CvFieldEditor
            label="Display name"
            field={doc.displayName}
            onChange={(field) => setHeaderField("displayName", field)}
            suggestion={snapshot.displayName}
            onSuggest={() => setHeaderField("displayName", applySuggestion(doc.displayName, snapshot.displayName))}
          />
          <CvFieldEditor
            label="Professional headline"
            field={doc.headline}
            onChange={(field) => setHeaderField("headline", field)}
            suggestion={snapshot.headline}
            onSuggest={() => setHeaderField("headline", applySuggestion(doc.headline, snapshot.headline))}
          />
          <CvFieldEditor
            label="Email"
            field={doc.email}
            onChange={(field) => setHeaderField("email", field)}
            suggestion={snapshot.email}
            onSuggest={() => setHeaderField("email", applySuggestion(doc.email, snapshot.email))}
          />
          <CvFieldEditor
            label="Secondary email"
            field={doc.emailSecondary}
            onChange={(field) => setHeaderField("emailSecondary", field)}
            suggestion={snapshot.emailSecondary}
            onSuggest={() =>
              setHeaderField("emailSecondary", applySuggestion(doc.emailSecondary, snapshot.emailSecondary))
            }
          />
          <CvFieldEditor
            label="Phone"
            field={doc.phone}
            onChange={(field) => setHeaderField("phone", field)}
            suggestion={snapshot.phone}
            onSuggest={() => setHeaderField("phone", applySuggestion(doc.phone, snapshot.phone))}
          />
          <CvFieldEditor
            label="Location"
            field={doc.location}
            onChange={(field) => setHeaderField("location", field)}
            suggestion={snapshot.location}
            onSuggest={() => setHeaderField("location", applySuggestion(doc.location, snapshot.location))}
          />
          <CvFieldEditor
            label="Website"
            field={doc.website}
            onChange={(field) => setHeaderField("website", field)}
            suggestion={snapshot.website}
            onSuggest={() => setHeaderField("website", applySuggestion(doc.website, snapshot.website))}
          />
          <CvFieldEditor
            label="LinkedIn"
            field={doc.linkedin}
            onChange={(field) => setHeaderField("linkedin", field)}
            suggestion={snapshot.linkedin}
            onSuggest={() => setHeaderField("linkedin", applySuggestion(doc.linkedin, snapshot.linkedin))}
          />
          <CvFieldEditor
            label="GitHub"
            field={doc.github}
            onChange={(field) => setHeaderField("github", field)}
            suggestion={snapshot.github}
            onSuggest={() => setHeaderField("github", applySuggestion(doc.github, snapshot.github))}
          />
          <label className="cv-editor-check">
            <input
              type="checkbox"
              checked={Boolean(doc.showPhoto)}
              onChange={(event) => updateDoc({ ...doc, showPhoto: event.target.checked })}
            />
            <span>Show photo</span>
          </label>
          {doc.showPhoto ? (
            <label className="cv-editor-field">
              <span className="cv-editor-field-label">Photo URL</span>
              <input
                className="cv-editor-input"
                value={doc.photoUrl || ""}
                onChange={(event) => updateDoc({ ...doc, photoUrl: event.target.value })}
              />
            </label>
          ) : null}
        </div>
      );
    }

    if (!selectedSection) {
      return (
        <div className="cv-editor-pane-body">
          <p className="cv-editor-empty">Select a section to edit.</p>
        </div>
      );
    }

    const content = sectionKindContent(selectedSection.kind);

    if (selectedItem) {
      return (
        <div className="cv-editor-pane-body">
          <button
            type="button"
            className="cv-editor-back-link"
            onClick={() => setSelection({ kind: "section", sectionId: selectedSection.id })}
          >
            ← Back to section
          </button>
          <h2>{selectedItem.title.value || "Item"}</h2>
          <CvFieldEditor
            label="Title"
            field={selectedItem.title}
            onChange={(field) =>
              updateDoc(patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({ ...item, title: field })))
            }
          />
          <CvFieldEditor
            label="Organization"
            field={selectedItem.organization}
            onChange={(field) =>
              updateDoc(
                patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({ ...item, organization: field })),
              )
            }
          />
          <CvFieldEditor
            label="Period"
            field={selectedItem.period}
            onChange={(field) =>
              updateDoc(patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({ ...item, period: field })))
            }
          />
          <CvFieldEditor
            label="Location"
            field={selectedItem.location}
            onChange={(field) =>
              updateDoc(patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({ ...item, location: field })))
            }
          />
          <CvFieldEditor
            label="Summary"
            field={selectedItem.summary}
            multiline
            rows={4}
            onChange={(field) =>
              updateDoc(patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({ ...item, summary: field })))
            }
          />
          <CvFieldEditor
            label="Technologies"
            field={selectedItem.technologies}
            hint="Comma-separated"
            onChange={(field) =>
              updateDoc(
                patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({ ...item, technologies: field })),
              )
            }
          />

          <div className="cv-editor-bullets">
            <div className="cv-editor-field-head">
              <span className="cv-editor-field-label">Bullets</span>
              <button
                type="button"
                className="cv-editor-mini-btn"
                onClick={() =>
                  updateDoc(
                    patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({
                      ...item,
                      bullets: [...(item.bullets || []), newBullet("")],
                    })),
                  )
                }
              >
                <RiAddLine size={13} /> Add bullet
              </button>
            </div>
            {(selectedItem.bullets || []).map((bullet, index) => (
              <div key={bullet.id} className="cv-editor-bullet-row">
                <CvFieldEditor
                  label={`Bullet ${index + 1}`}
                  field={bullet.text}
                  multiline
                  rows={2}
                  onChange={(field) =>
                    updateDoc(
                      patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({
                        ...item,
                        bullets: (item.bullets || []).map((row) =>
                          row.id === bullet.id ? { ...row, text: field } : row,
                        ),
                      })),
                    )
                  }
                />
                <div className="cv-editor-bullet-tools">
                  <button
                    type="button"
                    aria-label="Move bullet up"
                    disabled={index === 0}
                    onClick={() =>
                      updateDoc(
                        patchItem(doc, selectedSection.id, selectedItem.id, (item) => {
                          const bullets = [...(item.bullets || [])];
                          if (index <= 0) return item;
                          [bullets[index - 1], bullets[index]] = [bullets[index], bullets[index - 1]];
                          return { ...item, bullets };
                        }),
                      )
                    }
                  >
                    <RiArrowUpSLine size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Move bullet down"
                    disabled={index >= (selectedItem.bullets || []).length - 1}
                    onClick={() =>
                      updateDoc(
                        patchItem(doc, selectedSection.id, selectedItem.id, (item) => {
                          const bullets = [...(item.bullets || [])];
                          if (index >= bullets.length - 1) return item;
                          [bullets[index], bullets[index + 1]] = [bullets[index + 1], bullets[index]];
                          return { ...item, bullets };
                        }),
                      )
                    }
                  >
                    <RiArrowDownSLine size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete bullet"
                    onClick={() =>
                      updateDoc(
                        patchItem(doc, selectedSection.id, selectedItem.id, (item) => ({
                          ...item,
                          bullets: (item.bullets || []).filter((row) => row.id !== bullet.id),
                        })),
                      )
                    }
                  >
                    <RiDeleteBinLine size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedItem.sourceId ? (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                const refreshed = refreshItemSuggestions(selectedItem, settings);
                updateDoc(patchItem(doc, selectedSection.id, selectedItem.id, () => refreshed));
              }}
            >
              Refresh suggestions from portfolio
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div className="cv-editor-pane-body">
        <h2>{selectedSection.title || "Section"}</h2>
        <label className="cv-editor-field">
          <span className="cv-editor-field-label">Section heading</span>
          <input
            className="cv-editor-input"
            value={selectedSection.title}
            onChange={(event) =>
              updateDoc(
                patchSection(doc, selectedSection.id, (section) => ({ ...section, title: event.target.value })),
              )
            }
          />
        </label>

        {supportsItemsPerRow(selectedSection.kind) ? (
          <label className="cv-editor-field">
            <span className="cv-editor-field-label">Items per row</span>
            <select
              className="cv-editor-input"
              value={selectedSection.layout.itemsPerRow}
              onChange={(event) =>
                updateDoc(
                  patchSection(doc, selectedSection.id, (section) => ({
                    ...section,
                    layout: {
                      ...section.layout,
                      itemsPerRow: Number(event.target.value) as 1 | 2 | 3,
                    },
                  })),
                )
              }
            >
              <option value={1}>1 — full width</option>
              <option value={2}>2 — fifty / fifty</option>
              <option value={3}>3 — compact</option>
            </select>
          </label>
        ) : null}

        <div className="cv-editor-grid-2">
          <label className="cv-editor-check">
            <input
              type="checkbox"
              checked={selectedSection.layout.showDates !== false}
              onChange={(event) =>
                updateDoc(
                  patchSection(doc, selectedSection.id, (section) => ({
                    ...section,
                    layout: { ...section.layout, showDates: event.target.checked },
                  })),
                )
              }
            />
            <span>Show dates</span>
          </label>
          <label className="cv-editor-check">
            <input
              type="checkbox"
              checked={selectedSection.layout.showDescriptions !== false}
              onChange={(event) =>
                updateDoc(
                  patchSection(doc, selectedSection.id, (section) => ({
                    ...section,
                    layout: { ...section.layout, showDescriptions: event.target.checked },
                  })),
                )
              }
            />
            <span>Show descriptions</span>
          </label>
        </div>

        {content !== "items" ? (
          <CvFieldEditor
            label="Section text"
            field={selectedSection.body}
            multiline
            rows={6}
            suggestion={selectedSection.kind === "summary" ? snapshot.summary : undefined}
            onSuggest={
              selectedSection.kind === "summary"
                ? () =>
                    updateDoc(
                      patchSection(doc, selectedSection.id, (section) => ({
                        ...section,
                        body: applySuggestion(section.body, snapshot.summary),
                      })),
                    )
                : undefined
            }
            onChange={(field) =>
              updateDoc(patchSection(doc, selectedSection.id, (section) => ({ ...section, body: field })))
            }
          />
        ) : null}

        {content !== "body" ? (
          <>
            <div className="cv-editor-field-head" style={{ marginTop: "0.75rem" }}>
              <span className="cv-editor-field-label">Items</span>
              <span className="cv-editor-field-tools">
                <button type="button" className="cv-editor-mini-btn" onClick={() => openImport(selectedSection)}>
                  Import…
                </button>
                <button
                  type="button"
                  className="cv-editor-mini-btn"
                  onClick={() => {
                    const item = createItem({ title: setFieldValue(undefined, "") });
                    updateDoc(
                      patchSection(doc, selectedSection.id, (section) => ({
                        ...section,
                        items: [...section.items, item],
                      })),
                    );
                    setSelection({ kind: "section", sectionId: selectedSection.id, itemId: item.id });
                  }}
                >
                  <RiAddLine size={13} /> Add item
                </button>
              </span>
            </div>
            <ul className="cv-editor-item-list">
              {selectedSection.items.map((item, index) => (
                <li key={item.id} className={item.hidden ? "is-hidden" : undefined}>
                  <button
                    type="button"
                    className="cv-editor-item-main"
                    onClick={() =>
                      setSelection({ kind: "section", sectionId: selectedSection.id, itemId: item.id })
                    }
                  >
                    <strong>{item.title.value || "Untitled"}</strong>
                    {item.organization?.value ? <em>{item.organization.value}</em> : null}
                  </button>
                  <div className="cv-editor-item-tools">
                    <button
                      type="button"
                      aria-label="Move item up"
                      disabled={index === 0}
                      onClick={() =>
                        updateDoc(
                          patchSection(doc, selectedSection.id, (section) => {
                            const items = [...section.items];
                            if (index <= 0) return section;
                            [items[index - 1], items[index]] = [items[index], items[index - 1]];
                            return { ...section, items };
                          }),
                        )
                      }
                    >
                      <RiArrowUpSLine size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label="Move item down"
                      disabled={index >= selectedSection.items.length - 1}
                      onClick={() =>
                        updateDoc(
                          patchSection(doc, selectedSection.id, (section) => {
                            const items = [...section.items];
                            if (index >= items.length - 1) return section;
                            [items[index], items[index + 1]] = [items[index + 1], items[index]];
                            return { ...section, items };
                          }),
                        )
                      }
                    >
                      <RiArrowDownSLine size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={item.hidden ? "Show item" : "Hide item"}
                      onClick={() =>
                        updateDoc(
                          patchItem(doc, selectedSection.id, item.id, (row) => ({
                            ...row,
                            hidden: !row.hidden,
                          })),
                        )
                      }
                    >
                      {item.hidden ? <RiEyeOffLine size={14} /> : <RiEyeLine size={14} />}
                    </button>
                    <button
                      type="button"
                      aria-label="Delete item"
                      onClick={() => {
                        if (!window.confirm("Remove this item from the CV only?")) return;
                        updateDoc(
                          patchSection(doc, selectedSection.id, (section) => ({
                            ...section,
                            items: section.items.filter((row) => row.id !== item.id),
                          })),
                        );
                      }}
                    >
                      <RiDeleteBinLine size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    );
  })();

  return (
    <div className="cv-editor">
      <header className="cv-editor-bar">
        <div className="cv-editor-bar-left">
          <Link href="/dashboard/cv" className="cv-editor-back">
            <RiArrowLeftLine size={16} /> My CVs
          </Link>
          <div>
            <h1>{doc.name}</h1>
            <p className="cv-editor-status" data-dirty={dirty ? "1" : "0"}>
              {saving ? (
                <>
                  <RiLoader4Line size={13} className="cv-spin" /> Saving…
                </>
              ) : (
                status
              )}
            </p>
          </div>
        </div>
        <div className="cv-editor-bar-right">
          <div className="cv-editor-zoom" role="group" aria-label="Preview zoom">
            {(["fit", 75, 100, 125] as const).map((value) => (
              <button
                key={String(value)}
                type="button"
                className={zoom === value ? "is-active" : undefined}
                onClick={() => setZoom(value)}
              >
                {value === "fit" ? "Fit" : `${value}%`}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            disabled={saving || !dirty}
            onClick={() => void persist(doc)}
          >
            <RiSaveLine size={14} /> Save
          </button>
          <a
            className="btn btn-outline btn-sm"
            href={`/api/cv/pdf?doc=${encodeURIComponent(doc.id)}&download=1`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <RiDownloadLine size={14} /> PDF
          </a>
        </div>
      </header>

      {overflow ? (
        <p className="cv-editor-overflow" role="status">
          {overflow}
        </p>
      ) : null}

      <div className="cv-editor-mobile-tabs" role="tablist" aria-label="Editor views">
        {(
          [
            ["structure", "Structure"],
            ["edit", "Edit"],
            ["preview", "Preview"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mobileTab === id}
            className={mobileTab === id ? "is-active" : undefined}
            onClick={() => setMobileTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`cv-editor-shell is-${mobileTab}`}>
        <aside className="cv-editor-left">
          <CvSectionList
            doc={doc}
            selection={selection}
            onSelect={(next) => {
              setSelection(next);
              setMobileTab("edit");
            }}
            onAddSection={(kind: CvSectionKind) => {
              const section = createSection(kind);
              updateDoc({ ...doc, sections: [...doc.sections, section] });
              setSelection({ kind: "section", sectionId: section.id });
              setMobileTab("edit");
            }}
            onMoveSection={(sectionId, direction) => {
              const index = doc.sections.findIndex((section) => section.id === sectionId);
              if (index < 0) return;
              const nextIndex = index + direction;
              if (nextIndex < 0 || nextIndex >= doc.sections.length) return;
              const sections = [...doc.sections];
              [sections[index], sections[nextIndex]] = [sections[nextIndex], sections[index]];
              updateDoc({ ...doc, sections });
            }}
            onToggleSectionHidden={(sectionId) =>
              updateDoc(
                patchSection(doc, sectionId, (section) => ({ ...section, hidden: !section.hidden })),
              )
            }
            onDeleteSection={(sectionId) => {
              updateDoc({ ...doc, sections: doc.sections.filter((section) => section.id !== sectionId) });
              setSelection({ kind: "document" });
            }}
          />
        </aside>

        <main className="cv-editor-center" aria-label="CV preview">
          <CvDocumentPreview doc={doc} zoom={zoom} />
        </main>

        <aside className="cv-editor-right">{rightPane}</aside>
      </div>

      <CvImportPicker
        open={importOpen}
        settings={settings}
        initialKind={importKind}
        onClose={() => setImportOpen(false)}
        onImport={(items) => {
          if (!importSectionId) return;
          updateDoc(
            patchSection(doc, importSectionId, (section) => ({
              ...section,
              items: [...section.items, ...items],
            })),
          );
          if (items[0]) {
            setSelection({ kind: "section", sectionId: importSectionId, itemId: items[0].id });
            setMobileTab("edit");
          }
        }}
      />
    </div>
  );
}
