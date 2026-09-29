"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RiSearchLine } from "react-icons/ri";
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
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const pageSize = 12;

  useSheetDrag(settingsOpen && isMobile, () => setSettingsOpen(false), settingsRef);

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
    (async () => {
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
    setConfirmAll(false);
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

  return (
    <div className="dash-notes">
      <header className="dash-notes-head">
        <div>
          <p className="section-label">Inbox</p>
          <h1>Notifications</h1>
          <p className="dash-notes-lead">New messages, testimonials, and subscribers.</p>
        </div>
        <div className="dash-notes-head-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setSettingsOpen(true)}>
            Digest settings
          </button>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy || !counts.total} onClick={() => void post({ all: true }).then((ok) => ok && refresh())}>
            Mark all read
          </button>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy || !total} onClick={() => setConfirmAll(true)}>
            Delete all
          </button>
        </div>
      </header>

      {missing || blocked ? (
        <p className="dash-tm-error">
          Notifications could not be read. In the Supabase SQL editor, run the admin notification grants so the service role can use those tables.
        </p>
      ) : null}
      {note === "saved" ? <p className="dash-notes-ok">Inbox saved. The hourly digest goes to this address.</p> : null}
      {note && note !== "saved" && !note.match(/^\d+$/) ? <p className="dash-tm-error">{note}</p> : null}

      {confirmAll ? (
        <div className="dash-notes-confirm" role="status">
          <p>Delete every notification in this inbox? Messages, testimonials, and subscribers themselves stay in place.</p>
          <div>
            <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setConfirmAll(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={busy}
              onClick={() => void post({ action: "delete", all: true }).then((ok) => ok && refresh())}
            >
              Delete all
            </button>
          </div>
        </div>
      ) : null}

      <div className="dash-notes-toolbar">
        <label className="dash-notes-search">
          <RiSearchLine size={16} />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search notifications" aria-label="Search notifications" />
        </label>
        <div className="dash-notes-kinds" role="tablist" aria-label="Notification kind">
          {KINDS.map((item) => (
            <button
              key={item.id || "all"}
              type="button"
              className={kind === item.id ? "is-on" : ""}
              onClick={() => {
                setKind(item.id);
                setPage(1);
              }}
            >
              {item.label}
              {kindCount(item.id) ? <em>{kindCount(item.id)}</em> : null}
            </button>
          ))}
        </div>
        <label className="dash-notes-sort">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      {selected.length ? (
        <div className="dash-notes-batch">
          <span>{selected.length} selected</span>
          <button type="button" disabled={busy} onClick={() => void post({ ids: selected }).then((ok) => ok && refresh())}>
            Mark read
          </button>
          <button type="button" disabled={busy} onClick={() => void post({ action: "delete", ids: selected }).then((ok) => ok && refresh())}>
            Delete selected
          </button>
        </div>
      ) : null}

      <div className="dash-notes-list-wrap">
        <div className="dash-notes-selectall">
          <label>
            <input type="checkbox" checked={allPageSelected} onChange={togglePage} disabled={!items.length} aria-label="Select notifications on this page" />
            Select page
          </label>
        </div>
        {items.length ? (
          <ul className="dash-notes-list">
            {items.map((item) => (
              <li key={item.id} className={item.readAt ? "" : "is-unread"}>
                <label className="dash-notes-check">
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleOne(item.id)}
                    aria-label={`Select ${item.title}`}
                  />
                </label>
                <div className="dash-notes-copy">
                  <p>
                    <em>{item.kind}</em>
                    <time dateTime={item.createdAt}>{whenLabel(item.createdAt)}</time>
                    <span>{item.readAt ? "Read" : "New"}</span>
                  </p>
                  <strong>{item.title}</strong>
                  {item.body ? <span>{item.body}</span> : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dash-notes-empty">No notifications match this view.</p>
        )}
      </div>

      <div className="dash-notes-pager">
        <span>{total} result{total === 1 ? "" : "s"}</span>
        <button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
          Previous
        </button>
        <span>
          {page} / {pages}
        </span>
        <button type="button" disabled={page >= pages} onClick={() => setPage((value) => value + 1)}>
          Next
        </button>
      </div>

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
              <p>Hourly email of notifications that have not been sent yet.</p>
            </header>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ganzaparfait7@gmail.com" />
            </label>
            <label className="dash-notes-toggle">
              <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
              Email hourly
            </label>
            <div className="dash-note-settings-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => void savePrefs()}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
