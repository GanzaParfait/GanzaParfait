"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiAddLine,
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEyeLine,
  RiImageAddLine,
  RiLoader4Line,
  RiMore2Fill,
  RiSaveLine,
} from "react-icons/ri";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { CvDocumentSheet } from "@/components/cv/CvDocumentSheet";
import {
  CV_FOOTER_STYLE_OPTIONS,
  CV_HEADER_STYLE_OPTIONS,
  CV_PHOTO_SHAPE_OPTIONS,
  CV_SECTION_OPTIONS,
  CV_TEMPLATE_OPTIONS,
  cvCatalogItems,
  cvPdfFilename,
  defaultAppearance,
  getCvConfig,
  skillGroupOptions,
  type CvAppearance,
  type CvConfig,
  type CvCustomEntry,
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
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState<{
    sectionId: CvCustomEntry["sectionId"];
    title: string;
    subtitle: string;
    period: string;
    location: string;
    summary: string;
    meta: string;
  }>({
    sectionId: "experience",
    title: "",
    subtitle: "",
    period: "",
    location: "",
    summary: "",
    meta: "",
  });
  const { runSave, saving } = useDashboardFeedback();

  useEffect(() => {
    if (!formatMenuOpen) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(".cv-dash-more")) return;
      setFormatMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [formatMenuOpen]);

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
  const catalog = useMemo(() => cvCatalogItems(settings), [settings]);
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

  const appearance = format.appearance || defaultAppearance(template);

  const patchAppearance = (partial: Partial<CvAppearance>) => {
    patchFormat({
      appearance: { ...appearance, ...partial },
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

  const customEntries = format.customEntries || [];

  const addCustomEntry = () => {
    if (!customDraft.title.trim()) return;
    const id = `custom-${Date.now()}`;
    patchFormat({
      customEntries: [
        ...customEntries,
        {
          id,
          sectionId: customDraft.sectionId,
          title: customDraft.title.trim(),
          subtitle: customDraft.subtitle.trim() || undefined,
          period: customDraft.period.trim() || undefined,
          location: customDraft.location.trim() || undefined,
          summary: customDraft.summary.trim() || undefined,
          meta: customDraft.meta.trim() || undefined,
          order: customEntries.length,
        },
      ],
    });
    setCustomDraft({
      sectionId: customDraft.sectionId,
      title: "",
      subtitle: "",
      period: "",
      location: "",
      summary: "",
      meta: "",
    });
  };

  const removeCustomEntry = (id: string) => {
    patchFormat({ customEntries: customEntries.filter((row) => row.id !== id) });
  };

  return (
    <div className="cv-dash-shell">
      <div className="cv-dash-left">
        <div className="cv-dash-toolbar">
          <div className="cv-dash-toolbar-title">
            <h1>CV / Resume</h1>
            <span className="cv-dash-format-pill">{format.label}</span>
          </div>
          <div className="cv-dash-toolbar-actions">
            <button type="button" className="btn btn-outline btn-sm hp-mobile-preview-btn" onClick={() => setDocPreviewOpen(true)}>
              <RiEyeLine size={15} /> Preview
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void persist()} disabled={saving}>
              <RiSaveLine size={15} /> {saving ? "Saving…" : "Save"}
            </button>
            <div className="cv-dash-more">
              <button
                type="button"
                className="btn btn-outline btn-sm cv-dash-more-btn"
                aria-label="More actions"
                aria-expanded={formatMenuOpen}
                onClick={() => setFormatMenuOpen((open) => !open)}
              >
                <RiMore2Fill size={18} />
              </button>
              {formatMenuOpen ? (
                <div className="cv-dash-more-menu" role="menu">
                  <p className="cv-dash-more-label">Format</p>
                  {CV_TEMPLATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      role="menuitem"
                      className={template === opt.id ? "is-active" : undefined}
                      onClick={() => {
                        setTemplate(opt.id);
                        setFormatMenuOpen(false);
                      }}
                    >
                      {opt.label}
                      {config.defaultTemplate === opt.id ? " · Default" : ""}
                    </button>
                  ))}
                  <hr />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      previewPdf();
                      setFormatMenuOpen(false);
                    }}
                  >
                    <RiEyeLine size={14} /> Preview PDF
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    disabled={downloading}
                    onClick={() => {
                      void downloadPdf();
                      setFormatMenuOpen(false);
                    }}
                  >
                    {downloading ? <RiLoader4Line size={14} className="cv-spin" /> : <RiDownloadLine size={14} />}
                    Download PDF
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {pdfError ? (
          <p role="alert" style={{ color: "#b91c1c", fontSize: "0.78rem", margin: 0 }}>
            {pdfError}
          </p>
        ) : null}

        <div className="cv-dash-tabs dash-hscroll">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={tab === item.id ? "is-active" : undefined}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="cv-dash-editor dash-split-main">
          {tab === "content" ? (
            <>
              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.82rem", fontWeight: 800, margin: "0 0 0.55rem" }}>Identity</h2>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#334155", marginBottom: "0.55rem" }}>
                  Headline
                  <input
                    style={{ ...inputStyle, marginTop: "0.3rem" }}
                    value={format.headline || ""}
                    onChange={(e) => patchFormat({ headline: e.target.value })}
                    placeholder="Software Engineer · Technology Entrepreneur · Founder"
                  />
                </label>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#334155" }}>
                  Profile override
                  <textarea
                    style={{ ...inputStyle, marginTop: "0.3rem", minHeight: "4.5rem", resize: "vertical" }}
                    value={format.profileOverride || ""}
                    placeholder="Empty = site bio default"
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
                          {section.included ? (
                            <p style={{ margin: "0.35rem 0 0", fontSize: "0.68rem", color: "#64748b", lineHeight: 1.35 }}>
                              {section.id === "certifications" ||
                              section.id === "experience" ||
                              section.id === "education" ||
                              section.id === "leadership" ||
                              section.id === "training" ||
                              section.id === "achievements"
                                ? "Fill items in Records (tick portfolio rows or add a custom entry). Empty sections stay hidden on the CV."
                                : section.id === "expertise" || section.id === "languages"
                                  ? "Add details in the Content tab for this format."
                                  : section.id === "projects"
                                    ? "Tick projects in Records."
                                    : section.id === "skills"
                                      ? "Toggle skill groups in Records."
                                      : section.id === "links"
                                        ? "Toggle header links in Records."
                                        : section.id === "profile"
                                          ? "Edit headline and profile in the Content tab."
                                          : section.id === "references"
                                            ? "Edit reference note in Appearance / Content."
                                            : "Add content in Records or Content."}
                            </p>
                          ) : null}
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
                <h2 style={{ fontSize: "0.82rem", fontWeight: 800, margin: "0 0 0.35rem" }}>Positions & records</h2>
                <p style={{ fontSize: "0.7rem", color: "#64748b", margin: "0 0 0.55rem" }}>
                  Tick roles to include. A CV can show a single position — uncheck the rest.
                </p>
                {(["Experience", "Leadership", "Projects", "Education", "Training", "Certifications", "Achievements"] as const).map((group) => {
                  const rows = catalog.filter((item) => item.group === group);
                  if (!rows.length) {
                    return (
                      <div key={group} style={{ marginBottom: "0.75rem" }}>
                        <h3 style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0e52a8", margin: "0 0 0.35rem" }}>{group}</h3>
                        <p style={{ fontSize: "0.7rem", color: "#64748b", margin: 0 }}>
                          No portfolio records in this group yet. Add them under{" "}
                          <a href="/dashboard/experience" style={{ color: "#0e52a8", fontWeight: 700 }}>
                            Pages → Experience
                          </a>
                          , or create a custom entry below.
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={group} style={{ marginBottom: "0.75rem" }}>
                      <h3 style={{ fontSize: "0.72rem", fontWeight: 800, color: "#0e52a8", margin: "0 0 0.35rem" }}>{group}</h3>
                      <div style={{ display: "grid", gap: "0.25rem" }}>
                        {rows.map((item) => (
                          <label key={item.key} style={{ display: "flex", gap: "0.45rem", alignItems: "flex-start", fontSize: "0.75rem", fontWeight: 600 }}>
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
                <h2 style={{ fontSize: "0.82rem", fontWeight: 800, margin: "0 0 0.35rem" }}>Custom entries</h2>
                <p style={{ fontSize: "0.7rem", color: "#64748b", margin: "0 0 0.55rem" }}>
                  Add a position that is not in the portfolio list.
                </p>
                {customEntries.length ? (
                  <div style={{ display: "grid", gap: "0.4rem", marginBottom: "0.75rem" }}>
                    {customEntries.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          alignItems: "flex-start",
                          border: "1px solid #e2e8f0",
                          borderRadius: "0.55rem",
                          padding: "0.5rem 0.65rem",
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: "0.78rem" }}>{row.title}</strong>
                          <div style={{ fontSize: "0.68rem", color: "#64748b" }}>
                            {row.sectionId}
                            {row.subtitle ? ` · ${row.subtitle}` : ""}
                            {row.period ? ` · ${row.period}` : ""}
                          </div>
                        </div>
                        <button type="button" className="dash-icon-btn" aria-label="Remove custom entry" onClick={() => removeCustomEntry(row.id)}>
                          <RiDeleteBinLine size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div style={{ display: "grid", gap: "0.4rem" }}>
                  <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#334155" }}>
                    Section
                    <select
                      style={{ ...inputStyle, marginTop: "0.25rem" }}
                      value={customDraft.sectionId}
                      onChange={(e) =>
                        setCustomDraft((prev) => ({
                          ...prev,
                          sectionId: e.target.value as CvCustomEntry["sectionId"],
                        }))
                      }
                    >
                      <option value="experience">Experience</option>
                      <option value="leadership">Leadership</option>
                      <option value="projects">Projects</option>
                      <option value="education">Education</option>
                      <option value="training">Training</option>
                      <option value="achievements">Achievements</option>
                      <option value="certifications">Certifications</option>
                    </select>
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="Title / role *"
                    value={customDraft.title}
                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <input
                    style={inputStyle}
                    placeholder="Organization"
                    value={customDraft.subtitle}
                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, subtitle: e.target.value }))}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                    <input
                      style={inputStyle}
                      placeholder="Period"
                      value={customDraft.period}
                      onChange={(e) => setCustomDraft((prev) => ({ ...prev, period: e.target.value }))}
                    />
                    <input
                      style={inputStyle}
                      placeholder="Location"
                      value={customDraft.location}
                      onChange={(e) => setCustomDraft((prev) => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                  <input
                    style={inputStyle}
                    placeholder="Tag (e.g. Selected engagement)"
                    value={customDraft.meta}
                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, meta: e.target.value }))}
                  />
                  <textarea
                    style={{ ...inputStyle, minHeight: "3.2rem", resize: "vertical" }}
                    placeholder="Summary"
                    value={customDraft.summary}
                    onChange={(e) => setCustomDraft((prev) => ({ ...prev, summary: e.target.value }))}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addCustomEntry} disabled={!customDraft.title.trim()}>
                    <RiAddLine size={15} /> Add custom entry
                  </button>
                </div>
              </section>

              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.82rem", fontWeight: 800, margin: "0 0 0.55rem" }}>Skill groups</h2>
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
            <>
              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.35rem" }}>
                  Layout for {format.label}
                </h2>
                <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 0.85rem" }}>
                  Three document layouts match the reference designs. Header, footer, and photo are saved per format and apply to PDF, live preview, and the public /cv page after Save.
                </p>

                <div style={{ display: "grid", gap: "0.55rem", marginBottom: "0.9rem" }}>
                  {CV_TEMPLATE_OPTIONS.map((opt) => {
                    const isActive = opt.id === template;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTemplate(opt.id)}
                        style={{
                          textAlign: "left",
                          border: isActive ? "1.5px solid #0e52a8" : "1px solid #e2e8f0",
                          background: isActive ? "#eff6ff" : "#fff",
                          borderRadius: "0.75rem",
                          padding: "0.7rem 0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        <strong style={{ fontSize: "0.82rem", color: "#0f172a" }}>{opt.label}</strong>
                        <span style={{ display: "block", fontSize: "0.7rem", color: "#64748b", marginTop: "0.2rem" }}>
                          {opt.id === "professional"
                            ? "Editorial split header · detailed 1–2 pages"
                            : opt.id === "compact"
                              ? "Centered header · concise one-page resume"
                              : "Navy identity band · leadership / impact focus"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.75rem" }}>
                  Header style
                  <select
                    style={{ ...inputStyle, marginTop: "0.35rem" }}
                    value={appearance.headerStyle}
                    onChange={(e) =>
                      patchAppearance({ headerStyle: e.target.value as CvAppearance["headerStyle"] })
                    }
                  >
                    {CV_HEADER_STYLE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} — {opt.hint}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.75rem" }}>
                  Footer style
                  <select
                    style={{ ...inputStyle, marginTop: "0.35rem" }}
                    value={appearance.footerStyle}
                    onChange={(e) =>
                      patchAppearance({ footerStyle: e.target.value as CvAppearance["footerStyle"] })
                    }
                  >
                    {CV_FOOTER_STYLE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#334155", marginBottom: "0.75rem" }}>
                  Tagline / pull quote
                  <input
                    style={{ ...inputStyle, marginTop: "0.35rem" }}
                    value={appearance.tagline || ""}
                    onChange={(e) => patchAppearance({ tagline: e.target.value })}
                    placeholder="Technology for people, real solutions for real impact."
                  />
                </label>

                <div
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                    padding: "0.75rem 0.85rem",
                    background: "#f8fafc",
                    marginBottom: "0.75rem",
                  }}
                >
                  <label className="ann-check" style={{ marginBottom: "0.55rem" }}>
                    <input
                      type="checkbox"
                      checked={appearance.showPhoto}
                      onChange={(e) => patchAppearance({ showPhoto: e.target.checked })}
                    />
                    Show profile picture on this CV
                  </label>

                  {appearance.showPhoto ? (
                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div
                        style={{
                          width: "4.5rem",
                          height: "4.5rem",
                          borderRadius:
                            appearance.photoShape === "circle"
                              ? "999px"
                              : appearance.photoShape === "rounded"
                                ? "0.65rem"
                                : "0.2rem",
                          overflow: "hidden",
                          background: "#e2e8f0",
                          border: "1px solid #cbd5e1",
                          flexShrink: 0,
                        }}
                      >
                        {appearance.photoUrl || settings.heroImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={appearance.photoUrl || settings.heroImageUrl || ""}
                            alt=""
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : null}
                      </div>
                      <div style={{ flex: 1, minWidth: "12rem" }}>
                        <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#334155", marginBottom: "0.45rem" }}>
                          Photo shape
                          <select
                            style={{ ...inputStyle, marginTop: "0.3rem" }}
                            value={appearance.photoShape}
                            onChange={(e) =>
                              patchAppearance({ photoShape: e.target.value as CvAppearance["photoShape"] })
                            }
                          >
                            {CV_PHOTO_SHAPE_OPTIONS.map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                          <button type="button" className="btn btn-outline" onClick={() => setPhotoPickerOpen(true)}>
                            <RiImageAddLine size={15} /> Choose from media
                          </button>
                          {appearance.photoUrl ? (
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => patchAppearance({ photoUrl: "" })}
                            >
                              Use site portrait
                            </button>
                          ) : null}
                        </div>
                        <p style={{ fontSize: "0.68rem", color: "#64748b", margin: "0.4rem 0 0" }}>
                          Empty photo uses the site hero portrait when enabled.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ fontSize: "0.75rem" }}
                  onClick={() => patchAppearance(defaultAppearance(template))}
                >
                  Reset chrome to layout defaults
                </button>
              </section>

              <section style={panelStyle}>
                <h2 style={{ fontSize: "0.85rem", fontWeight: 800, margin: "0 0 0.35rem" }}>Formats on /cv</h2>
                <p style={{ fontSize: "0.72rem", color: "#64748b", margin: "0 0 0.75rem" }}>
                  Choose which layout the website displays by default, and which format cards appear on /cv. Save to publish.
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
            </>
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
      </div>

        <aside className={`cv-dash-preview ${docPreviewOpen ? "is-open" : ""}`}>
          <div className="cv-live-doc-bar">
            <h2>
              <RiEyeLine size={15} /> {format.label}
            </h2>
            <div className="cv-live-doc-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={previewPdf}>
                <RiEyeLine size={14} /> PDF
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => void downloadPdf()} disabled={downloading}>
                {downloading ? <RiLoader4Line size={14} className="cv-spin" /> : <RiDownloadLine size={14} />}
                Download
              </button>
              <button type="button" className="btn btn-ghost btn-sm hp-preview-close" onClick={() => setDocPreviewOpen(false)}>
                Close
              </button>
            </div>
          </div>
          <div id="cv-dash-print" className="cv-dash-preview-scroll">
            <CvDocumentSheet settings={{ ...settings, cvConfig: config }} template={template} />
          </div>
        </aside>

      <MediaManagerModal
        isOpen={photoPickerOpen}
        onClose={() => setPhotoPickerOpen(false)}
        onSelect={(url) => {
          patchAppearance({ photoUrl: url, showPhoto: true });
          setPhotoPickerOpen(false);
        }}
        pickerMode="image"
        title="Choose CV profile photo"
      />
    </div>
  );
}
