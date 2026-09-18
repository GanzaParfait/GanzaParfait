"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
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
  skillGroupOptions,
  type CvConfig,
  type CvFormatConfig,
  type CvLanguage,
  type CvSectionId,
  type CvTemplateId,
} from "@/lib/cv";
import {
  CV_ACCESS_REMEMBER_OPTIONS,
  type CvAccessRememberDays,
} from "@/lib/cv-access";
import {
  DEFAULT_SETTINGS,
  fetchRemoteSettings,
  getLocalSettings,
  saveLocalSettings,
  type SiteSettings,
} from "@/lib/supabase";

type LeadRow = {
  id: string;
  email: string;
  name: string | null;
  cv_format: string;
  action: string;
  marketing_consent: boolean;
  source: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
};

type DashTab = "content" | "sections" | "records" | "appearance" | "access" | "leads" | "download";

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

const TABS: { id: DashTab; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "sections", label: "Sections" },
  { id: "records", label: "Records" },
  { id: "appearance", label: "Appearance" },
  { id: "access", label: "Access" },
  { id: "leads", label: "Leads" },
  { id: "download", label: "Download" },
];

function DocumentPreview({ settings, template }: { settings: SiteSettings; template: CvTemplateId }) {
  const doc = useMemo(() => resolveCvDocument(settings, template), [settings, template]);
  return (
    <article className="cv-sheet" data-template={doc.template}>
      <header className="cv-sheet-head">
        <h1>{doc.name}</h1>
        <p className="cv-sheet-headline">{doc.headline}</p>
        <p className="cv-sheet-meta">
          {[doc.contact.location, doc.contact.email, doc.contact.phone, doc.contact.website?.replace(/^https?:\/\//, "")]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {doc.contact.links.length ? (
          <p className="cv-sheet-meta">
            {doc.contact.links.map((l) => l.label).join(" · ")}
          </p>
        ) : null}
      </header>
      {doc.sections.map((section) => (
        <section key={section.id} className="cv-sheet-section">
          <h2>{section.title}</h2>
          {section.body ? <p>{section.body}</p> : null}
          {section.chips?.length ? (
            <p className="cv-sheet-chips">{section.chips.join(" · ")}</p>
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
      {section.items.map((item) => (
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
          ))}
        </section>
      ))}
    </article>
  );
}

export default function DashboardCvPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [template, setTemplate] = useState<CvTemplateId>("professional");
  const [tab, setTab] = useState<DashTab>("content");
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [leadMetrics, setLeadMetrics] = useState({
    total: 0,
    uniqueEmails: 0,
    downloads: 0,
    views: 0,
    marketingOptIns: 0,
  });
  const [leadFilterFormat, setLeadFilterFormat] = useState("all");
  const [leadFilterAction, setLeadFilterAction] = useState("all");
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);
  const [docPreviewOpen, setDocPreviewOpen] = useState(false);
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

  useEffect(() => {
    if (tab !== "leads") return;
    let cancelled = false;
    setLeadsLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams();
        if (leadFilterFormat !== "all") params.set("format", leadFilterFormat);
        if (leadFilterAction !== "all") params.set("action", leadFilterAction);
        const res = await fetch(`/api/cv/leads?${params.toString()}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Failed to load leads");
        if (cancelled) return;
        setLeads(data.leads || []);
        setLeadMetrics(
          data.metrics || {
            total: 0,
            uniqueEmails: 0,
            downloads: 0,
            views: 0,
            marketingOptIns: 0,
          }
        );
      } catch {
        if (!cancelled) setLeads([]);
      } finally {
        if (!cancelled) setLeadsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, leadFilterFormat, leadFilterAction]);

  const config = getCvConfig(settings);
  const access = config.access;
  const format = config.formats[template];
  const catalog = useMemo(() => cvCatalogItems(), []);
  const skillGroups = useMemo(() => skillGroupOptions(), []);

  const patchConfig = (next: CvConfig) => setSettings((prev) => ({ ...prev, cvConfig: next }));

  const patchAccess = (partial: Partial<typeof access>) => {
    patchConfig({
      ...config,
      access: { ...access, ...partial },
    });
  };

  const patchFormat = (partial: Partial<CvFormatConfig>) => {
    patchConfig({
      ...config,
      formats: { ...config.formats, [template]: { ...format, ...partial } },
    });
  };

  const moveSection = (id: CvSectionId, dir: -1 | 1) => {
    const sorted = [...format.sections].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((s) => s.id === id);
    const swap = index + dir;
    if (index < 0 || swap < 0 || swap >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swap];
    patchFormat({
      sections: format.sections.map((s) => {
        if (s.id === a.id) return { ...s, order: b.order };
        if (s.id === b.id) return { ...s, order: a.order };
        return s;
      }),
    });
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
      const res = await fetch(`/api/cv/pdf?template=${template}&download=1`);
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

  const previewPdf = () => {
    window.open(`/api/cv/pdf?template=${template}`, "_blank", "noopener,noreferrer");
  };

  const updateLanguage = (id: string, patch: Partial<CvLanguage>) => {
    patchConfig({
      ...config,
      languages: config.languages.map((lang) => (lang.id === id ? { ...lang, ...patch } : lang)),
    });
  };

  const addLanguage = () => {
    const id = `lang-${Date.now()}`;
    patchConfig({
      ...config,
      languages: [
        ...config.languages,
        { id, name: "", proficiency: "", note: "", showOnCv: true, order: config.languages.length },
      ],
    });
  };

  const removeLanguage = (id: string) => {
    patchConfig({
      ...config,
      languages: config.languages.filter((lang) => lang.id !== id),
    });
  };

  const sectionChips = [...format.sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => s.included)
    .map((s) => CV_SECTION_OPTIONS.find((o) => o.id === s.id)?.label || s.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, height: "100%", gap: "0.85rem" }}>
      <div className="dash-page-head">
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
            Control center
          </p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c" }}>CV / Resume</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b", maxWidth: "42rem" }}>
            Format-specific documents with independent headlines, sections, records, and languages.
            CV overrides never change website copy.
          </p>
        </div>
        <div className="dash-page-head-actions">
          <button type="button" className="btn btn-outline hp-mobile-preview-btn" onClick={() => setDocPreviewOpen(true)}>
            <RiEyeLine size={16} /> Live doc
          </button>
          <button type="button" className="btn btn-outline" onClick={previewPdf}>
            <RiEyeLine size={16} /> Preview PDF
          </button>
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

      <div style={{ display: "flex", flexWrap: "nowrap", gap: "0.4rem" }} className="dash-hscroll">
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
              padding: "0.45rem 0.85rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {opt.label}
            {config.defaultTemplate === opt.id ? " · Default" : ""}
          </button>
        ))}
      </div>

      <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
        {format.label}: {sectionChips.join(" · ") || "No sections enabled"}
      </p>

      <div className="dash-hscroll" style={{ gap: "0.35rem", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.35rem" }}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            style={{
              border: 0,
              background: tab === item.id ? "#0e52a8" : "transparent",
              color: tab === item.id ? "#fff" : "#475569",
              borderRadius: "0.5rem",
              padding: "0.4rem 0.75rem",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={docPreviewOpen ? "dash-cv-responsive dash-split is-preview-open" : "dash-cv-responsive dash-split"} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.05fr) minmax(18rem, 0.95fr)", gap: "0.85rem", flex: 1, minHeight: 0 }}>
        <div className="dash-split-main" style={{ overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.75rem", paddingBottom: "1rem" }}>
          {tab === "content" ? (
            <>
              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Identity for this format</h2>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
                  Headline (per format — not the website subtitle)
                  <input
                    style={{ ...inputStyle, marginTop: "0.35rem" }}
                    value={format.headline || ""}
                    onChange={(e) => patchFormat({ headline: e.target.value })}
                    placeholder="Founder · Software Engineer · Technologist"
                  />
                </label>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                  Profile override (CV only)
                  <textarea
                    style={{ ...inputStyle, marginTop: "0.35rem", minHeight: "5.5rem", resize: "vertical" }}
                    value={format.profileOverride || ""}
                    placeholder="Leave empty to use a format-aware default from site bio"
                    onChange={(e) => patchFormat({ profileOverride: e.target.value })}
                  />
                </label>
              </section>

              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Core expertise</h2>
                <div style={{ display: "grid", gap: "0.35rem" }}>
                  {config.expertise.map((item) => (
                    <label key={item.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={format.expertiseIncludes[item.id] !== false}
                        onChange={(e) =>
                          patchFormat({
                            expertiseIncludes: { ...format.expertiseIncludes, [item.id]: e.target.checked },
                          })
                        }
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </section>

              <section style={panelStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.65rem" }}>
                  <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0 }}>Languages</h2>
                  <button type="button" className="btn btn-outline" style={{ padding: "0.3rem 0.6rem", fontSize: "0.72rem" }} onClick={addLanguage}>
                    <RiAddLine size={14} /> Add
                  </button>
                </div>
                <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 0.65rem" }}>
                  Proficiency is never inferred — enter only what you can accurately claim.
                </p>
                <div style={{ display: "grid", gap: "0.65rem" }}>
                  {config.languages.map((lang) => (
                    <div key={lang.id} style={{ border: "1px solid #e2e8f0", borderRadius: "0.65rem", padding: "0.65rem", display: "grid", gap: "0.4rem" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.4rem" }}>
                        <input
                          style={inputStyle}
                          placeholder="Language"
                          value={lang.name}
                          onChange={(e) => updateLanguage(lang.id, { name: e.target.value })}
                        />
                        <input
                          style={inputStyle}
                          placeholder="Proficiency (your wording)"
                          value={lang.proficiency}
                          onChange={(e) => updateLanguage(lang.id, { proficiency: e.target.value })}
                        />
                        <button type="button" className="dash-icon-btn" aria-label="Remove language" onClick={() => removeLanguage(lang.id)}>
                          <RiDeleteBinLine size={16} />
                        </button>
                      </div>
                      <input
                        style={inputStyle}
                        placeholder="Optional note"
                        value={lang.note || ""}
                        onChange={(e) => updateLanguage(lang.id, { note: e.target.value })}
                      />
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <label style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center", fontSize: "0.75rem", fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={lang.showOnCv}
                            onChange={(e) => updateLanguage(lang.id, { showOnCv: e.target.checked })}
                          />
                          Available for CVs
                        </label>
                        <label style={{ display: "inline-flex", gap: "0.4rem", alignItems: "center", fontSize: "0.75rem", fontWeight: 600 }}>
                          <input
                            type="checkbox"
                            checked={format.languageIncludes[lang.id] !== false && lang.showOnCv}
                            disabled={!lang.showOnCv}
                            onChange={(e) =>
                              patchFormat({
                                languageIncludes: { ...format.languageIncludes, [lang.id]: e.target.checked },
                              })
                            }
                          />
                          Show on this format
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}

          {tab === "sections" ? (
            <section style={panelStyle}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Sections for {format.label}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {[...format.sections]
                  .sort((a, b) => a.order - b.order)
                  .map((section) => {
                    const label = CV_SECTION_OPTIONS.find((o) => o.id === section.id)?.label || section.id;
                    return (
                      <div
                        key={section.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto",
                          gap: "0.5rem",
                          alignItems: "center",
                          padding: "0.45rem 0.25rem",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
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
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{label}</div>
                          <input
                            style={{ ...inputStyle, marginTop: "0.25rem", fontSize: "0.75rem" }}
                            placeholder="Custom section title (optional)"
                            value={section.titleOverride || ""}
                            onChange={(e) =>
                              patchFormat({
                                sections: format.sections.map((s) =>
                                  s.id === section.id ? { ...s, titleOverride: e.target.value } : s
                                ),
                              })
                            }
                          />
                          <input
                            style={{ ...inputStyle, marginTop: "0.25rem", fontSize: "0.75rem", maxWidth: "8rem" }}
                            type="number"
                            min={1}
                            placeholder="Max items"
                            value={section.maxItems ?? ""}
                            onChange={(e) =>
                              patchFormat({
                                sections: format.sections.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        maxItems: e.target.value ? Number(e.target.value) : undefined,
                                      }
                                    : s
                                ),
                              })
                            }
                          />
                        </div>
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
          ) : null}

          {tab === "records" ? (
            <>
              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.35rem" }}>Record selection</h2>
                <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 0.65rem" }}>
                  Choose which portfolio records appear in this format. LERONY should usually appear once — under Leadership or Experience, not both, and not again as a project.
                </p>
                {(["Experience", "Leadership", "Projects", "Education", "Training", "Achievements"] as const).map((group) => {
                  const rows = catalog.filter((item) => item.group === group);
                  if (!rows.length) return null;
                  return (
                    <div key={group} style={{ marginBottom: "0.85rem" }}>
                      <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: "#0e52a8", margin: "0 0 0.4rem" }}>{group}</h3>
                      <div style={{ display: "grid", gap: "0.3rem" }}>
                        {rows.map((item) => (
                          <label key={item.key} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.78rem", fontWeight: 600 }}>
                            <input
                              type="checkbox"
                              checked={format.itemIncludes[item.key] !== false}
                              onChange={(e) =>
                                patchFormat({
                                  itemIncludes: { ...format.itemIncludes, [item.key]: e.target.checked },
                                })
                              }
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </section>

              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Skill groups</h2>
                {skillGroups.map((group) => (
                  <label key={group.id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                    <input
                      type="checkbox"
                      checked={format.skillGroupIncludes[group.id] !== false}
                      onChange={(e) =>
                        patchFormat({
                          skillGroupIncludes: { ...format.skillGroupIncludes, [group.id]: e.target.checked },
                        })
                      }
                    />
                    {group.label}
                  </label>
                ))}
              </section>

              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Header / selected links</h2>
                {["website", "linkedin", "github", "twitter", "instagram", "youtube", "tiktok", "threads", "whatsapp", "buymeacoffee"].map((id) => {
                  const essential = id === "linkedin" || id === "github" || id === "website";
                  const checked =
                    format.linkIncludes[id] === true ||
                    (essential && format.linkIncludes[id] !== false);
                  return (
                  <label key={id} style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.3rem", textTransform: "capitalize" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        patchFormat({
                          linkIncludes: { ...format.linkIncludes, [id]: e.target.checked },
                        })
                      }
                    />
                    {id}
                  </label>
                  );
                })}
              </section>
            </>
          ) : null}

          {tab === "appearance" ? (
            <section style={panelStyle}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.35rem" }}>Formats on /cv</h2>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 0.75rem" }}>
                Toggle formats off to hide them on the website without deleting configuration. Default always stays available for cards.
              </p>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.75rem" }}>
                Default public format
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

              <div style={{ display: "grid", gap: "0.55rem" }}>
                {CV_TEMPLATE_OPTIONS.map((opt) => {
                  const fmt = config.formats[opt.id];
                  const isDefault = opt.id === config.defaultTemplate;
                  return (
                    <div
                      key={opt.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: "0.75rem",
                        padding: "0.7rem 0.8rem",
                        background: isDefault ? "#eff6ff" : "#fff",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.45rem" }}>
                        <strong style={{ fontSize: "0.82rem" }}>
                          {opt.label}
                          {isDefault ? " · Default" : ""}
                        </strong>
                        {!isDefault ? (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: "0.2rem 0.55rem", fontSize: "0.68rem" }}
                            onClick={() => patchConfig({ ...config, defaultTemplate: opt.id })}
                          >
                            Make default
                          </button>
                        ) : null}
                      </div>
                      <label className="ann-check" style={{ marginBottom: "0.3rem" }}>
                        <input
                          type="checkbox"
                          checked={fmt.isPublic || isDefault}
                          disabled={isDefault}
                          onChange={(e) =>
                            patchConfig({
                              ...config,
                              formats: {
                                ...config.formats,
                                [opt.id]: { ...fmt, isPublic: e.target.checked },
                              },
                            })
                          }
                        />
                        Show card on /cv
                      </label>
                      <label className="ann-check">
                        <input
                          type="checkbox"
                          checked={fmt.showInHero !== false}
                          onChange={(e) =>
                            patchConfig({
                              ...config,
                              formats: {
                                ...config.formats,
                                [opt.id]: { ...fmt, showInHero: e.target.checked },
                              },
                            })
                          }
                        />
                        Show paper in hero stack
                      </label>
                    </div>
                  );
                })}
              </div>

              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginTop: "0.85rem" }}>
                References text (current format, if section enabled)
                <textarea
                  style={{ ...inputStyle, marginTop: "0.35rem", minHeight: "3rem", resize: "vertical" }}
                  value={format.referencesText || ""}
                  placeholder="References available on request."
                  onChange={(e) => patchFormat({ referencesText: e.target.value })}
                />
              </label>
            </section>
          ) : null}

          {tab === "access" ? (
            <section style={panelStyle}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.35rem" }}>CV access</h2>
              <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 0.85rem" }}>
                Gate View / Download behind a lightweight email prompt. The /cv landing page stays public.
              </p>

              <fieldset style={{ border: 0, margin: 0, padding: 0 }}>
                <legend style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", marginBottom: "0.45rem" }}>
                  CV access mode
                </legend>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.35rem" }}>
                  <input
                    type="radio"
                    name="cv-access-mode"
                    checked={access.mode === "open"}
                    onChange={() => patchAccess({ mode: "open" })}
                  />
                  Open access
                </label>
                <label style={{ display: "flex", gap: "0.5rem", alignItems: "center", fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                  <input
                    type="radio"
                    name="cv-access-mode"
                    checked={access.mode === "email"}
                    onChange={() => patchAccess({ mode: "email" })}
                  />
                  Email before access
                </label>
              </fieldset>

              <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#334155", margin: "0 0 0.4rem" }}>Gate actions</p>
              <label className="ann-check" style={{ marginBottom: "0.35rem" }}>
                <input
                  type="checkbox"
                  checked={access.gateView}
                  onChange={(e) => patchAccess({ gateView: e.target.checked })}
                />
                View
              </label>
              <label className="ann-check" style={{ marginBottom: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={access.gateDownload}
                  onChange={(e) => patchAccess({ gateDownload: e.target.checked })}
                />
                Download
              </label>

              <label className="ann-check" style={{ marginBottom: "0.35rem" }}>
                <input
                  type="checkbox"
                  checked={access.allowSkip}
                  onChange={(e) => patchAccess({ allowSkip: e.target.checked })}
                />
                Allow visitor to skip
              </label>
              <label className="ann-check" style={{ marginBottom: "0.35rem" }}>
                <input
                  type="checkbox"
                  checked={access.collectName}
                  onChange={(e) => patchAccess({ collectName: e.target.checked })}
                />
                Collect name (optional)
              </label>
              <label className="ann-check" style={{ marginBottom: "0.75rem" }}>
                <input
                  type="checkbox"
                  checked={access.marketingOptInAvailable}
                  onChange={(e) => patchAccess({ marketingOptInAvailable: e.target.checked })}
                />
                Show marketing opt-in (unchecked by default)
              </label>

              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.75rem" }}>
                Remember unlocked access
                <select
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={access.rememberDays}
                  onChange={(e) =>
                    patchAccess({ rememberDays: Number(e.target.value) as CvAccessRememberDays })
                  }
                >
                  {CV_ACCESS_REMEMBER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
                Modal heading (use {"{format}"})
                <input
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={access.modalHeadingTemplate}
                  onChange={(e) => patchAccess({ modalHeadingTemplate: e.target.value })}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
                Supporting text
                <textarea
                  style={{ ...inputStyle, marginTop: "0.35rem", minHeight: "3rem", resize: "vertical" }}
                  value={access.modalBody}
                  onChange={(e) => patchAccess({ modalBody: e.target.value })}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
                Privacy / helper text
                <input
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={access.privacyHelper}
                  onChange={(e) => patchAccess({ privacyHelper: e.target.value })}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
                Marketing consent label
                <input
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={access.marketingLabel}
                  onChange={(e) => patchAccess({ marketingLabel: e.target.value })}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.65rem" }}>
                Skip label
                <input
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={access.skipLabel}
                  onChange={(e) => patchAccess({ skipLabel: e.target.value })}
                />
              </label>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                Submit button label
                <input
                  style={{ ...inputStyle, marginTop: "0.35rem" }}
                  value={access.submitLabel}
                  onChange={(e) => patchAccess({ submitLabel: e.target.value })}
                />
              </label>
            </section>
          ) : null}

          {tab === "leads" ? (
            <section style={panelStyle}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>CV leads</h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(7.5rem, 1fr))",
                  gap: "0.5rem",
                  marginBottom: "0.85rem",
                }}
              >
                {[
                  ["Total", leadMetrics.total],
                  ["Unique", leadMetrics.uniqueEmails],
                  ["Views", leadMetrics.views],
                  ["Downloads", leadMetrics.downloads],
                  ["Marketing", leadMetrics.marketingOptIns],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "0.65rem",
                      padding: "0.55rem 0.65rem",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.65rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      {label}
                    </p>
                    <p style={{ margin: "0.15rem 0 0", fontSize: "1.1rem", fontWeight: 800, color: "#0b192c" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <select
                  style={{ ...inputStyle, width: "auto", minWidth: "9rem" }}
                  value={leadFilterFormat}
                  onChange={(e) => setLeadFilterFormat(e.target.value)}
                >
                  <option value="all">All formats</option>
                  <option value="professional">Professional</option>
                  <option value="compact">Compact</option>
                  <option value="executive">Executive</option>
                </select>
                <select
                  style={{ ...inputStyle, width: "auto", minWidth: "8rem" }}
                  value={leadFilterAction}
                  onChange={(e) => setLeadFilterAction(e.target.value)}
                >
                  <option value="all">All actions</option>
                  <option value="view">View</option>
                  <option value="download">Download</option>
                </select>
              </div>

              {leadsLoading ? (
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>Loading leads…</p>
              ) : leads.length === 0 ? (
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>No CV access leads yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                    <thead>
                      <tr style={{ textAlign: "left", color: "#64748b" }}>
                        <th style={{ padding: "0.4rem 0.35rem", borderBottom: "1px solid #e2e8f0" }}>Email</th>
                        <th style={{ padding: "0.4rem 0.35rem", borderBottom: "1px solid #e2e8f0" }}>Format</th>
                        <th style={{ padding: "0.4rem 0.35rem", borderBottom: "1px solid #e2e8f0" }}>Action</th>
                        <th style={{ padding: "0.4rem 0.35rem", borderBottom: "1px solid #e2e8f0" }}>Source</th>
                        <th style={{ padding: "0.4rem 0.35rem", borderBottom: "1px solid #e2e8f0" }}>Marketing</th>
                        <th style={{ padding: "0.4rem 0.35rem", borderBottom: "1px solid #e2e8f0" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.map((lead) => (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          style={{ cursor: "pointer" }}
                        >
                          <td style={{ padding: "0.45rem 0.35rem", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>
                            {lead.email}
                          </td>
                          <td style={{ padding: "0.45rem 0.35rem", borderBottom: "1px solid #f1f5f9" }}>{lead.cv_format}</td>
                          <td style={{ padding: "0.45rem 0.35rem", borderBottom: "1px solid #f1f5f9" }}>{lead.action}</td>
                          <td style={{ padding: "0.45rem 0.35rem", borderBottom: "1px solid #f1f5f9" }}>{lead.source || "—"}</td>
                          <td style={{ padding: "0.45rem 0.35rem", borderBottom: "1px solid #f1f5f9" }}>
                            {lead.marketing_consent ? "Yes" : "No"}
                          </td>
                          <td style={{ padding: "0.45rem 0.35rem", borderBottom: "1px solid #f1f5f9" }}>
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedLead ? (
                <div
                  role="dialog"
                  aria-label="Lead detail"
                  style={{
                    marginTop: "0.85rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "0.75rem",
                    padding: "0.85rem",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.55rem" }}>
                    <strong style={{ fontSize: "0.85rem" }}>Lead detail</strong>
                    <button type="button" className="btn btn-outline" style={{ padding: "0.25rem 0.55rem", fontSize: "0.72rem" }} onClick={() => setSelectedLead(null)}>
                      Close
                    </button>
                  </div>
                  <dl style={{ margin: 0, display: "grid", gap: "0.35rem", fontSize: "0.78rem" }}>
                    <div><dt style={{ color: "#64748b", display: "inline" }}>Email: </dt><dd style={{ display: "inline", margin: 0, fontWeight: 700 }}>{selectedLead.email}</dd></div>
                    {selectedLead.name ? <div><dt style={{ color: "#64748b", display: "inline" }}>Name: </dt><dd style={{ display: "inline", margin: 0 }}>{selectedLead.name}</dd></div> : null}
                    <div><dt style={{ color: "#64748b", display: "inline" }}>CV: </dt><dd style={{ display: "inline", margin: 0 }}>{selectedLead.cv_format}</dd></div>
                    <div><dt style={{ color: "#64748b", display: "inline" }}>Action: </dt><dd style={{ display: "inline", margin: 0 }}>{selectedLead.action}</dd></div>
                    <div><dt style={{ color: "#64748b", display: "inline" }}>Source: </dt><dd style={{ display: "inline", margin: 0 }}>{selectedLead.source || "—"}</dd></div>
                    <div><dt style={{ color: "#64748b", display: "inline" }}>Marketing: </dt><dd style={{ display: "inline", margin: 0 }}>{selectedLead.marketing_consent ? "Yes" : "No"}</dd></div>
                    <div><dt style={{ color: "#64748b", display: "inline" }}>Date: </dt><dd style={{ display: "inline", margin: 0 }}>{new Date(selectedLead.created_at).toLocaleString()}</dd></div>
                    {(selectedLead.utm_source || selectedLead.utm_medium || selectedLead.utm_campaign) ? (
                      <div>
                        <dt style={{ color: "#64748b", display: "inline" }}>UTM: </dt>
                        <dd style={{ display: "inline", margin: 0 }}>
                          {[selectedLead.utm_source, selectedLead.utm_medium, selectedLead.utm_campaign].filter(Boolean).join(" / ")}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ) : null}
            </section>
          ) : null}

          {tab === "download" ? (
            <section style={panelStyle}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.65rem" }}>Export</h2>
              <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 0.85rem" }}>
                PDF is the canonical visual version (A4, selectable text). Filename:{" "}
                <strong>{cvPdfFilename(template)}</strong>
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button type="button" className="btn btn-outline" onClick={previewPdf}>
                  <RiEyeLine size={16} /> Preview PDF
                </button>
                <button type="button" className="btn btn-primary" onClick={() => void downloadPdf()} disabled={downloading}>
                  <RiDownloadLine size={16} /> Download PDF
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    const node = document.getElementById("cv-dash-print");
                    if (!node) return;
                    const w = window.open("", "_blank");
                    if (!w) return;
                    w.document.write(`<html><head><title>${cvPdfFilename(template)}</title></head><body>${node.innerHTML}</body></html>`);
                    w.document.close();
                    w.focus();
                    w.print();
                  }}
                >
                  Print preview
                </button>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="dash-split-preview" style={{ ...panelStyle, overflow: "auto", minHeight: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: 0, display: "inline-flex", gap: "0.4rem", alignItems: "center" }}>
              <RiEyeLine size={16} /> Live document
            </h2>
            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 700 }}>{format.label}</span>
              <button type="button" className="btn btn-ghost btn-sm hp-preview-close" onClick={() => setDocPreviewOpen(false)}>
                Close
              </button>
            </div>
          </div>
          <div id="cv-dash-print">
            <DocumentPreview settings={{ ...settings, cvConfig: config }} template={template} />
          </div>
        </aside>
      </div>
    </div>
  );
}
