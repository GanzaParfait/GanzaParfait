"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RiCheckLine, RiDeleteBin6Line, RiNotification3Line, RiSearchLine } from "react-icons/ri";
import { useSheetDrag } from "@/hooks/useSheetDrag";

type Notice = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readAt: string | null;
};

type Counts = { subscriber: number; message: number; testimonial: number; total: number };

const KINDS = [
  { id: "", label: "All" },
  { id: "message", label: "Messages" },
  { id: "testimonial", label: "Testimonials" },
  { id: "subscriber", label: "Subscribers" },
];

function whenLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [counts, setCounts] = useState<Counts>({ subscriber: 0, message: 0, testimonial: 0, total: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [kind, setKind] = useState("");
  const [email, setEmail] = useState("ganzaparfait7@gmail.com");
  const [enabled, setEnabled] = useState(true);
  const [missing, setMissing] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirm, setConfirm] = useState<null | "read" | "delete">(null);
  const [isMobile, setIsMobile] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const pageSize = 12;

  useSheetDrag(settingsOpen && isMobile, () => setSettingsOpen(false), settingsRef);
  useSheetDrag(Boolean(confirm) && isMobile, () => setConfirm(null), confirmRef);

  useEffect(() => {
    const sync = () => setIsMobile(window.matchMedia("(max-width: 800px)").matches);
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setPage(1);
      setQuery(q.trim());
    }, 250);
    return () => window.clearTimeout(handle);
  }, [q]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    (async () => {
      try {
        const params = new URLSearchParams({
          view: "list",
          q: query,
          sort,
          kind,
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/api/notifications?${params}`);
        if (!res.ok || cancel) return;
        const data = await res.json();
        if (cancel) return;
        setItems(data.items || []);
        setTotal(data.total || 0);
        if (data.counts) setCounts(data.counts);
        if (data.prefs?.email) setEmail(data.prefs.email);
        if (typeof data.prefs?.enabled === "boolean") setEnabled(data.prefs.enabled);
        setMissing(Boolean(data.missing));
        setBlocked(Boolean(data.blocked));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [query, sort, kind, page, note]);

  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageIds = useMemo(() => items.map((item) => item.id), [items]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  const refresh = () => {
    setSelected([]);
    setConfirm(null);
    setNote(String(Date.now()));
  };

  const post = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNote(data.error || "Could not update notifications");
        return false;
      }
      if (data.counts) setCounts(data.counts);
      return true;
    } finally {
      setBusy(false);
    }
  };

  const savePrefs = async () => {
    const ok = await post({ action: "prefs", email, enabled });
    if (ok) {
      setNote("saved");
      setSettingsOpen(false);
    }
  };

  const toggleOne = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const togglePage = () => {
    setSelected((current) => {
      if (allPageSelected) return current.filter((id) => !pageIds.includes(id));
      return [...new Set([...current, ...pageIds])];
    });
  };

  const kindCount = (id: string) => {
    if (id === "message") return counts.message;
    if (id === "testimonial") return counts.testimonial;
    if (id === "subscriber") return counts.subscriber;
    return counts.total;
  };

  const kindLabel = (id: string) => {
    if (id === "message") return "Message";
    if (id === "testimonial") return "Testimonial";
    if (id === "subscriber") return "Subscriber";
    return id;
  };

  return (
    <div className="dash-tm dash-notes">
      <header className="dash-tm-head">
        <div>
          <p className="section-label">Inbox</p>
          <h1>Notifications</h1>
          <p>New messages, testimonials, and subscribers.</p>
        </div>
        <div className="dash-tm-head-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSettingsOpen(true)}>
            Digest settings
          </button>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy || !counts.total} onClick={() => setConfirm("read")}>
            Mark all read
          </button>
          <button type="button" className="btn btn-outline btn-sm dash-notes-delete" disabled={busy || !total} onClick={() => setConfirm("delete")}>
            Delete all
          </button>
        </div>
      </header>

      <div className="dash-tm-toolbar">
        <label className="dash-tm-search">
          <RiSearchLine size={16} aria-hidden="true" />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search title or note…" aria-label="Search notifications" />
        </label>
        <label className="dash-tm-filter">
          <span>Kind</span>
          <select
            value={kind}
            aria-label="Notification kind"
            onChange={(event) => {
              setKind(event.target.value);
              setPage(1);
            }}
          >
            {KINDS.map((item) => (
              <option key={item.id || "all"} value={item.id}>
                {item.label}
                {kindCount(item.id) ? ` ${kindCount(item.id)}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="dash-tm-filter">
          <span>Sort</span>
          <select
            value={sort}
            aria-label="Sort notifications"
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
        {selected.length ? (
          <>
            <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => void post({ ids: selected }).then((ok) => ok && refresh())}>
              <RiCheckLine size={15} /> Mark read ({selected.length})
            </button>
            <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => void post({ action: "delete", ids: selected }).then((ok) => ok && refresh())}>
              <RiDeleteBin6Line size={15} /> Delete ({selected.length})
            </button>
          </>
        ) : null}
        <p className="dash-tm-result-count" aria-live="polite">
          {total} result{total === 1 ? "" : "s"}
        </p>
      </div>

      {missing || blocked ? (
        <p className="dash-tm-error">
          Notifications could not be read. In the Supabase SQL editor, run the admin notification grants so the service role can use those tables.
        </p>
      ) : null}
      {note === "saved" ? <p className="dash-tm-ok">Inbox saved. The daily digest goes to this address.</p> : null}
      {note && note !== "saved" && !note.match(/^\d+$/) ? <p className="dash-tm-error">{note}</p> : null}

      {loading ? (
        <p className="dash-tm-empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="dash-tm-empty">
          <RiNotification3Line size={18} /> No notifications match this view.
        </p>
      ) : (
        <>
          <div className="dash-tm-table-wrap">
            <table className="dash-tm-table is-compact dash-notes-table">
              <thead>
                <tr>
                  <th scope="col">
                    <input type="checkbox" checked={allPageSelected} onChange={togglePage} aria-label="Select notifications on this page" />
                  </th>
                  <th scope="col">Notification</th>
                  <th scope="col">Kind</th>
                  <th scope="col">Status</th>
                  <th scope="col">When</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.readAt ? undefined : "is-unread"}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(item.id)}
                        onChange={() => toggleOne(item.id)}
                        aria-label={`Select ${item.title}`}
                      />
                    </td>
                    <td>
                      <div className="dash-tm-person is-compact dash-projects-person">
                        <div className="dash-tm-person-copy">
                          <strong>{item.title}</strong>
                          {item.body ? <span>{item.body}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`dash-tm-status is-${item.kind === "message" ? "confirmed" : item.kind === "testimonial" ? "published" : "draft"}`}>
                        {kindLabel(item.kind)}
                      </span>
                    </td>
                    <td>
                      <span className={`dash-tm-status ${item.readAt ? "is-read" : "is-confirmed"}`}>{item.readAt ? "Read" : "New"}</span>
                    </td>
                    <td>
                      <time dateTime={item.createdAt}>{whenLabel(item.createdAt)}</time>
                    </td>
                    <td>
                      <div className="dash-tm-row-actions is-compact">
                        {item.readAt ? null : (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Mark read"
                            disabled={busy}
                            onClick={() => void post({ ids: [item.id] }).then((ok) => ok && refresh())}
                          >
                            <RiCheckLine size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm dash-tm-delete"
                          title="Delete notification"
                          disabled={busy}
                          onClick={() => void post({ action: "delete", ids: [item.id] }).then((ok) => ok && refresh())}
                        >
                          <RiDeleteBin6Line size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-tm-pager" aria-label="Pagination">
            {page > 1 ? (
              <button type="button" className="dash-tm-page-link" onClick={() => setPage((value) => value - 1)}>
                Previous
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Previous</span>
            )}
            <span className="dash-tm-page-status">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <button type="button" className="dash-tm-page-link" onClick={() => setPage((value) => value + 1)}>
                Next
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Next</span>
            )}
          </div>
        </>
      )}

      {confirm ? (
        <div
          className={`dash-note-settings-layer${isMobile ? " is-sheet" : ""}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirm(null);
          }}
        >
          <div ref={confirmRef} className="dash-note-settings" role="dialog" aria-modal="true" aria-labelledby="dash-notes-confirm-title">
            {isMobile ? <div className="tm-dialog-handle" aria-hidden="true" /> : null}
            <header>
              <p className="section-label">{confirm === "delete" ? "Delete" : "Read"}</p>
              <h2 id="dash-notes-confirm-title">{confirm === "delete" ? "Delete every notification?" : "Mark all as read?"}</h2>
              <p>
                {confirm === "delete"
                  ? "This clears the inbox only. Messages, testimonials, and subscribers stay where they are."
                  : "Every unread notification in this inbox will be marked read."}
              </p>
            </header>
            <div className="dash-note-settings-actions">
              <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setConfirm(null)}>
                Cancel
              </button>
              {confirm === "delete" ? (
                <button
                  type="button"
                  className="btn btn-primary dash-tm-confirm-danger"
                  disabled={busy}
                  onClick={() => void post({ action: "delete", all: true }).then((ok) => ok && refresh())}
                >
                  Delete all
                </button>
              ) : (
                <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void post({ all: true }).then((ok) => ok && refresh())}>
                  Mark all read
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div
          className={`dash-note-settings-layer${isMobile ? " is-sheet" : ""}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSettingsOpen(false);
          }}
        >
          <div ref={settingsRef} className="dash-note-settings" role="dialog" aria-modal="true" aria-labelledby="digest-settings-title">
            {isMobile ? <div className="tm-dialog-handle" aria-hidden="true" /> : null}
            <header>
              <p className="section-label">Digest</p>
              <h2 id="digest-settings-title">Inbox settings</h2>
              <p>Daily email of notifications that have not been sent yet.</p>
            </header>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ganzaparfait7@gmail.com" />
            </label>
            <label className="dash-notes-toggle">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              Email daily
            </label>
            <div className="dash-note-settings-actions">
              <button type="button" className="btn btn-outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void savePrefs()}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
