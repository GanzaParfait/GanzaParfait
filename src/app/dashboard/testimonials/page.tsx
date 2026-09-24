"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiChatQuoteLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiEditLine,
  RiRefreshLine,
  RiStarFill,
  RiStarLine,
} from "react-icons/ri";
import { dismissOnBackdrop, useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import {
  PLACEHOLDER_BANNER,
  type AdminTestimonial,
  type TestimonialSource,
  type TestimonialStatus,
} from "@/lib/testimonials";

type Counts = {
  all: number;
  draft: number;
  submitted: number;
  confirmed: number;
  published: number;
  declined: number;
};

const TABS: { id: TestimonialStatus; label: string }[] = [
  { id: "draft", label: "Drafts" },
  { id: "submitted", label: "Submitted" },
  { id: "confirmed", label: "Confirmed" },
  { id: "published", label: "Published" },
  { id: "declined", label: "Declined" },
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
  const res = await fetch("/api/testimonials");
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to load");
  return data as Payload;
}

function draftFrom(item: AdminTestimonial): EditDraft {
  return {
    id: item.id,
    person_name: item.personName,
    person_title: item.personTitle || "",
    organization: item.organization || "",
    location: item.location || "",
    relationship: item.relationship || "",
    project_id: item.projectId || "",
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
  const [tab, setTab] = useState<TestimonialStatus>("draft");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [notifyAuthor, setNotifyAuthor] = useState(false);

  useHistoryBackClose(Boolean(draft), () => setDraft(null));

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

  const visible = useMemo(() => items.filter((item) => item.status === tab), [items, tab]);

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
      await load();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      return false;
    } finally {
      setBusyId("");
    }
  };

  const remove = async (item: AdminTestimonial) => {
    if (!window.confirm(`Delete the testimonial from ${item.personName}? This cannot be undone.`)) return;
    setBusyId(item.id);
    setError("");
    try {
      const res = await fetch(`/api/testimonials/${item.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId("");
    }
  };

  const saveDraft = async () => {
    if (!draft) return;
    const ok = await patch(draft.id, {
      person_name: draft.person_name,
      person_title: draft.person_title,
      organization: draft.organization,
      location: draft.location,
      relationship: draft.relationship,
      project_id: draft.project_id,
      project_title_other: draft.project_title_other,
      photo_url: draft.photo_url,
      profile_url: draft.profile_url,
      testified_on: draft.testified_on,
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

  const publish = async (item: AdminTestimonial) => {
    if (item.source === "placeholder") {
      setError("Change the source away from placeholder and replace the dummy name before publishing.");
      return;
    }
    if (!item.verified) {
      setError("Mark the testimonial as verified in the editor before publishing.");
      return;
    }
    const ok = await patch(item.id, {
      action: "publish",
      notifyAuthor,
      is_public: true,
    });
    if (ok) setNotifyAuthor(false);
  };

  return (
    <div className="dash-tm">
      <header className="dash-tm-head">
        <div>
          <p className="section-label">Social proof</p>
          <h1>Testimonials</h1>
          <p>
            Lifecycle: draft → submitted → confirmed → published. Placeholders stay private until you replace the
            dummy attribution, change the source, and mark verified.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => void load()} disabled={loading}>
          <RiRefreshLine size={15} /> Refresh
        </button>
      </header>

      <div className="dash-tm-tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? "is-active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label} <strong>{counts[item.id]}</strong>
          </button>
        ))}
      </div>

      {error ? <p className="dash-tm-error">{error}</p> : null}

      {loading ? (
        <p className="dash-tm-empty">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="dash-tm-empty">
          <RiChatQuoteLine size={20} /> Nothing in this queue.
        </p>
      ) : (
        <ul className="dash-tm-list">
          {visible.map((item) => {
            const busy = busyId === item.id;
            const meta = [item.personTitle, item.organization].filter(Boolean).join(", ");
            const isPlaceholder = item.source === "placeholder";
            return (
              <li key={item.id} className="dash-tm-card">
                {isPlaceholder ? <p className="dash-tm-banner">{PLACEHOLDER_BANNER}</p> : null}

                <div className="dash-tm-card-head">
                  <div>
                    <strong>{item.personName}</strong>
                    {meta ? <span className="dash-tm-meta">{meta}</span> : null}
                    <span className="dash-tm-email">{item.submitterEmail || "No email"}</span>
                  </div>
                  <div className="dash-tm-flags">
                    {item.featured ? <span className="dash-tm-pill is-featured">Featured</span> : null}
                    <span className="dash-tm-pill">{item.source}</span>
                    {item.verified ? <span className="dash-tm-pill">Verified</span> : null}
                    {item.projectId ? <span className="dash-tm-pill">{item.projectId}</span> : null}
                    <span className="dash-tm-pill">{new Date(item.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <blockquote className="dash-tm-body">{item.body}</blockquote>

                {item.originalBody && item.originalBody !== item.body ? (
                  <details className="dash-tm-original">
                    <summary>Original wording</summary>
                    <p>{item.originalBody}</p>
                  </details>
                ) : null}

                {item.moderationNotes ? <p className="dash-tm-notes">Note: {item.moderationNotes}</p> : null}

                {(item.status === "submitted" || item.status === "confirmed") && !isPlaceholder ? (
                  <label className="dash-tm-notify">
                    <input
                      type="checkbox"
                      checked={notifyAuthor}
                      onChange={(event) => setNotifyAuthor(event.target.checked)}
                    />
                    Email author with share link when published
                  </label>
                ) : null}

                <div className="dash-tm-actions">
                  {item.status === "submitted" ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={busy}
                      onClick={() => void patch(item.id, { action: "confirm" })}
                    >
                      <RiCheckLine size={15} /> Confirm
                    </button>
                  ) : null}

                  {item.status === "confirmed" || item.status === "submitted" ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={busy || isPlaceholder || !item.verified}
                      title={
                        isPlaceholder
                          ? "Replace placeholder attribution before publishing"
                          : !item.verified
                            ? "Mark verified in the editor before publishing"
                            : undefined
                      }
                      onClick={() => void publish(item)}
                    >
                      <RiCheckLine size={15} /> Publish
                    </button>
                  ) : null}

                  {item.status === "draft" && !isPlaceholder ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      disabled={busy || !item.verified}
                      title={!item.verified ? "Mark verified in the editor before publishing" : undefined}
                      onClick={() => void publish(item)}
                    >
                      <RiCheckLine size={15} /> Publish
                    </button>
                  ) : null}

                  {item.status !== "declined" ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => void patch(item.id, { action: "decline" })}
                    >
                      <RiCloseLine size={15} /> Decline
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => void patch(item.id, { action: "reset" })}
                    >
                      Return to submitted
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => setDraft(draftFrom(item))}
                  >
                    <RiEditLine size={15} /> Edit
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => void patch(item.id, { action: item.featured ? "unfeature" : "feature" })}
                  >
                    {item.featured ? <RiStarFill size={15} /> : <RiStarLine size={15} />}
                    {item.featured ? "Unfeature" : "Feature"}
                  </button>

                  {item.status === "published" ? (
                    <span className="dash-tm-reorder">
                      <button
                        type="button"
                        title="Move up"
                        aria-label={`Move ${item.personName} up`}
                        disabled={busy}
                        onClick={() => void patch(item.id, { action: "move", direction: "up" })}
                      >
                        <RiArrowUpLine size={15} />
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        aria-label={`Move ${item.personName} down`}
                        disabled={busy}
                        onClick={() => void patch(item.id, { action: "move", direction: "down" })}
                      >
                        <RiArrowDownLine size={15} />
                      </button>
                    </span>
                  ) : null}

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm dash-tm-delete"
                    disabled={busy}
                    onClick={() => void remove(item)}
                  >
                    <RiDeleteBin6Line size={15} /> Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
                <div className="tm-photo-pick" aria-hidden="true">
                  {draft.photo_url.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={draft.photo_url.trim()} alt="" />
                  ) : (
                    <RiChatQuoteLine size={22} />
                  )}
                </div>
                <strong className="tm-photo-name">{draft.person_name.trim() || "Profile photo"}</strong>
                <p className="tm-photo-hint">Public photo URL used on the site when published.</p>
                <input
                  className="tm-photo-url"
                  type="url"
                  inputMode="url"
                  placeholder="https://… (public photo URL)"
                  value={draft.photo_url}
                  onChange={(event) => setDraft({ ...draft, photo_url: event.target.value })}
                />
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

              <div className="tm-form-row">
                <label className="tm-field">
                  <span>Project id</span>
                  <input
                    value={draft.project_id}
                    onChange={(event) => setDraft({ ...draft, project_id: event.target.value })}
                    placeholder="Matches a project slug"
                  />
                </label>
                <label className="tm-field">
                  <span>Other project title</span>
                  <input
                    value={draft.project_title_other}
                    onChange={(event) => setDraft({ ...draft, project_title_other: event.target.value })}
                  />
                </label>
              </div>

              <label className="tm-field">
                <span>Profile URL</span>
                <input
                  type="url"
                  value={draft.profile_url}
                  onChange={(event) => setDraft({ ...draft, profile_url: event.target.value })}
                  placeholder="https://"
                />
              </label>

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
                  Your testimonial <em>*</em>
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

              <div className="dash-tm-modal-checks">
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
              </div>

              <div className="tm-form-nav is-double">
                <button type="button" className="btn btn-outline" onClick={() => setDraft(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void saveDraft()}
                  disabled={Boolean(busyId) || !draft.person_name.trim() || !draft.body.trim()}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
