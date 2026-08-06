"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RiCloseLine, RiSaveLine, RiImageAddLine, RiFolderLine } from "react-icons/ri";
import { Project } from "@/data/site-data";

interface ProjectEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (savedProject: Project) => void;
  onOpenMedia: () => void;
  selectedMediaUrl?: string;
}

export default function ProjectEditorModal({
  isOpen,
  onClose,
  project,
  onSave,
  onOpenMedia,
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
          maxWidth: "40rem",
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
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              >
                <option value="web">Web Application</option>
                <option value="mobile">Mobile App</option>
                <option value="ai">AI / Machine Learning</option>
                <option value="saas">SaaS Product</option>
                <option value="open-source">Open Source</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Project Cover Image
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem" }}
              />
              <button type="button" onClick={onOpenMedia} className="btn btn-outline btn-sm" style={{ gap: "0.375rem", borderRadius: "0.375rem" }}>
                <RiImageAddLine size={16} /> Library
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-2)", marginBottom: "0.25rem" }}>
              Short Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "0.375rem", background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)", fontSize: "0.8125rem", outline: "none" }}
            />
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
