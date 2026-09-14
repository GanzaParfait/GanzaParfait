"use client";

import { useEffect, useMemo, useState } from "react";
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine } from "react-icons/ri";
import { projects as initialProjects, type Project } from "@/data/site-data";
import ProjectEditorModal from "@/components/dashboard/ProjectEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { getLocalSettings, saveLocalSettings } from "@/lib/supabase";

const PAGE_SIZE = 6;
const STORAGE_KEY = "ppg_dashboard_projects";

function storedProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Project[];
  } catch {
    /* keep the verified list */
  }
  const remote = getLocalSettings().projectRecords;
  return remote?.length ? remote : initialProjects;
}

export default function ProjectsPage() {
  const [projectsList, setProjectsList] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [mediaApply, setMediaApply] = useState<((url: string) => void) | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setProjectsList(storedProjects());
  }, []);

  const persist = (next: Project[]) => {
    setProjectsList(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    saveLocalSettings({ projectRecords: next });
  };

  const handleSaveProject = (proj: Project) => {
    const exists = projectsList.some((item) => item.id === proj.id);
    persist(exists ? projectsList.map((item) => (item.id === proj.id ? proj : item)) : [proj, ...projectsList]);
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projectsList.filter((project) => {
      const matchesQuery = !needle || [project.title, project.organization, project.description, project.technologies.join(" ")].join(" ").toLowerCase().includes(needle);
      const matchesCategory = category === "all" || project.category === category;
      const matchesStatus = status === "all" || project.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [projectsList, query, category, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>Portfolio Projects ({projectsList.length})</h2>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>Search, filter, and keep case images from loading until a visitor opens them.</p>
        </div>
        <button onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }} className="btn btn-primary btn-sm" style={{ gap: "0.375rem" }}>
          <RiAddLine size={16} /> New Project
        </button>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", flex: "1 1 14rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.4rem 0.65rem" }}>
          <RiSearchLine size={15} color="#64748b" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title, organization, technology" style={{ border: 0, outline: "none", width: "100%", fontSize: "0.82rem" }} />
        </label>
        <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }} style={selectStyle}>
          <option value="all">All categories</option>
          <option value="systems">Systems</option>
          <option value="web">Web</option>
          <option value="product">Product</option>
          <option value="saas">SaaS</option>
          <option value="ai">AI</option>
          <option value="mobile">Mobile</option>
        </select>
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} style={selectStyle}>
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="in-progress">In progress</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.75rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "42rem" }}>
          <thead>
            <tr style={{ textAlign: "left", fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase", color: "#64748b" }}>
              <th style={th}>Cover</th>
              <th style={th}>Project</th>
              <th style={th}>Category</th>
              <th style={th}>Status</th>
              <th style={th} />
            </tr>
          </thead>
          <tbody>
            {rows.map((project) => (
              <tr key={project.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                <td style={td}>
                  {project.image && !project.image.includes("placeholder") ? (
                    <img src={project.image} alt="" width={72} height={44} style={{ width: "4.5rem", height: "2.75rem", objectFit: "cover", borderRadius: "0.35rem" }} />
                  ) : (
                    <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>No image</span>
                  )}
                </td>
                <td style={td}>
                  <strong style={{ display: "block", color: "#0f172a" }}>{project.title}</strong>
                  <span style={{ fontSize: "0.72rem", color: "#64748b" }}>{project.organization || project.technologies.slice(0, 3).join(", ")}</span>
                </td>
                <td style={td}>{project.category}</td>
                <td style={td}>{project.status}</td>
                <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                  <button className="btn btn-outline btn-sm" onClick={() => { setEditingProject(project); setIsProjectModalOpen(true); }}><RiEditLine size={13} /> Edit</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => persist(projectsList.filter((item) => item.id !== project.id))} aria-label={`Delete ${project.title}`}><RiDeleteBinLine size={15} /></button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr><td colSpan={5} style={{ ...td, color: "#64748b" }}>No projects match this filter.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem" }}>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#64748b" }}>{filtered.length} shown</p>
        <div style={{ display: "flex", gap: "0.4rem" }}>
          <button type="button" className="btn btn-outline btn-sm" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span style={{ fontSize: "0.8rem", alignSelf: "center" }}>{currentPage} / {pages}</span>
          <button type="button" className="btn btn-outline btn-sm" disabled={currentPage >= pages} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </div>

      <ProjectEditorModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        onPickMedia={(apply) => { setMediaApply(() => apply); setIsMediaOpen(true); }}
      />
      <MediaManagerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        onSelect={(url) => {
          if (!url.startsWith("blob:")) mediaApply?.(url);
          setMediaApply(null);
          setIsMediaOpen(false);
        }}
      />
    </div>
  );
}

const selectStyle = {
  padding: "0.45rem 0.65rem",
  borderRadius: "0.5rem",
  border: "1px solid #e2e8f0",
  background: "#fff",
  fontSize: "0.82rem",
} as const;

const th = { padding: "0.75rem 0.85rem", fontWeight: 800 } as const;
const td = { padding: "0.75rem 0.85rem", fontSize: "0.82rem", color: "#334155", verticalAlign: "middle" } as const;
