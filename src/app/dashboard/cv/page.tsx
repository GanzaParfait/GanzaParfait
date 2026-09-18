"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDownloadLine,
  RiEyeLine,
  RiLoader4Line,
  RiSaveLine,
} from "react-icons/ri";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import {
  CV_SECTION_OPTIONS,
  CV_TEMPLATE_OPTIONS,
  cvCatalogItems,
  cvPdfFilename,
  getCvConfig,
  resolveCvDocument,
  type CvConfig,
  type CvFormatConfig,
  type CvSectionId,
  type CvTemplateId,
} from "@/lib/cv";
import {
  DEFAULT_SETTINGS,
  fetchRemoteSettings,
  getLocalSettings,
  saveLocalSettings,
  type SiteSettings,
} from "@/lib/supabase";

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.375rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.8125rem",
  color: "#0f172a",
  outline: "none",
} as const;

const panelStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "0.85rem",
  padding: "1rem 1.1rem",
} as const;

function Preview({ settings, template }: { settings: SiteSettings; template: CvTemplateId }) {
  const doc = useMemo(() => resolveCvDocument(settings, template), [settings, template]);
  return (
    <article className="cv-article is-dash-preview" data-template={doc.template}>
      <header className="cv-article-head">
        <h1>{doc.name}</h1>
        <p className="cv-article-headline">{doc.headline}</p>
        <p className="cv-article-contact">
          {[doc.contact.email, doc.contact.phone, doc.contact.location].filter(Boolean).join(" · ")}
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
                {item.subtitle ? <p className="cv-article-sub">{item.subtitle}</p> : null}
                {item.summary ? <p>{item.summary}</p> : null}
              </div>
            ))}
          </section>
        );
      })}
    </article>
  );
}

export default function DashboardCvPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [template, setTemplate] = useState<CvTemplateId>("professional");
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const remote = await fetchRemoteSettings();
      if (cancelled) return;
      const next = remote || getLocalSettings();
      setSettings(next);
      setTemplate(getCvConfig(next).defaultTemplate);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const config = getCvConfig(settings);
  const format = config.formats[template];
  const catalog = useMemo(() => cvCatalogItems(template), [template]);

  const patchConfig = (next: CvConfig) => {
    setSettings((prev) => ({ ...prev, cvConfig: next }));
  };

  const patchFormat = (partial: Partial<CvFormatConfig>) => {
    patchConfig({
      ...config,
      formats: {
        ...config.formats,
        [template]: { ...format, ...partial },
      },
    });
  };

  const moveSection = (id: CvSectionId, dir: -1 | 1) => {
    const sorted = [...format.sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === id);
    const swap = index + dir;
    if (index < 0 || swap < 0 || swap >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swap];
    const next = format.sections.map((s) => {
      if (s.id === a.id) return { ...s, order: b.order };
      if (s.id === b.id) return { ...s, order: a.order };
      return s;
    });
    patchFormat({ sections: next });
  };

  const persist = () =>
    void runSave(async () => {
      const updated = await saveLocalSettings({ cvConfig: getCvConfig(settings) });
      setSettings(updated);
    }, "CV settings saved.");

  const downloadPdf = async () => {
    setPdfError("");
    setDownloading(true);
    try {
      const res = await fetch(`/api/cv/pdf?template=${template}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "PDF download failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cvPdfFilename(template);
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPdfError(error instanceof Error ? error.message : "Could not generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%", gap: "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexShrink: 0 }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
            Control center
          </p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>CV / Resume</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "40rem" }}>
            Three formats, one public default, CV-only overrides. Reuses portfolio experience, education,
            projects, and skills without changing the website copy.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button type="button" className="btn btn-outline" onClick={() => void downloadPdf()} disabled={downloading}>
            {downloading ? <RiLoader4Line size={16} className="cv-spin" /> : <RiDownloadLine size={16} />}
            Download PDF
          </button>
          <button type="button" className="btn btn-primary" onClick={() => void persist()} disabled={saving}>
            <RiSaveLine size={16} /> {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {pdfError ? (
        <p role="alert" style={{ color: "#b91c1c", fontSize: "0.82rem", margin: 0 }}>
          {pdfError}
        </p>
      ) : null}

      <div className="dash-cv-responsive" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(18rem, 0.95fr)", gap: "0.85rem", flex: 1, minHeight: 0 }}>
        <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: "1rem" }}>
          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Public default</h2>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
              Default download format
              <select
                style={{ ...inputStyle, marginTop: "0.35rem" }}
                value={config.defaultTemplate}
                onChange={(e) =>
                  patchConfig({ ...config, defaultTemplate: e.target.value as CvTemplateId })
                }
              >
                {CV_TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Formats</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {CV_TEMPLATE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTemplate(opt.id)}
                  style={{
                    border: template === opt.id ? "1px solid #0e52a8" : "1px solid #cbd5e1",
                    background: template === opt.id ? "#eff6ff" : "#fff",
                    color: "#0f172a",
                    borderRadius: "999px",
                    padding: "0.4rem 0.75rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0.55rem 0 0" }}>
              {CV_TEMPLATE_OPTIONS.find((o) => o.id === template)?.hint}
            </p>
            <label className="ann-check" style={{ marginTop: "0.75rem" }}>
              <input
                type="checkbox"
                checked={format.isPublic || template === config.defaultTemplate}
                disabled={template === config.defaultTemplate}
                onChange={(e) => patchFormat({ isPublic: e.target.checked })}
              />
              Public on /cv (default is always public)
            </label>
          </section>

          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>CV-only overrides</h2>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
              Headline override
              <input
                style={{ ...inputStyle, marginTop: "0.35rem" }}
                value={format.overrides.headline || ""}
                placeholder="Uses site subtitle if empty"
                onChange={(e) =>
                  patchFormat({ overrides: { ...format.overrides, headline: e.target.value } })
                }
              />
            </label>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
              Profile summary override
              <textarea
                style={{ ...inputStyle, marginTop: "0.35rem", minHeight: "5rem", resize: "vertical" }}
                value={format.overrides.summary || ""}
                placeholder="Uses site bio if empty"
                onChange={(e) =>
                  patchFormat({ overrides: { ...format.overrides, summary: e.target.value } })
                }
              />
            </label>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
              References text
              <textarea
                style={{ ...inputStyle, marginTop: "0.35rem", minHeight: "3.25rem", resize: "vertical" }}
                value={format.overrides.references || ""}
                placeholder="References available on request."
                onChange={(e) =>
                  patchFormat({ overrides: { ...format.overrides, references: e.target.value } })
                }
              />
            </label>
          </section>

          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Sections</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[...format.sections]
                .sort((a, b) => a.order - b.order)
                .map((section) => {
                  const label = CV_SECTION_OPTIONS.find((o) => o.id === section.id)?.label || section.id;
                  return (
                    <div
                      key={section.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        padding: "0.35rem 0.25rem",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                        <input
                          type="checkbox"
                          checked={section.included}
                          onChange={(e) =>
                            patchFormat({
                              sections: format.sections.map((s) =>
                                s.id === section.id ? { ...s, included: e.target.checked } : s
                              ),
                            })
                          }
                        />
                        {label}
                      </label>
                      <span style={{ display: "inline-flex", gap: "0.15rem" }}>
                        <button type="button" className="dash-icon-btn" aria-label="Move up" onClick={() => moveSection(section.id, -1)}>
                          <RiArrowUpSLine size={16} />
                        </button>
                        <button type="button" className="dash-icon-btn" aria-label="Move down" onClick={() => moveSection(section.id, 1)}>
                          <RiArrowDownSLine size={16} />
                        </button>
                      </span>
                    </div>
                  );
                })}
            </div>
          </section>

          <section style={panelStyle}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.35rem" }}>Include items</h2>
            <p style={{ fontSize: "0.75rem", color: "#64748b", margin: "0 0 0.65rem" }}>
              Uncheck to hide a portfolio item from this format only.
            </p>
            <div style={{ display: "grid", gap: "0.35rem", maxHeight: "22rem", overflowY: "auto" }}>
              {catalog.map((item) => {
                const included = format.itemIncludes[item.key] !== false;
                return (
                  <label
                    key={item.key}
                    style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start", fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    <input
                      type="checkbox"
                      checked={included}
                      onChange={(e) =>
                        patchFormat({
                          itemIncludes: { ...format.itemIncludes, [item.key]: e.target.checked },
                        })
                      }
                    />
                    <span>
                      <small style={{ display: "block", color: "#94a3b8", fontWeight: 700 }}>{item.group}</small>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <aside style={{ ...panelStyle, overflow: "auto", minHeight: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
              <RiEyeLine size={16} /> Preview
            </h2>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>{format.label}</span>
          </div>
          <Preview settings={{ ...settings, cvConfig: config }} template={template} />
        </aside>
      </div>
    </div>
  );
}
