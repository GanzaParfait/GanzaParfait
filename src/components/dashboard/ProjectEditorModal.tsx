"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiFolderLine } from "react-icons/ri";
import { Project } from "@/data/site-data";
import CustomSelect from "@/components/ui/CustomSelect";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

function projectVideos(project: Partial<Project>) {
  return project.videos?.length ? project.videos : project.video ? [project.video] : [];
}

const TABS = [
  { id: "basics", label: "Basics" },
  { id: "overview", label: "Overview" },
  { id: "features", label: "Features" },
  { id: "role", label: "My Role" },
  { id: "stack", label: "Tech Stack" },
  { id: "results", label: "Results" },
  { id: "gallery", label: "Gallery" },
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
        links: { live: "", github: "" },
        image: "/images/projects/project-placeholder.png",
      });
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave(formData as Project);
    onClose();
  };

  const set = <K extends keyof Project>(key: K, value: Project[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "72rem",
          maxHeight: "90vh",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.75rem",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiFolderLine style={{ color: "var(--color-primary)" }} /> {project ? "Edit Project" : "Add New Project"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }} type="button">
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="case-tabs dash-project-tabs" role="tablist" aria-label="Project editor sections" style={{ padding: "0.75rem 1.25rem 0", flexWrap: "wrap" }}>
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
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "grid", gap: "1rem" }}>
          {tab === "basics" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.875rem" }}>
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
                      { value: "saas", label: "Company" },
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <CustomSelect
                    value={formData.status || "live"}
                    options={[
                      { value: "live", label: "Live" },
                      { value: "in-progress", label: "In progress" },
                      { value: "archived", label: "Archived" },
                    ]}
                    onChange={(value) => set("status", value as Project["status"])}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Client / organization</label>
                  <input type="text" value={formData.organization || ""} onChange={(e) => set("organization", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Duration</label>
                  <input type="text" placeholder="Only verified dates" value={formData.period || ""} onChange={(e) => set("period", e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Short description (cards)</label>
                <textarea rows={2} value={formData.description || ""} onChange={(e) => set("description", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Tagline</label>
                <input type="text" value={formData.tagline || ""} onChange={(e) => set("tagline", e.target.value)} style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Live URL</label>
                  <input type="url" value={formData.links?.live || ""} onChange={(e) => setFormData({ ...formData, links: { ...formData.links, live: e.target.value } })} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GitHub URL</label>
                  <input type="url" value={formData.links?.github || ""} onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Hero flourish text</label>
                <input type="text" value={formData.flourish || ""} onChange={(e) => set("flourish", e.target.value)} style={fieldStyle} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 600 }}>
                <input type="checkbox" checked={Boolean(formData.featured)} onChange={(e) => set("featured", e.target.checked)} />
                Featured case
              </label>
            </>
          )}

          {tab === "overview" && (
            <>
              <div>
                <label style={labelStyle}>Long description</label>
                <textarea rows={5} value={formData.longDescription || ""} onChange={(e) => set("longDescription", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Context</label>
                <textarea rows={3} value={formData.context || ""} onChange={(e) => set("context", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Key highlights, one per line</label>
                <textarea
                  rows={4}
                  value={(formData.highlights || []).join("\n")}
                  onChange={(e) => set("highlights", e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
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
                  value={(formData.features || []).join("\n")}
                  onChange={(e) => set("features", e.target.value.split("\n").map((item) => item.trim()).filter(Boolean))}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Solution summary</label>
                <textarea rows={3} value={formData.solution || ""} onChange={(e) => set("solution", e.target.value)} style={fieldStyle} />
              </div>
            </>
          )}

          {tab === "role" && (
            <>
              <div>
                <label style={labelStyle}>My role</label>
                <input type="text" value={formData.myRole || ""} onChange={(e) => set("myRole", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>What I built</label>
                <textarea rows={5} value={formData.whatIBuilt || ""} onChange={(e) => set("whatIBuilt", e.target.value)} style={fieldStyle} />
              </div>
            </>
          )}

          {tab === "stack" && (
            <div>
              <label style={labelStyle}>Technologies, separated by commas</label>
              <input
                type="text"
                value={(formData.technologies || []).join(", ")}
                onChange={(e) => set("technologies", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
                style={fieldStyle}
              />
            </div>
          )}

          {tab === "results" && (
            <>
              <div>
                <label style={labelStyle}>Outcome</label>
                <textarea rows={3} value={formData.outcome || ""} onChange={(e) => set("outcome", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Result / impact (verified only)</label>
                <textarea rows={3} value={formData.result || ""} onChange={(e) => set("result", e.target.value)} style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.875rem" }}>
                <div>
                  <label style={labelStyle}>Quote (only with permission)</label>
                  <textarea rows={2} value={formData.quote || ""} onChange={(e) => set("quote", e.target.value)} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Quote attribution</label>
                  <input type="text" value={formData.quoteBy || ""} onChange={(e) => set("quoteBy", e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Case study file</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input type="text" value={formData.caseStudyFile || ""} onChange={(e) => set("caseStudyFile", e.target.value)} style={fieldStyle} />
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
                <label style={{ ...labelStyle, marginBottom: "0.45rem" }}>Images</label>
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
                <label style={labelStyle}>Screenshot captions, one per line</label>
                <textarea
                  rows={3}
                  value={(formData.screenshotCaptions || []).join("\n")}
                  onChange={(e) => set("screenshotCaptions", e.target.value.split("\n"))}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={{ ...labelStyle, marginBottom: "0.45rem" }}>Videos</label>
                <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                  {projectVideos(formData).map((src, index) => (
                    <div key={`${src}-${index}`} style={{ width: "11rem" }}>
                      <div style={{ height: "8.5rem", borderRadius: "0.85rem", background: "#07111f", color: "#fff", display: "grid", placeItems: "center", fontSize: "0.75rem" }}>
                        Video {index + 1}
                      </div>
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
                          videoPoster: prev.image,
                        })),
                      )
                    }
                  >
                    <RiImageAddLine size={28} />
                  </button>
                </div>
              </div>
            </>
          )}

          {tab === "challenges" && (
            <>
              <div>
                <label style={labelStyle}>Challenge</label>
                <textarea rows={4} value={formData.challenge || ""} onChange={(e) => set("challenge", e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Problem</label>
                <textarea rows={4} value={formData.problem || ""} onChange={(e) => set("problem", e.target.value)} style={fieldStyle} />
              </div>
            </>
          )}

          {tab === "learned" && (
            <div>
              <label style={labelStyle}>What I learned</label>
              <textarea rows={6} value={formData.learned || ""} onChange={(e) => set("learned", e.target.value)} style={fieldStyle} />
            </div>
          )}

          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-3)" }}>
            Do not add visitor counts, revenue, or other numbers taken from a screenshot.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem" }}>
              <RiSaveLine size={16} /> Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
