"use client";

import { useEffect, useMemo, useState } from "react";
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine } from "react-icons/ri";
import { projects as initialProjects, type Project } from "@/data/site-data";
import ProjectEditorModal from "@/components/dashboard/ProjectEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { fetchRemoteSettings, getLocalSettings, saveLocalSettings } from "@/lib/supabase";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import CustomSelect from "@/components/ui/CustomSelect";

const PAGE_SIZE = 5;

function projectsFromSettings(): Project[] {
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
  const { runSave } = useDashboardFeedback();

  useEffect(() => {
    setProjectsList(projectsFromSettings());
    void fetchRemoteSettings().then((remote) => {
      if (remote?.projectRecords?.length) setProjectsList(remote.projectRecords);
    });
  }, []);

  const persist = async (next: Project[]) => {
    setProjectsList(next);
    await saveLocalSettings({ projectRecords: next });
  };

  const handleSaveProject = (proj: Project) => {
    const exists = projectsList.some((item) => item.id === proj.id);
    const next = exists
      ? projectsList.map((item) => (item.id === proj.id ? proj : item))
      : [proj, ...projectsList];
    void runSave(() => persist(next), "Project saved.");
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
    <div className="projects-page" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="projects-page-head dash-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a" }}>Portfolio Projects ({projectsList.length})</h2>
          <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: "0.15rem" }}>Search, filter, and keep case images from loading until a visitor opens them.</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
          className="btn btn-primary btn-sm projects-new-btn"
          style={{ gap: "0.375rem" }}
        >
          <RiAddLine size={16} /> New Project
        </button>
      </div>

      <div className="projects-page-filters" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", flex: "1 1 14rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "0.5rem", padding: "0.4rem 0.65rem" }}>
          <RiSearchLine size={15} color="#64748b" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search title, organization, technology" style={{ border: 0, outline: "none", width: "100%", fontSize: "0.82rem" }} />
        </label>
        <CustomSelect
          value={category}
          aria-label="Category"
          options={[
            { value: "all", label: "All categories" },
            { value: "systems", label: "Systems" },
            { value: "web", label: "Web" },
            { value: "product", label: "Product" },
            { value: "saas", label: "Company" },
            { value: "technology", label: "Technology" },
            { value: "ai", label: "AI" },
            { value: "mobile", label: "Mobile" },
            { value: "other", label: "Other" },
          ]}
          onChange={(value) => {
            setCategory(value);
            setPage(1);
          }}
          className="dash-cselect"
        />
        <CustomSelect
          value={status}
          aria-label="Status"
          options={[
            { value: "all", label: "All statuses" },
            { value: "live", label: "Live" },
            { value: "in-progress", label: "In progress" },
            { value: "archived", label: "Archived" },
          ]}
          onChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
          className="dash-cselect"
        />
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
                  <button className="btn btn-ghost btn-sm" style={{ color: "#ef4444" }} onClick={() => void runSave(() => persist(projectsList.filter((item) => item.id !== project.id)), "Project deleted.")} aria-label={`Delete ${project.title}`}><RiDeleteBinLine size={15} /></button>
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
        <nav className="page-text-nav" aria-label="Project pages">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
          <span>{currentPage} of {pages}</span>
          <button type="button" disabled={currentPage >= pages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </nav>
      </div>

      <div className="projects-page-foot" aria-hidden={false}>
        <button
          type="button"
          onClick={() => { setEditingProject(null); setIsProjectModalOpen(true); }}
          className="btn btn-primary projects-new-btn-mobile"
        >
          <RiAddLine size={16} /> New Project
        </button>
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

const th = { padding: "0.75rem 0.85rem", fontWeight: 800 } as const;
const td = { padding: "0.75rem 0.85rem", fontSize: "0.82rem", color: "#334155", verticalAlign: "middle" } as const;
