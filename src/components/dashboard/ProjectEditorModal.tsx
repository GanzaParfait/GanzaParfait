"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiFolderLine } from "react-icons/ri";
import { Project } from "@/data/site-data";
import CustomSelect from "@/components/ui/CustomSelect";
import { useHistoryBackClose, dismissOnBackdrop } from "@/hooks/useHistoryBackClose";

function projectVideos(project: Partial<Project>) {
  return project.videos?.length ? project.videos : project.video ? [project.video] : [];
}

function linesFromTextarea(value: string) {
  // Keep empty trailing lines so Enter creates a new line while editing.
  return value.split("\n");
}

function cleanLines(lines: string[] | undefined) {
  return (lines || []).map((line) => line.trim()).filter(Boolean);
}

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "role", label: "Attribution" },
  { id: "stack", label: "Tech & capabilities" },
  { id: "results", label: "Results" },
  { id: "gallery", label: "Media" },
  { id: "challenges", label: "Challenges" },
  { id: "learned", label: "What I Learned" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const fieldStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  borderRadius: "0.375rem",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontSize: "0.8125rem",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--color-text-2)",
  marginBottom: "0.25rem",
};

interface ProjectEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (savedProject: Project) => void;
  onPickMedia: (apply: (url: string) => void) => void;
  selectedMediaUrl?: string;
}

export default function ProjectEditorModal({
  isOpen,
  onClose,
  project,
  onSave,
  onPickMedia,
}: ProjectEditorModalProps) {
  const [tab, setTab] = useState<TabId>("basics");
  const [formData, setFormData] = useState<Partial<Project>>({
    id: Date.now().toString(),
    title: "",
    description: "",
    category: "web",
    technologies: ["React", "Next.js", "TypeScript"],
    featured: true,
    status: "live",
    visibility: "public",
    links: { live: "", github: "" },
    image: "/images/projects/project-placeholder.png",
  });
  useHistoryBackClose(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    setTab("basics");
    if (project) {
      setFormData(project);
    } else {
      setFormData({
        id: Date.now().toString(),
        title: "",
        description: "",
        category: "web",
        technologies: ["React", "Next.js", "TypeScript"],
        featured: true,
        status: "live",
        visibility: "public",
        links: { live: "", github: "" },
        image: "/images/projects/project-placeholder.png",
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    const pinned = cleanLines(formData.pinnedMedia);
    const collaborators = (formData.collaborators || [])
      .map((item) => ({
        name: (item.name || "").trim(),
        role: (item.role || "").trim() || undefined,
      }))
      .filter((item) => item.name);
    onSave({
      ...(formData as Project),
      highlights: cleanLines(formData.highlights),
      features: cleanLines(formData.features),
      screenshotCaptions: cleanLines(formData.screenshotCaptions),
      pinnedMedia: pinned.length ? pinned : undefined,
      technologies: (formData.technologies || []).map((item) => item.trim()).filter(Boolean),
      capabilities: (formData.capabilities || []).map((item) => item.trim()).filter(Boolean),
      collaborators: collaborators.length ? collaborators : undefined,
      organizationUrl: (formData.organizationUrl || "").trim() || undefined,
      deliveredThrough: (formData.deliveredThrough || "").trim() || undefined,
      contributionSummary: (formData.contributionSummary || "").trim() || undefined,
      domain: (formData.domain || "").trim() || undefined,
      market: (formData.market || "").trim() || undefined,
      workGroup: formData.workGroup,
      seoTitle: (formData.seoTitle || "").trim() || undefined,
      seoDescription: (formData.seoDescription || "").trim() || undefined,
      visibility: formData.visibility || "public",
      links: {
        live: (formData.links?.live || "").trim() || undefined,
        github: (formData.links?.github || "").trim() || undefined,
        case_study: formData.links?.case_study,
      },
    });
    onClose();
  };

  const set = <K extends keyof Project>(key: K, value: Project[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      className="dash-modal-layer"
      role="dialog"
      aria-modal="true"
      aria-label={project ? "Edit project" : "Add project"}
      onMouseDown={dismissOnBackdrop(onClose)}
    >
      <div className="dash-modal-sheet is-project" onMouseDown={(event) => event.stopPropagation()}>
        <div className="dash-modal-head">
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiFolderLine style={{ color: "var(--color-primary)" }} /> {project ? "Edit Project" : "Add New Project"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }} type="button">
            <RiCloseLine size={18} />
          </button>
        </div>

        <nav className="project-editor-tabs" role="tablist" aria-label="Project editor sections">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? "is-on" : undefined}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <form id="project-editor-form" onSubmit={handleSubmit} style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "grid", gap: "1rem" }}>
          {tab === "basics" && (
            <>
              <div className="dash-form-grid" style={{ gridTemplateColumns: "1.5fr 1fr", gap: "0.875rem" }}>
            <div>
                  <label style={labelStyle}>
                Project Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
                  <input type="text" required value={formData.title || ""} onChange={(e) => set("title", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <CustomSelect
                    value={formData.category || "web"}
                    options={[
                      { value: "web", label: "Web Application" },
                      { value: "mobile", label: "Mobile App" },
                      { value: "ai", label: "AI / Machine Learning" },
                      { value: "saas", label: "Company (legacy)" },
                      { value: "technology", label: "Technology & Innovation" },
                      { value: "open-source", label: "Open Source" },
                      { value: "systems", label: "Systems" },
                      { value: "product", label: "Product / Platform" },
                      { value: "other", label: "Other" },
                    ]}
                    onChange={(value) => set("category", value as Project["category"])}
                  />
                  {formData.category === "other" ? (
              <input
                type="text"
                      placeholder="Name this category"
                      value={formData.categoryNote || ""}
                      onChange={(e) => set("categoryNote", e.target.value)}
                      style={{ ...fieldStyle, marginTop: "0.4rem" }}
                    />
                  ) : null}
                </div>
              </div>
              <div className="dash-form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <CustomSelect
                    value={formData.status || "live"}
                    options={[
                      { value: "live", label: "Live" },
                      { value: "staging", label: "Staging" },
                      { value: "completed", label: "Completed" },
                      { value: "ongoing", label: "Ongoing" },
                      { value: "in-progress", label: "In progress" },
                      { value: "archived", label: "Archived" },
                    ]}
                    onChange={(value) => set("status", value as Project["status"])}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Visibility</label>
                  <CustomSelect
                    value={formData.visibility || "public"}
                    options={[
                      { value: "public", label: "Public (listed + indexable when complete)" },
                      { value: "unlisted", label: "Unlisted (URL only, noindex)" },
                      { value: "draft", label: "Draft (dashboard only)" },
                    ]}
                    onChange={(value) => set("visibility", value as Project["visibility"])}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Client / organization</label>
                  <input type="text" placeholder="e.g. Caritas Rwanda" value={formData.organization || ""} onChange={(e) => set("organization", e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <div className="dash-form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <input type="text" placeholder="Only verified dates" value={formData.period || ""} onChange={(e) => set("period", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Market / location</label>
                  <input type="text" placeholder="e.g. Des Moines, Iowa, United States" value={formData.market || ""} onChange={(e) => set("market", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Domain</label>
                  <input type="text" placeholder="E-commerce / NGO / Research Technology…" value={formData.domain || ""} onChange={(e) => set("domain", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Work group</label>
                  <CustomSelect
                    value={formData.workGroup || "web"}
                    options={[
                      { value: "ventures", label: "Products / Ventures" },
                      { value: "client", label: "Client Systems" },
                      { value: "research", label: "Research & Data" },
                      { value: "web", label: "Web Platforms" },
                    ]}
                    onChange={(value) => set("workGroup", value as Project["workGroup"])}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Short description (cards)</label>
                <textarea rows={2} placeholder="One short sentence for project cards" value={formData.description || ""} onChange={(e) => set("description", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input type="text" placeholder="Optional short tagline" value={formData.tagline || ""} onChange={(e) => set("tagline", e.target.value)} style={fieldStyle} />
              </div>
              <div className="dash-form-grid" style={{ gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Live project URL</label>
                  <input type="url" placeholder="https:// (no utm tracking params)" value={formData.links?.live || ""} onChange={(e) => setFormData({ ...formData, links: { ...formData.links, live: e.target.value } })} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Organization URL</label>
                  <input type="url" placeholder="https://client-or-org.example" value={formData.organizationUrl || ""} onChange={(e) => set("organizationUrl", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Public repository URL</label>
                  <input type="url" placeholder="Only intentionally public repos" value={formData.links?.github || ""} onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })} style={fieldStyle} />
                </div>
              </div>
              <div className="dash-form-grid" style={{ gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>SEO title (optional)</label>
                  <input type="text" placeholder="Overrides default page title when set" value={formData.seoTitle || ""} onChange={(e) => set("seoTitle", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>SEO description (optional)</label>
                  <textarea rows={2} placeholder="Overrides default meta description when set" value={formData.seoDescription || ""} onChange={(e) => set("seoDescription", e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hero flourish text</label>
                <input type="text" placeholder="Short flourish near the case hero" value={formData.flourish || ""} onChange={(e) => set("flourish", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Project logo</label>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <div
                    style={{
                      width: "7.5rem",
                      height: "3.75rem",
                      borderRadius: "0.55rem",
                      background: "#ffffff",
                      border: "1px solid var(--color-border)",
                      display: "grid",
                      placeItems: "center",
                      overflow: "hidden",
                      flex: "0 0 auto",
                    }}
                  >
                    {formData.logo ? (
                      <img src={formData.logo} alt="" style={{ maxWidth: "90%", maxHeight: "80%", objectFit: "contain" }} />
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.7rem" }}>No logo</span>
                    )}
                  </div>
                  <input type="text" value={formData.logo || ""} onChange={(e) => set("logo", e.target.value)} style={fieldStyle} placeholder="/images/projects/logos/…" />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onPickMedia((url) => set("logo", url))}>
                    Choose
                  </button>
            </div>
          </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 600 }}>
                  <input type="checkbox" checked={Boolean(formData.featured)} onChange={(e) => set("featured", e.target.checked)} />
                  Featured case
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.wide || formData.cardSpan === "full")}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        wide: e.target.checked,
                        cardSpan: e.target.checked ? "full" : "half",
                      }))
                    }
                  />
                  Full-width banner card (details left, media right)
                </label>
              </div>
            </>
          )}

          {tab === "overview" && (
            <>
              <div>
                <label style={labelStyle}>Long description</label>
                <textarea
                  rows={5}
                  placeholder="Full case narrative for the project detail page"
                  value={formData.longDescription || ""}
                  onChange={(e) => set("longDescription", e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Context</label>
                <textarea
                  rows={3}
                  placeholder="Who the client is and why the work mattered"
                  value={formData.context || ""}
                  onChange={(e) => set("context", e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Key highlights, one per line</label>
                <textarea
                  rows={4}
                  placeholder={"Digitized intake workflows\nRole-based reporting\nOffline-capable forms"}
                  value={(formData.highlights || []).join("\n")}
                  onChange={(e) => set("highlights", linesFromTextarea(e.target.value))}
                  style={fieldStyle}
                />
              </div>
            </>
          )}

          {tab === "features" && (
            <>
              <div>
                <label style={labelStyle}>Features, one per line</label>
                <textarea
                  rows={6}
                  placeholder={"Search & filters\nRole-based access\nExport reports"}
                  value={(formData.features || []).join("\n")}
                  onChange={(e) => set("features", linesFromTextarea(e.target.value))}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Solution summary</label>
                <textarea rows={3} placeholder="What was delivered and why it matters" value={formData.solution || ""} onChange={(e) => set("solution", e.target.value)} style={fieldStyle} />
              </div>
            </>
          )}

          {tab === "role" && (
            <>
              <div className="dash-form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>My role</label>
                  <input type="text" placeholder="Lead Developer / Technical Delivery & QA…" value={formData.myRole || ""} onChange={(e) => set("myRole", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Delivered through</label>
                  <input type="text" placeholder="e.g. LERONY Ltd" value={formData.deliveredThrough || ""} onChange={(e) => set("deliveredThrough", e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Contribution summary</label>
                <textarea
                  rows={3}
                  placeholder="Factual explanation of what Prince personally did — do not invent team work"
                  value={formData.contributionSummary || ""}
                  onChange={(e) => set("contributionSummary", e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>What I built</label>
                <textarea rows={4} placeholder="Concrete systems, flows, or modules you owned" value={formData.whatIBuilt || ""} onChange={(e) => set("whatIBuilt", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Contribution type</label>
                <CustomSelect
                  value={formData.contribution || "creator"}
                  options={[
                    { value: "creator", label: "Creator / primary builder" },
                    { value: "contributor", label: "Contributor / team delivery" },
                  ]}
                  onChange={(value) => set("contribution", value as Project["contribution"])}
                />
              </div>
              <div>
                <label style={labelStyle}>Collaborators (one per line: Name — Role)</label>
                <textarea
                  rows={3}
                  placeholder={"Name — Role (optional; leave blank if not public)"}
                  value={(formData.collaborators || [])
                    .map((item) => (item.role ? `${item.name} — ${item.role}` : item.name))
                    .join("\n")}
                  onChange={(e) =>
                    set(
                      "collaborators",
                      linesFromTextarea(e.target.value).map((line) => {
                        const [name, ...roleParts] = line.split("—").map((part) => part.trim());
                        return { name: name || line.trim(), role: roleParts.join(" — ") || undefined };
                      }),
                    )
                  }
                  style={fieldStyle}
                />
              </div>
            </>
          )}

          {tab === "stack" && (
            <>
              <div>
                <label style={labelStyle}>Technologies (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Next.js, PostgreSQL, Supabase…"
                  value={(formData.technologies || []).join(", ")}
                  onChange={(e) => set("technologies", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                  style={fieldStyle}
                />
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.72rem", color: "var(--color-text-3)" }}>
                  Only list verified stack. These feed the Engineering Toolkit evidence map.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Capabilities demonstrated (comma-separated)</label>
                <input
                  type="text"
                  placeholder="E-commerce, Donation enablement, Deployment & hosting…"
                  value={(formData.capabilities || []).join(", ")}
                  onChange={(e) => set("capabilities", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Website technologies (optional company/product split)</label>
                <input
                  type="text"
                  placeholder="Only when distinct from project technologies"
                  value={(formData.websiteTechnologies || []).join(", ")}
                  onChange={(e) =>
                    set(
                      "websiteTechnologies",
                      e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                  style={fieldStyle}
                />
              </div>
            </>
          )}

          {tab === "results" && (
            <>
          <div>
                <label style={labelStyle}>Outcome</label>
              <textarea
                rows={3}
                  placeholder="What changed after launch (no unverified numbers)"
                  value={formData.outcome || ""}
                  onChange={(e) => set("outcome", e.target.value)}
                  style={fieldStyle}
              />
            </div>
            <div>
                <label style={labelStyle}>Result / impact (verified only)</label>
              <textarea
                rows={3}
                  placeholder="Only outcomes you can stand behind"
                  value={formData.result || ""}
                  onChange={(e) => set("result", e.target.value)}
                  style={fieldStyle}
              />
            </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.875rem" }}>
            <div>
                  <label style={labelStyle}>Quote (only with permission)</label>
              <textarea
                rows={2}
                    placeholder="Optional short quote"
                    value={formData.quote || ""}
                    onChange={(e) => set("quote", e.target.value)}
                    style={fieldStyle}
              />
            </div>
            <div>
                  <label style={labelStyle}>Quote attribution</label>
                  <input
                    type="text"
                    placeholder="Name · Role"
                    value={formData.quoteBy || ""}
                    onChange={(e) => set("quoteBy", e.target.value)}
                    style={fieldStyle}
              />
            </div>
          </div>
              <div>
                <label style={labelStyle}>Case study file</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    placeholder="/images/projects/… or media URL"
                    value={formData.caseStudyFile || ""}
                    onChange={(e) => set("caseStudyFile", e.target.value)}
                    style={fieldStyle}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onPickMedia((url) => set("caseStudyFile", url))}>
                    Choose
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "gallery" && (
            <>
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.35rem" }}>Pinned preview media (homepage + cards)</label>
                <p style={{ margin: "0 0 0.55rem", fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                  Pin at least three images or videos. These drive the tilted homepage preview and project card cover.
                </p>
                <div className="project-pin-grid">
                  {Array.from({ length: Math.max(3, (formData.pinnedMedia || []).length + 1) }, (_, index) => {
                    const src = formData.pinnedMedia?.[index];
                    return (
                      <div key={`pin-${index}`} className="project-pin-slot">
                        {src ? (
                          <>
                            {/\.(mp4|webm|ogg|mov)(\?|$)/i.test(src) ? (
                              <video src={src} muted playsInline preload="metadata" />
                            ) : (
                              <img src={src} alt="" />
                            )}
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  pinnedMedia: (prev.pinnedMedia || []).filter((_, pin) => pin !== index),
                                }))
                              }
                            >
                              Unpin
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="media-add-card"
                            aria-label={`Pin media slot ${index + 1}`}
                            onClick={() =>
                              onPickMedia((url) =>
                                setFormData((prev) => {
                                  const next = [...(prev.pinnedMedia || [])];
                                  while (next.length < index) next.push("");
                                  next[index] = url;
                                  return { ...prev, pinnedMedia: next.filter(Boolean) };
                                }),
                              )
                            }
                          >
                            <RiImageAddLine size={24} />
                            <span>Pin {index + 1}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.45rem" }}>Cover &amp; stills</label>
                <div style={{ display: "flex", gap: "0.7rem", alignItems: "stretch", flexWrap: "wrap" }}>
                  <div style={{ flex: "1 1 18rem", minHeight: "14rem", borderRadius: "0.85rem", overflow: "hidden", border: "1px solid var(--color-border)", background: "#0b192c" }}>
                    {formData.image && !formData.image.includes("placeholder") ? (
                      <img src={formData.image} alt="" style={{ width: "100%", height: "14rem", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "14rem", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Cover preview</div>
                    )}
                  </div>
                  {(formData.screenshots || []).map((src, index) => (
                    <div key={`${src}-${index}`} style={{ width: "11rem" }}>
                      <img src={src} alt="" style={{ width: "11rem", height: "8.5rem", objectFit: "cover", borderRadius: "0.85rem", border: "1px solid var(--color-border)" }} />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            screenshots: (prev.screenshots || []).filter((_, shot) => shot !== index),
                            image: prev.image === src ? (prev.screenshots || []).find((item) => item !== src) || "" : prev.image,
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="media-add-card"
                    aria-label="Add image"
                    onClick={() =>
                      onPickMedia((url) =>
                        setFormData((prev) => ({
                          ...prev,
                          image: prev.image && !prev.image.includes("placeholder") ? prev.image : url,
                          screenshots: [...(prev.screenshots || []), url],
                        })),
                      )
                    }
                  >
                    <RiImageAddLine size={28} />
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Media captions, one per line (aligned with stills)</label>
                <textarea
                  rows={3}
                  placeholder={"Dashboard overview\nIntake form\nReports view"}
                  value={(formData.screenshotCaptions || []).join("\n")}
                  onChange={(e) => set("screenshotCaptions", linesFromTextarea(e.target.value))}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.45rem" }}>Videos</label>
                <p style={{ margin: "0 0 0.55rem", fontSize: "0.75rem", color: "var(--color-text-3)" }}>
                  Upload MP4/WebM from Media Manager. Videos render with a poster play control on the case study.
                </p>
                <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                  {projectVideos(formData).map((src, index) => (
                    <div key={`${src}-${index}`} style={{ width: "14rem" }}>
                      <video
                        src={src}
                        poster={formData.videoPoster || formData.image}
                        controls
                        preload="metadata"
                        playsInline
                        style={{ width: "14rem", height: "8.5rem", objectFit: "cover", borderRadius: "0.85rem", background: "#07111f" }}
                      />
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            videos: projectVideos(prev).filter((_, videoIndex) => videoIndex !== index),
                            video: projectVideos(prev).filter((_, videoIndex) => videoIndex !== index)[0] || "",
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="media-add-card"
                    aria-label="Add video"
                    onClick={() =>
                      onPickMedia((url) =>
                        setFormData((prev) => ({
                          ...prev,
                          videos: [...projectVideos(prev), url],
                          video: prev.video || url,
                          videoPoster: prev.videoPoster || prev.image,
                        })),
                      )
                    }
                  >
                    <RiImageAddLine size={28} />
                  </button>
                </div>
              </div>
            <div>
                <label style={labelStyle}>Video poster image URL</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                    type="text"
                    placeholder="/images/projects/… poster"
                    value={formData.videoPoster || ""}
                    onChange={(e) => set("videoPoster", e.target.value)}
                    style={fieldStyle}
                  />
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => onPickMedia((url) => set("videoPoster", url))}>
                    Choose
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "challenges" && (
            <>
              <div>
                <label style={labelStyle}>Challenge</label>
                <textarea
                  rows={4}
                  placeholder="What made this hard to ship"
                  value={formData.challenge || ""}
                  onChange={(e) => set("challenge", e.target.value)}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Problem</label>
                <textarea
                  rows={4}
                  placeholder="The concrete problem the product solved"
                  value={formData.problem || ""}
                  onChange={(e) => set("problem", e.target.value)}
                  style={fieldStyle}
              />
            </div>
            </>
          )}

          {tab === "learned" && (
            <div>
              <label style={labelStyle}>What I learned</label>
              <textarea
                rows={6}
                placeholder="Lessons you would carry into the next build"
                value={formData.learned || ""}
                onChange={(e) => set("learned", e.target.value)}
                style={fieldStyle}
              />
            </div>
          )}

          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-3)" }}>
            Do not add visitor counts, revenue, or other numbers taken from a screenshot.
          </p>
          <div className="dash-modal-actions-desktop" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem" }}>
              <RiSaveLine size={16} /> Save Project
            </button>
          </div>
        </form>
        <div className="dash-modal-footer">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button type="submit" form="project-editor-form" className="btn btn-primary">
            <RiSaveLine size={16} /> Save Project
          </button>
        </div>
      </div>
    </div>
  );
}
