"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiEditLine,
  RiRefreshLine,
  RiSearchLine,
} from "react-icons/ri";
import { projects as initialProjects, type Project } from "@/data/site-data";
import ProjectEditorModal from "@/components/dashboard/ProjectEditorModal";
import MediaManagerModal from "@/components/dashboard/MediaManagerModal";
import { fetchRemoteSettings, getLocalSettings, saveLocalSettings } from "@/lib/supabase";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import { mergeProjectCatalog } from "@/lib/projects";
import { downloadCsv } from "@/lib/download-csv";

const PAGE_SIZE = 10;

function projectsFromSettings(): Project[] {
  return mergeProjectCatalog(getLocalSettings().projectRecords);
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
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const { runSave } = useDashboardFeedback();

  useEffect(() => {
    setProjectsList(projectsFromSettings());
    void fetchRemoteSettings().then((remote) => {
      if (remote) setProjectsList(mergeProjectCatalog(remote.projectRecords));
    });
  }, []);

  useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [exportOpen]);

  const persist = async (next: Project[]) => {
    setProjectsList(next);
    await saveLocalSettings({ projectRecords: next });
  };

  const handleSaveProject = (proj: Project) => {
    const exists = projectsList.some((item) => item.id === proj.id);
    let next = exists
      ? projectsList.map((item) => (item.id === proj.id ? proj : item))
      : [proj, ...projectsList];
    if (proj.homepagePinned) {
      next = next.map((item) =>
        item.id === proj.id ? { ...item, homepagePinned: true } : { ...item, homepagePinned: false },
      );
    }
    void runSave(() => persist(next), "Project saved.");
  };

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projectsList.filter((project) => {
      const matchesQuery =
        !needle ||
        [project.title, project.organization, project.description, ...(project.technologies || [])]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      const matchesCategory = category === "all" || project.category === category;
      const matchesStatus =
        status === "all" || project.status === status || (status === "draft" && project.visibility === "draft");
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [projectsList, query, category, status]);

  useEffect(() => {
    setPage(1);
  }, [query, category, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportRows = (scope: "filtered" | "all") => {
    const data = scope === "all" ? projectsList : filtered;
    if (!data.length) {
      setExportOpen(false);
      return;
    }
    downloadCsv(
      `projects-${scope}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Title", "Organization", "Category", "Status", "Visibility", "Technologies", "Live URL"],
      data.map((project) => [
        project.title,
        project.organization,
        project.category,
        project.status,
        project.visibility || "public",
        (project.technologies || []).join("; "),
        project.links?.live || "",
      ]),
    );
    setExportOpen(false);
  };

  return (
    <div className="dash-tm dash-projects">
      <header className="dash-tm-head">
        <div>
          <p className="section-label">Portfolio</p>
          <h1>Projects ({projectsList.length})</h1>
          <p>Search, filter, and keep case images from loading until a visitor opens them.</p>
        </div>
        <div className="dash-tm-head-actions">
          <div className="dash-export" ref={exportRef}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              aria-expanded={exportOpen}
              aria-haspopup="menu"
              onClick={() => setExportOpen((open) => !open)}
            >
              <RiDownloadLine size={15} /> Export
            </button>
            {exportOpen ? (
              <div className="dash-export-menu" role="menu">
                <button type="button" role="menuitem" onClick={() => exportRows("filtered")}>
                  Export filtered CSV
                </button>
                <button type="button" role="menuitem" onClick={() => exportRows("all")}>
                  Export all CSV
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setProjectsList(projectsFromSettings());
              void fetchRemoteSettings().then((remote) => {
                if (remote) setProjectsList(mergeProjectCatalog(remote.projectRecords));
              });
            }}
          >
            <RiRefreshLine size={15} /> Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm projects-new-btn"
            onClick={() => {
              setEditingProject(null);
              setIsProjectModalOpen(true);
            }}
          >
            <RiAddLine size={16} /> New Project
          </button>
        </div>
      </header>

      <div className="dash-tm-toolbar">
        <label className="dash-tm-search">
          <RiSearchLine size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, organization, technology…"
            aria-label="Search projects"
          />
        </label>
        <label className="dash-tm-filter">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All categories</option>
            <option value="systems">Systems</option>
            <option value="web">Web</option>
            <option value="product">Product</option>
            <option value="saas">Company</option>
            <option value="technology">Technology</option>
            <option value="ai">AI</option>
            <option value="mobile">Mobile</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="dash-tm-filter">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="live">Live</option>
            <option value="staging">Staging</option>
            <option value="completed">Completed</option>
            <option value="ongoing">Ongoing</option>
            <option value="in-progress">In progress</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft visibility</option>
          </select>
        </label>
        <p className="dash-tm-result-count" aria-live="polite">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="dash-tm-empty">No projects match this filter.</p>
      ) : (
        <>
          <div className="dash-tm-table-wrap">
            <table className="dash-tm-table is-compact dash-projects-table">
              <thead>
                <tr>
                  <th scope="col">Cover</th>
                  <th scope="col">Project</th>
                  <th scope="col">Category</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((project) => (
                  <tr key={project.id}>
                    <td>
                      {project.image && !project.image.includes("placeholder") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="dash-projects-cover" src={project.image} alt="" />
                      ) : (
                        <span className="dash-projects-cover is-empty">No image</span>
                      )}
                    </td>
                    <td>
                      <div className="dash-tm-person is-compact dash-projects-person">
                        <div className="dash-tm-person-copy">
                          <strong>{project.title}</strong>
                          <span>
                            {project.homepagePinned ? "Pinned · " : ""}
                            {project.organization || project.technologies.slice(0, 3).join(", ") || "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="dash-projects-meta">{project.category}</span>
                    </td>
                    <td>
                      <span className={`dash-tm-status is-${project.status === "live" ? "published" : "draft"}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <div className="dash-tm-row-actions is-compact">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditingProject(project);
                            setIsProjectModalOpen(true);
                          }}
                        >
                          <RiEditLine size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm dash-tm-delete"
                          aria-label={`Delete ${project.title}`}
                          onClick={() =>
                            void runSave(
                              () => persist(projectsList.filter((item) => item.id !== project.id)),
                              "Project deleted.",
                            )
                          }
                        >
                          <RiDeleteBinLine size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-tm-pager" aria-label="Pagination">
            {currentPage > 1 ? (
              <button
                type="button"
                className="dash-tm-page-link"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Previous</span>
            )}
            <span className="dash-tm-page-status">
              Page {currentPage} of {pages}
            </span>
            {currentPage < pages ? (
              <button
                type="button"
                className="dash-tm-page-link"
                onClick={() => setPage((value) => Math.min(pages, value + 1))}
              >
                Next
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Next</span>
            )}
          </div>
        </>
      )}

      <div className="projects-page-foot">
        <button
          type="button"
          onClick={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
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
        onPickMedia={(apply) => {
          setMediaApply(() => apply);
          setIsMediaOpen(true);
        }}
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
