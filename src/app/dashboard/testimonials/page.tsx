"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiChatQuoteLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiDownloadLine,
  RiEditLine,
  RiEyeLine,
  RiImageAddLine,
  RiLoader4Line,
  RiRefreshLine,
  RiSearchLine,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import { dismissOnBackdrop, useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { downloadCsv } from "@/lib/download-csv";
import { listListedProjects } from "@/lib/projects";
import { fetchRemoteSettings, getLocalSettings, saveLocalSettings, type SiteSettings } from "@/lib/supabase";
import {
  PLACEHOLDER_BANNER,
  type AdminTestimonial,
  type TestimonialSource,
  type TestimonialStatus,
} from "@/lib/testimonials";

type TestimonialsDisplay = NonNullable<SiteSettings["testimonialsDisplay"]>;

type Counts = {
  all: number;
  draft: number;
  submitted: number;
  confirmed: number;
  published: number;
  declined: number;
};

type StatusFilter = TestimonialStatus | "all";
type SourceFilter = TestimonialSource | "all";
type FlagFilter = "all" | "verified" | "unverified" | "featured" | "placeholder";

type ConfirmAction =
  | { type: "delete"; item: AdminTestimonial }
  | { type: "decline"; item: AdminTestimonial }
  | { type: "reset"; item: AdminTestimonial };

const PAGE_SIZE = 10;

const STATUS_OPTIONS: { id: StatusFilter; label: string; countKey: keyof Counts }[] = [
  { id: "all", label: "All", countKey: "all" },
  { id: "draft", label: "Drafts", countKey: "draft" },
  { id: "submitted", label: "Submitted", countKey: "submitted" },
  { id: "confirmed", label: "Confirmed", countKey: "confirmed" },
  { id: "published", label: "Published", countKey: "published" },
  { id: "declined", label: "Declined", countKey: "declined" },
];

type EditDraft = {
  id: string;
  person_name: string;
  person_title: string;
  organization: string;
  location: string;
  relationship: string;
  project_id: string;
  project_title_other: string;
  photo_url: string;
  profile_url: string;
  testified_on: string;
  body: string;
  short_body: string;
  moderation_notes: string;
  source: TestimonialSource;
  verified: boolean;
  verification_method: string;
  is_public: boolean;
  notify_on_publish: boolean;
};

type Payload = { items?: AdminTestimonial[]; counts?: Counts };

async function fetchTestimonials(): Promise<Payload> {
  const res = await fetch("/api/testimonials?scope=admin");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load");
  return data as Payload;
}

function projectSelectFrom(item: AdminTestimonial, knownIds: Set<string>) {
  const id = (item.projectId || "").trim();
  if (id === "other" || ((!id || !knownIds.has(id)) && item.projectTitleOther)) return "other";
  if (id && knownIds.has(id)) return id;
  if (id) return id;
  return "";
}

function draftFrom(item: AdminTestimonial, knownIds: Set<string> = new Set()): EditDraft {
  return {
    id: item.id,
    person_name: item.personName,
    person_title: item.personTitle || "",
    organization: item.organization || "",
    location: item.location || "",
    relationship: item.relationship || "",
    project_id: projectSelectFrom(item, knownIds),
    project_title_other: item.projectTitleOther || "",
    photo_url: item.photoUrl || "",
    profile_url: item.profileUrl || "",
    testified_on: item.testifiedOn || "",
    body: item.body,
    short_body: item.shortBody || "",
    moderation_notes: item.moderationNotes || "",
    source: item.source,
    verified: item.verified,
    verification_method: item.verificationMethod || "",
    is_public: item.isPublic,
    notify_on_publish: item.notifyOnPublish,
  };
}

function excerpt(value: string, max = 72) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function BusyLabel({ busy, children }: { busy: boolean; children: ReactNode }) {
  return (
    <>
      {busy ? <RiLoader4Line size={14} className="dash-tm-spin" aria-hidden="true" /> : null}
      {children}
    </>
  );
}

export default function DashboardTestimonialsPage() {
  const [items, setItems] = useState<AdminTestimonial[]>([]);
  const [counts, setCounts] = useState<Counts>({
    all: 0,
    draft: 0,
    submitted: 0,
    confirmed: 0,
    published: 0,
    declined: 0,
  });
  const [status, setStatus] = useState<StatusFilter>("all");
  const [source, setSource] = useState<SourceFilter>("all");
  const [flag, setFlag] = useState<FlagFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [detail, setDetail] = useState<AdminTestimonial | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [notifyAuthor, setNotifyAuthor] = useState(false);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [displayMode, setDisplayMode] = useState<TestimonialsDisplay>("live");
  const [displaySaving, setDisplaySaving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useHistoryBackClose(Boolean(draft), () => setDraft(null));
  useHistoryBackClose(Boolean(detail) && !draft && !confirm, () => setDetail(null));
  useHistoryBackClose(Boolean(confirm), () => setConfirm(null));

  useEffect(() => {
    const sync = (records?: Parameters<typeof listListedProjects>[0]) => {
      setProjects(listListedProjects(records).map((project) => ({ id: project.id, title: project.title })));
    };
    const local = getLocalSettings();
    setDisplayMode(local.testimonialsDisplay || "live");
    sync(local.projectRecords);
    let active = true;
    fetchRemoteSettings()
      .then((remote) => {
        if (!active || !remote) return;
        sync(remote.projectRecords);
        setDisplayMode(remote.testimonialsDisplay || "live");
      })
      .catch(() => {
        /* keep local catalog */
      });
    return () => {
      active = false;
    };
  }, []);

  const saveDisplayMode = async (next: TestimonialsDisplay) => {
    setDisplayMode(next);
    setDisplaySaving(true);
    setError("");
    try {
      await saveLocalSettings({ testimonialsDisplay: next });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save display setting");
    } finally {
      setDisplaySaving(false);
    }
  };

  const knownProjectIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects]);
  const isOtherProject = draft?.project_id === "other";

  const apply = useCallback((data: Payload) => {
    setItems(data.items || []);
    setCounts(
      data.counts || {
        all: 0,
        draft: 0,
        submitted: 0,
        confirmed: 0,
        published: 0,
        declined: 0,
      },
    );
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      apply(await fetchTestimonials());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load testimonials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetchTestimonials()
      .then((data) => {
        if (active) apply(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load testimonials");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apply]);

  useEffect(() => {
    setPage(1);
  }, [status, source, flag, query]);

  useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [exportOpen]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (source !== "all" && item.source !== source) return false;
      if (flag === "verified" && !item.verified) return false;
      if (flag === "unverified" && item.verified) return false;
      if (flag === "featured" && !item.featured) return false;
      if (flag === "placeholder" && item.source !== "placeholder") return false;
      if (!needle) return true;
      const haystack = [
        item.personName,
        item.personTitle,
        item.organization,
        item.relationship,
        item.projectId,
        item.projectTitleOther,
        item.submitterEmail,
        item.body,
        item.moderationNotes,
        item.source,
        item.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, status, source, flag, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const exportRows = (scope: "filtered" | "all") => {
    const data = scope === "all" ? items : filtered;
    if (!data.length) {
      setError("Nothing to export.");
      setExportOpen(false);
      return;
    }
    downloadCsv(
      `testimonials-${scope}-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        "Name",
        "Title",
        "Organization",
        "Status",
        "Source",
        "Verified",
        "Featured",
        "Email",
        "Relationship",
        "Project",
        "Body",
        "Submitted",
      ],
      data.map((item) => [
        item.personName,
        item.personTitle,
        item.organization,
        item.status,
        item.source,
        item.verified ? "yes" : "no",
        item.featured ? "yes" : "no",
        item.submitterEmail,
        item.relationship,
        item.projectTitleOther || item.projectId,
        item.body,
        item.submittedAt,
      ]),
    );
    setExportOpen(false);
  };

  const patch = async (id: string, payload: Record<string, unknown>) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      const next = data.item as AdminTestimonial | null;
      if (next?.id) {
        setItems((current) => current.map((row) => (row.id === id ? next : row)));
        setDetail((current) => (current?.id === id ? next : current));
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      return false;
    } finally {
      setBusyId("");
    }
  };

  const runConfirm = async () => {
    if (!confirm) return;
    const { type, item } = confirm;
    setConfirm(null);
    if (type === "delete") {
      setBusyId(item.id);
      setError("");
      try {
        const res = await fetch(`/api/testimonials/${item.id}`, { method: "DELETE" });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Delete failed");
        if (detail?.id === item.id) setDetail(null);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      } finally {
        setBusyId("");
      }
      return;
    }
    if (type === "decline") {
      await patch(item.id, { action: "decline" });
      return;
    }
    await patch(item.id, { action: "reset" });
  };

  const saveDraft = async () => {
    if (!draft) return;
    const selected = draft.project_id.trim();
    const isOther = selected === "other";
    const ok = await patch(draft.id, {
      person_name: draft.person_name,
      person_title: draft.person_title,
      organization: draft.organization,
      location: draft.location,
      relationship: draft.relationship,
      project_id: isOther ? "other" : selected || null,
      project_title_other: isOther ? draft.project_title_other : "",
      photo_url: draft.photo_url,
      profile_url: draft.profile_url,
      testified_on: draft.testified_on || null,
      body: draft.body,
      short_body: draft.short_body,
      moderation_notes: draft.moderation_notes,
      source: draft.source,
      verified: draft.verified,
      verification_method: draft.verification_method,
      is_public: draft.is_public,
      notify_on_publish: draft.notify_on_publish,
    });
    if (ok) setDraft(null);
  };

  const uploadPhoto = async (file: File | null) => {
    if (!draft) return;
    setPhotoError("");
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      setPhotoError("Keep the photo under 8 MB before compression.");
      return;
    }
    setPhotoUploading(true);
    try {
      const { compressImageForAvatar } = await import("@/lib/compress-image");
      const prepared = await compressImageForAvatar(file, { maxEdge: 512, quality: 0.8 });
      if (prepared.size > 2 * 1024 * 1024) {
        setPhotoError("Keep the photo under 2 MB.");
        return;
      }
      const payload = new FormData();
      payload.append("file", prepared);
      const res = await fetch("/api/testimonials/photo", { method: "POST", body: payload });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setPhotoError(
          typeof data.error === "string"
            ? data.error
            : "Could not upload the photo. You can paste a public image URL instead.",
        );
        return;
      }
      setDraft({ ...draft, photo_url: String(data.url) });
    } catch {
      setPhotoError("Could not upload the photo. You can paste a public image URL instead.");
    } finally {
      setPhotoUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const publish = async (item: AdminTestimonial) => {
    if (item.source === "placeholder") {
      setError("Replace placeholder attribution and change the source before publishing.");
      return;
    }
    const ok = await patch(item.id, {
      action: "publish",
      notifyAuthor,
      is_public: true,
      verified: true,
      verification_method: item.verificationMethod || "admin",
    });
    if (ok) setNotifyAuthor(false);
  };

  const confirmCopy =
    confirm?.type === "delete"
      ? {
          title: "Delete testimonial?",
          body: `Remove the testimonial from ${confirm.item.personName}? This cannot be undone.`,
          action: "Delete",
          danger: true,
        }
      : confirm?.type === "decline"
        ? {
            title: "Decline testimonial?",
            body: `Mark ${confirm.item.personName}'s testimonial as declined?`,
            action: "Decline",
            danger: false,
          }
        : confirm
          ? {
              title: "Reset testimonial?",
              body: `Move ${confirm.item.personName}'s testimonial back to draft?`,
              action: "Reset",
              danger: false,
            }
          : null;

  return (
    <div className="dash-tm">
      <header className="dash-tm-head">
        <div>
          <p className="section-label">Social proof</p>
          <h1>Testimonials</h1>
          <p>Draft → submitted → confirmed → published. Keep rows compact; open details to moderate.</p>
        </div>
        <div className="dash-tm-head-actions">
          <label className="dash-tm-filter dash-tm-display">
            <span>Website section</span>
            <select
              value={displayMode}
              disabled={displaySaving}
              onChange={(event) => void saveDisplayMode(event.target.value as TestimonialsDisplay)}
            >
              <option value="live">Show published</option>
              <option value="empty">Show empty state only</option>
              <option value="hidden">Hide whole section</option>
            </select>
          </label>
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
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void load()} disabled={loading}>
            {loading ? <RiLoader4Line size={15} className="dash-tm-spin" /> : <RiRefreshLine size={15} />} Refresh
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
            placeholder="Search name, org, body, email…"
            aria-label="Search testimonials"
          />
        </label>
        <label className="dash-tm-filter">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} {counts[option.countKey]}
              </option>
            ))}
          </select>
        </label>
        <label className="dash-tm-filter">
          <span>Source</span>
          <select value={source} onChange={(event) => setSource(event.target.value as SourceFilter)}>
            <option value="all">All sources</option>
            <option value="visitor">Visitor</option>
            <option value="admin">Admin</option>
            <option value="placeholder">Placeholder</option>
          </select>
        </label>
        <label className="dash-tm-filter">
          <span>Flags</span>
          <select value={flag} onChange={(event) => setFlag(event.target.value as FlagFilter)}>
            <option value="all">All flags</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
            <option value="featured">Featured</option>
            <option value="placeholder">Placeholders only</option>
          </select>
        </label>
        <p className="dash-tm-result-count" aria-live="polite">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {error ? <p className="dash-tm-error">{error}</p> : null}

      {(status === "submitted" || status === "confirmed") ? (
        <label className="dash-tm-notify dash-tm-notify-bar">
          <input
            type="checkbox"
            checked={notifyAuthor}
            onChange={(event) => setNotifyAuthor(event.target.checked)}
          />
          Email author with share link when published
        </label>
      ) : null}

      {loading ? (
        <p className="dash-tm-empty">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="dash-tm-empty">
          <RiChatQuoteLine size={20} /> Nothing matches these filters.
        </p>
      ) : (
        <>
          <div className="dash-tm-table-wrap">
            <table className="dash-tm-table is-compact">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Quote</th>
                  <th scope="col">Status</th>
                  <th scope="col">Submitted</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const busy = busyId === item.id;
                  const meta = [item.personTitle, item.organization].filter(Boolean).join(", ");
                  const canFeature = item.status === "published";
                  return (
                    <tr key={item.id} className={item.source === "placeholder" ? "is-placeholder" : undefined}>
                      <td>
                        <div className="dash-tm-person is-compact">
                          {item.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="dash-tm-avatar" src={item.photoUrl} alt="" />
                          ) : (
                            <span className="dash-tm-avatar is-initial" aria-hidden="true">
                              {item.personName.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="dash-tm-person-copy">
                            <strong>{item.personName}</strong>
                            {meta ? <span title={meta}>{excerpt(meta, 48)}</span> : null}
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="dash-tm-quote-text">{excerpt(item.body)}</p>
                      </td>
                      <td>
                        <span className={`dash-tm-status is-${item.status}`}>{item.status}</span>
                      </td>
                      <td>
                        <time dateTime={item.submittedAt}>
                          {new Date(item.submittedAt).toLocaleDateString()}
                        </time>
                      </td>
                      <td>
                        <div className="dash-tm-row-actions is-compact">
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={busy}
                            onClick={() => setDetail(item)}
                          >
                            <RiEyeLine size={14} /> Details
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={busy}
                            onClick={() => {
                              setPhotoError("");
                              setDraft(draftFrom(item, knownProjectIds));
                            }}
                          >
                            <RiEditLine size={14} /> Edit
                          </button>
                          {canFeature ? (
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              disabled={busy}
                              onClick={() =>
                                void patch(item.id, { action: item.featured ? "unfeature" : "feature" })
                              }
                            >
                              <BusyLabel busy={busy}>
                                {item.featured ? <RiStarFill size={14} /> : <RiStarLine size={14} />}
                                {item.featured ? "Unfeature" : "Feature"}
                              </BusyLabel>
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm dash-tm-delete"
                            disabled={busy}
                            aria-label={`Delete ${item.personName}`}
                            onClick={() => setConfirm({ type: "delete", item })}
                          >
                            {busy ? (
                              <RiLoader4Line size={15} className="dash-tm-spin" />
                            ) : (
                              <RiDeleteBin6Line size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="dash-tm-pager" aria-label="Pagination">
            {safePage > 1 ? (
              <button
                type="button"
                className="dash-tm-page-link"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Previous</span>
            )}
            <span className="dash-tm-page-status">
              Page {safePage} of {pageCount}
            </span>
            {safePage < pageCount ? (
              <button
                type="button"
                className="dash-tm-page-link"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              >
                Next
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Next</span>
            )}
          </div>
        </>
      )}

      {detail ? (
        <div
          className="dash-tm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Testimonial details"
          onMouseDown={dismissOnBackdrop(() => setDetail(null))}
        >
          <div className="dash-tm-modal-card dash-tm-detail" onMouseDown={(event) => event.stopPropagation()}>
            <header className="tm-form-head">
              <div>
                <p className="section-label">Details</p>
                <h2>{detail.personName}</h2>
              </div>
              <button type="button" className="tm-dialog-close" onClick={() => setDetail(null)} aria-label="Close">
                <RiCloseLine size={18} />
              </button>
            </header>

            <div className="dash-tm-detail-meta">
              <span className={`dash-tm-status is-${detail.status}`}>{detail.status}</span>
              <span className="dash-tm-pill">{detail.source}</span>
              {detail.verified ? (
                <span className="dash-tm-pill is-yes">Verified</span>
              ) : (
                <span className="dash-tm-pill is-no">Unverified</span>
              )}
              {detail.featured ? <span className="dash-tm-pill is-featured">Featured</span> : null}
              {detail.isPublic ? <span className="dash-tm-pill">Public-ready</span> : null}
            </div>

            <p className="dash-tm-detail-line">
              {[detail.personTitle, detail.organization].filter(Boolean).join(", ") || "No title / organization"}
            </p>
            <p className="dash-tm-detail-line">{detail.submitterEmail || "No email"}</p>
            {detail.relationship || detail.projectId || detail.projectTitleOther ? (
              <p className="dash-tm-detail-line">
                {[detail.relationship, detail.projectTitleOther || detail.projectId].filter(Boolean).join(" · ")}
              </p>
            ) : null}

            {error && busyId !== detail.id ? <p className="dash-tm-error">{error}</p> : null}
            {detail.source === "placeholder" ? <p className="dash-tm-banner">{PLACEHOLDER_BANNER}</p> : null}
            {detail.moderationNotes ? <p className="dash-tm-notes">Note: {detail.moderationNotes}</p> : null}

            <blockquote className="dash-tm-detail-quote" style={{ whiteSpace: "pre-wrap" }}>
              {detail.body}
            </blockquote>

            <div className="dash-tm-detail-actions">
              {detail.status === "submitted" || detail.status === "draft" ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busyId === detail.id}
                  onClick={() => void patch(detail.id, { action: "confirm" })}
                >
                  <BusyLabel busy={busyId === detail.id}>
                    <RiCheckLine size={14} /> Confirm
                  </BusyLabel>
                </button>
              ) : null}

              {detail.status !== "published" && detail.status !== "declined" ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busyId === detail.id || detail.source === "placeholder"}
                  title={
                    detail.source === "placeholder"
                      ? "Replace placeholder attribution before publishing"
                      : undefined
                  }
                  onClick={() => void publish(detail)}
                >
                  <BusyLabel busy={busyId === detail.id}>
                    <RiCheckLine size={14} /> Publish
                  </BusyLabel>
                </button>
              ) : null}

              {detail.status !== "declined" ? (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={busyId === detail.id}
                  onClick={() => setConfirm({ type: "decline", item: detail })}
                >
                  <RiCloseLine size={14} /> Decline
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={busyId === detail.id}
                  onClick={() => setConfirm({ type: "reset", item: detail })}
                >
                  Reset
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={busyId === detail.id}
                onClick={() => {
                  setDetail(null);
                  setPhotoError("");
                  setDraft(draftFrom(detail, knownProjectIds));
                }}
              >
                <RiEditLine size={14} /> Edit
              </button>

              {detail.status === "published" ? (
                <>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busyId === detail.id}
                    onClick={() =>
                      void patch(detail.id, { action: detail.featured ? "unfeature" : "feature" })
                    }
                  >
                    <BusyLabel busy={busyId === detail.id}>
                      {detail.featured ? <RiStarFill size={14} /> : <RiStarLine size={14} />}
                      {detail.featured ? "Unfeature" : "Feature"}
                    </BusyLabel>
                  </button>
                  <span className="dash-tm-reorder">
                    <button
                      type="button"
                      title="Move up"
                      aria-label={`Move ${detail.personName} up`}
                      disabled={busyId === detail.id}
                      onClick={() => void patch(detail.id, { action: "move", direction: "up" })}
                    >
                      <RiArrowUpLine size={15} />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      aria-label={`Move ${detail.personName} down`}
                      disabled={busyId === detail.id}
                      onClick={() => void patch(detail.id, { action: "move", direction: "down" })}
                    >
                      <RiArrowDownLine size={15} />
                    </button>
                  </span>
                </>
              ) : null}

              <button
                type="button"
                className="btn btn-ghost btn-sm dash-tm-delete"
                disabled={busyId === detail.id}
                onClick={() => setConfirm({ type: "delete", item: detail })}
              >
                <RiDeleteBin6Line size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirm && confirmCopy ? (
        <div className="dash-sheet-layer" role="presentation">
          <button
            type="button"
            className="dash-sheet-backdrop"
            aria-label="Dismiss confirmation"
            onClick={() => setConfirm(null)}
          />
          <div className="dash-sheet" role="dialog" aria-modal="true" aria-labelledby="dash-tm-confirm-title">
            <div className="dash-sheet-handle" aria-hidden="true" />
            <h2 id="dash-tm-confirm-title">{confirmCopy.title}</h2>
            <p>{confirmCopy.body}</p>
            <div className="dash-sheet-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${confirmCopy.danger ? "btn-primary dash-tm-confirm-danger" : "btn-primary"}`}
                onClick={() => void runConfirm()}
              >
                {confirmCopy.action}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {draft ? (
        <div
          className="dash-tm-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Edit testimonial"
          onMouseDown={dismissOnBackdrop(() => setDraft(null))}
        >
          <div className="dash-tm-modal-card tm-dialog-panel" onMouseDown={(event) => event.stopPropagation()}>
            <header className="tm-form-head">
              <div>
                <p className="section-label">Moderate</p>
                <h2>Edit testimonial</h2>
              </div>
              <button type="button" className="tm-dialog-close" onClick={() => setDraft(null)} aria-label="Close">
                <RiCloseLine size={18} />
              </button>
            </header>

            {draft.source === "placeholder" ? <p className="dash-tm-banner">{PLACEHOLDER_BANNER}</p> : null}

            <div className="tm-form dash-tm-edit-form">
              <div className="tm-photo-block">
                <label className="tm-photo-pick" aria-label={draft.photo_url.trim() ? "Replace profile photo" : "Upload profile photo"}>
                  {draft.photo_url.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.photo_url.trim()} alt="" />
                  ) : photoUploading ? (
                    <RiLoader4Line size={22} className="dash-tm-spin" />
                  ) : (
                    <RiImageAddLine size={22} />
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={photoUploading}
                    onChange={(event) => void uploadPhoto(event.target.files?.[0] || null)}
                  />
                </label>
                <strong className="tm-photo-name">{draft.person_name.trim() || "Profile photo"}</strong>
                <p className="tm-photo-hint">
                  {photoUploading
                    ? "Uploading…"
                    : "Click the circle to upload or replace. You can also paste a public URL."}
                </p>
                <div className="dash-tm-photo-row">
                  <input
                    className="tm-photo-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://… (public photo URL)"
                    value={draft.photo_url}
                    onChange={(event) => setDraft({ ...draft, photo_url: event.target.value })}
                    disabled={photoUploading}
                  />
                  {draft.photo_url.trim() ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setDraft({ ...draft, photo_url: "" })}
                      disabled={photoUploading}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
                {photoError ? <p className="dash-tm-error">{photoError}</p> : null}
              </div>

              <div className="tm-form-row">
                <label className="tm-field">
                  <span>Name</span>
                  <input
                    value={draft.person_name}
                    onChange={(event) => setDraft({ ...draft, person_name: event.target.value })}
                  />
                </label>
                <label className="tm-field">
                  <span>Role or title</span>
                  <input
                    value={draft.person_title}
                    onChange={(event) => setDraft({ ...draft, person_title: event.target.value })}
                  />
                </label>
              </div>

              <div className="tm-form-row">
                <label className="tm-field">
                  <span>Organization</span>
                  <input
                    value={draft.organization}
                    onChange={(event) => setDraft({ ...draft, organization: event.target.value })}
                  />
                </label>
                <label className="tm-field">
                  <span>Location</span>
                  <input
                    value={draft.location}
                    onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                  />
                </label>
              </div>

              <div className="tm-form-row">
                <label className="tm-field">
                  <span>Relationship</span>
                  <input
                    value={draft.relationship}
                    onChange={(event) => setDraft({ ...draft, relationship: event.target.value })}
                    placeholder="Client, teammate, mentor…"
                  />
                </label>
                <label className="tm-field">
                  <span>Given on</span>
                  <input
                    type="date"
                    value={draft.testified_on}
                    onChange={(event) => setDraft({ ...draft, testified_on: event.target.value })}
                  />
                </label>
              </div>

              <label className="tm-field">
                <span>Related project</span>
                <select
                  value={draft.project_id}
                  onChange={(event) => {
                    const next = event.target.value;
                    setDraft({
                      ...draft,
                      project_id: next,
                      project_title_other: next === "other" ? draft.project_title_other : "",
                    });
                  }}
                >
                  <option value="">Not tied to one project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                  {draft.project_id &&
                  draft.project_id !== "other" &&
                  !knownProjectIds.has(draft.project_id) ? (
                    <option value={draft.project_id}>{draft.project_id}</option>
                  ) : null}
                  <option value="other">Other</option>
                </select>
              </label>
              {isOtherProject ? (
                <label className="tm-field">
                  <span>Other project title</span>
                  <input
                    value={draft.project_title_other}
                    onChange={(event) => setDraft({ ...draft, project_title_other: event.target.value })}
                    placeholder="Short title only"
                  />
                </label>
              ) : null}

              <div className="tm-form-row">
                <label className="tm-field">
                  <span>Source</span>
                  <select
                    value={draft.source}
                    onChange={(event) =>
                      setDraft({ ...draft, source: event.target.value as TestimonialSource })
                    }
                  >
                    <option value="visitor">visitor</option>
                    <option value="admin">admin</option>
                    <option value="placeholder">placeholder</option>
                  </select>
                </label>
                <label className="tm-field">
                  <span>Verification method (private)</span>
                  <input
                    value={draft.verification_method}
                    onChange={(event) => setDraft({ ...draft, verification_method: event.target.value })}
                    placeholder="email reply, call, written permission…"
                  />
                </label>
              </div>

              <div className={`tm-float is-area${draft.body ? " has-value" : ""}`}>
                <span className="tm-float-icon" aria-hidden="true">
                  <RiChatQuoteLine size={16} />
                </span>
                <textarea
                  id="dash-tm-body"
                  rows={7}
                  value={draft.body}
                  onChange={(event) => setDraft({ ...draft, body: event.target.value })}
                  placeholder=" "
                  style={{ whiteSpace: "pre-wrap" }}
                />
                <label htmlFor="dash-tm-body" className="tm-float-label">
                  Testimonial <em>*</em>
                </label>
              </div>

              <label className="tm-field">
                <span>Short body (optional)</span>
                <textarea
                  rows={2}
                  value={draft.short_body}
                  onChange={(event) => setDraft({ ...draft, short_body: event.target.value })}
                />
              </label>

              <label className="tm-field">
                <span>Private moderation note</span>
                <textarea
                  rows={3}
                  value={draft.moderation_notes}
                  onChange={(event) => setDraft({ ...draft, moderation_notes: event.target.value })}
                  placeholder="Never shown publicly."
                />
              </label>

              <fieldset className="dash-tm-modal-checks">
                <legend className="dash-tm-checks-legend">Publishing flags</legend>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.verified}
                    onChange={(event) => setDraft({ ...draft, verified: event.target.checked })}
                  />
                  Verified
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.is_public}
                    onChange={(event) => setDraft({ ...draft, is_public: event.target.checked })}
                  />
                  Public when published
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={draft.notify_on_publish}
                    onChange={(event) => setDraft({ ...draft, notify_on_publish: event.target.checked })}
                  />
                  Notify author on publish
                </label>
              </fieldset>

              <div className="tm-form-nav is-double">
                <button type="button" className="btn btn-outline" onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void saveDraft()}
                  disabled={
                    Boolean(busyId) ||
                    photoUploading ||
                    !draft.person_name.trim() ||
                    !draft.body.trim() ||
                    (isOtherProject && !draft.project_title_other.trim())
                  }
                >
                  {busyId === draft.id ? (
                    <>
                      <RiLoader4Line size={15} className="dash-tm-spin" /> Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
