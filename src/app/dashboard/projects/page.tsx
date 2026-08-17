"use client";

import { useState } from "react";
import { RiAddLine, RiEditLine, RiDeleteBinLine } from "react-icons/ri";

import { projects as initialProjects, Project } from "@/data/site-data";
import ProjectEditorModal from "@/components/dashboard/ProjectEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaTargetCallback, setMediaTargetCallback] = useState<((url: string) => void) | null>(null);

  const handleSaveProject = (proj: Project) => {
    const exists = projectsList.find((p) => p.id === proj.id);
    if (exists) {
      setProjectsList(projectsList.map((p) => (p.id === proj.id ? proj : p)));
    } else {
      setProjectsList([proj, ...projectsList]);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjectsList(projectsList.filter((p) => p.id !== id));
  };

  const triggerMediaPicker = (callback: (url: string) => void) => {
    setMediaTargetCallback(() => callback);
    setIsMediaOpen(true);
  };

  const handleMediaSelect = (url: string) => {
    if (mediaTargetCallback) {
      mediaTargetCallback(url);
      setMediaTargetCallback(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>
            Portfolio Projects ({projectsList.length})
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>
            Manage engineering showcase items, live links, and categories.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          className="btn btn-primary btn-sm"
          style={{ gap: "0.375rem", borderRadius: "0.375rem" }}
        >
          <RiAddLine size={16} /> New Project
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {projectsList.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "0.375rem", background: "#ffffff", border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            <div>
              <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "#0f172a" }}>{p.title}</h4>
              <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.1rem" }}>
                {p.category.toUpperCase()} • {p.technologies.slice(0, 4).join(", ")}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={() => {
                  setEditingProject(p);
                  setIsProjectModalOpen(true);
                }}
                className="btn btn-outline btn-sm"
                style={{ gap: "0.25rem", borderRadius: "0.25rem" }}
              >
                <RiEditLine size={13} /> Edit
              </button>
              <button
                onClick={() => handleDeleteProject(p.id)}
                className="btn btn-ghost btn-sm"
                style={{ color: "#ef4444", padding: "0.375rem", borderRadius: "0.25rem" }}
                title="Delete Project"
              >
                <RiDeleteBinLine size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ProjectEditorModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        onOpenMedia={() => triggerMediaPicker((url) => setEditingProject((prev) => (prev ? { ...prev, image: url } : null)))}
      />

      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={handleMediaSelect}
      />
    </div>
  );
}
