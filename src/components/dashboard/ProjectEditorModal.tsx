"use client";

import { useState, useEffect } from "react";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiFolderLine } from "react-icons/ri";
import { Project } from "@/data/site-data";
import CustomSelect from "@/components/ui/CustomSelect";

function projectVideos(project: Partial<Project>) {
  return project.videos?.length ? project.videos : project.video ? [project.video] : [];
}

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
  selectedMediaUrl,
}: ProjectEditorModalProps) {
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

  useEffect(() => {
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

  useEffect(() => {
    if (selectedMediaUrl) {
      setFormData((prev) => ({ ...prev, image: selectedMediaUrl }));
    }
  }, [selectedMediaUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    onSave(formData as Project);
    onClose();
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
          borderRadius: "0.5rem", // Small radius
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiFolderLine style={{ color: "var(--color-primary)" }} /> {project ? "Edit Project" : "Add New Project"}
          </h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }}>
            <RiCloseLine size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "grid", gap: "1rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Project Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lerony E-Commerce"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Category
              </label>
              <CustomSelect
                value={formData.category || "web"}
                options={[
                  { value: "web", label: "Web Application" },
                  { value: "mobile", label: "Mobile App" },
                  { value: "ai", label: "AI / Machine Learning" },
                  { value: "saas", label: "SaaS Product" },
                  { value: "open-source", label: "Open Source" },
                  { value: "systems", label: "Systems" },
                  { value: "product", label: "Product" },
                  { value: "other", label: "Other" },
                ]}
                onChange={(value) => setFormData({ ...formData, category: value as Project["category"] })}
              />
              {formData.category === "other" ? (
                <input
                  type="text"
                  placeholder="Name this category"
                  value={formData.categoryNote || ""}
                  onChange={(e) => setFormData({ ...formData, categoryNote: e.target.value })}
                  style={{ width: "100%", marginTop: "0.4rem", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
                />
              ) : null}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.45rem" }}>
              Images
            </label>
            <div style={{ display: "flex", gap: "0.7rem", alignItems: "stretch", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 18rem", minHeight: "14rem", borderRadius: "0.85rem", overflow: "hidden", border: "1px solid var(--color-border)", background: "#0b192c" }}>
                {formData.image && !formData.image.includes("placeholder") ? (
                  <img src={formData.image} alt="" style={{ width: "100%", height: "14rem", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "14rem", display: "grid", placeItems: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Preview</div>
                )}
              </div>
              {(formData.screenshots || []).map((src, index) => (
                <div key={`${src}-${index}`} style={{ width: "11rem" }}>
                  <img src={src} alt="" style={{ width: "11rem", height: "8.5rem", objectFit: "cover", borderRadius: "0.85rem", border: "1px solid var(--color-border)" }} />
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFormData((prev) => ({ ...prev, screenshots: (prev.screenshots || []).filter((_, shot) => shot !== index), image: prev.image === src ? (prev.screenshots || []).find((item) => item !== src) || "" : prev.image }))}>Remove</button>
                </div>
              ))}
              <button type="button" className="media-add-card" aria-label="Add image" onClick={() => onPickMedia((url) => setFormData((prev) => ({ ...prev, image: prev.image && !prev.image.includes("placeholder") ? prev.image : url, screenshots: [...(prev.screenshots || []), url] })))}>
                <RiImageAddLine size={28} />
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.45rem" }}>
              Videos
            </label>
            <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
              {projectVideos(formData).map((src, index) => (
                <div key={`${src}-${index}`} style={{ width: "11rem" }}>
                  <div style={{ height: "8.5rem", borderRadius: "0.85rem", background: "#07111f", color: "#fff", display: "grid", placeItems: "center", fontSize: "0.75rem" }}>Video {index + 1}</div>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFormData((prev) => ({ ...prev, videos: projectVideos(prev).filter((_, videoIndex) => videoIndex !== index), video: projectVideos(prev).filter((_, videoIndex) => videoIndex !== index)[0] || "" }))}>Remove</button>
                </div>
              ))}
              <button type="button" className="media-add-card" aria-label="Add video" onClick={() => onPickMedia((url) => setFormData((prev) => ({ ...prev, videos: [...projectVideos(prev), url], video: prev.video || url, videoPoster: prev.image })))}>
                <RiImageAddLine size={28} />
              </button>
            </div>
            <p style={{ margin: "0.45rem 0 0", fontSize: "0.75rem", color: "var(--color-text-3)" }}>Videos stay unloaded on the public site until someone presses play.</p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Short Description (Card summary)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                The Problem
              </label>
              <textarea
                rows={3}
                placeholder="What problem were you solving?"
                value={formData.problem || ""}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                What I Built
              </label>
              <textarea
                rows={3}
                placeholder="How did you solve it?"
                value={formData.whatIBuilt || ""}
                onChange={(e) => setFormData({ ...formData, whatIBuilt: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                My Role
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Lead Developer, Full Stack..."
                value={formData.myRole || ""}
                onChange={(e) => setFormData({ ...formData, myRole: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Result / Impact
              </label>
              <textarea
                rows={2}
                placeholder="What was the outcome?"
                value={formData.result || ""}
                onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                Live Application URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.links?.live || ""}
                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, live: e.target.value } })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
                GitHub Repository URL
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.links?.github || ""}
                onChange={(e) => setFormData({ ...formData, links: { ...formData.links, github: e.target.value } })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Tagline</label>
              <input type="text" value={formData.tagline || ""} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Client / organization</label>
              <input type="text" value={formData.organization || ""} onChange={(e) => setFormData({ ...formData, organization: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Duration</label>
              <input type="text" placeholder="Only if the dates are verified" value={formData.period || ""} onChange={(e) => setFormData({ ...formData, period: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Script line</label>
              <input type="text" value={formData.flourish || ""} onChange={(e) => setFormData({ ...formData, flourish: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Key highlights, one per line</label>
            <textarea rows={3} value={(formData.highlights || []).join("\n")} onChange={(e) => setFormData({ ...formData, highlights: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Features, one per line</label>
            <textarea rows={3} value={(formData.features || []).join("\n")} onChange={(e) => setFormData({ ...formData, features: e.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>What I learned</label>
            <textarea rows={3} value={formData.learned || ""} onChange={(e) => setFormData({ ...formData, learned: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Quote</label>
              <textarea rows={2} placeholder="Leave empty unless you have permission to publish it" value={formData.quote || ""} onChange={(e) => setFormData({ ...formData, quote: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Quote attribution</label>
              <input type="text" value={formData.quoteBy || ""} onChange={(e) => setFormData({ ...formData, quoteBy: e.target.value })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Case study file</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input type="text" value={formData.caseStudyFile || ""} onChange={(e) => setFormData({ ...formData, caseStudyFile: e.target.value })} style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onPickMedia((url) => setFormData((prev) => ({ ...prev, caseStudyFile: url })))}>Choose file</button>
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>Screenshot captions, one per line, in image order</label>
            <textarea rows={3} value={(formData.screenshotCaptions || []).join("\n")} onChange={(e) => setFormData({ ...formData, screenshotCaptions: e.target.value.split("\n") })} style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Technologies, separated by commas
            </label>
            <input
              type="text"
              value={(formData.technologies || []).join(", ")}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "0.8rem", fontWeight: 600 }}>
            <input type="checkbox" checked={Boolean(formData.featured)} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
            Featured case
          </label>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--color-text-3)" }}>Do not add visitor counts, revenue, or other numbers taken from a screenshot.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm" style={{ borderRadius: "0.375rem" }}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
              <RiSaveLine size={16} /> Save Project
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
