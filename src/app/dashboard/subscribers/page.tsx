"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiDownloadLine,
  RiLoader4Line,
  RiMailSendLine,
  RiRefreshLine,
  RiSearchLine,
  RiUserAddLine,
  RiUserHeartLine,
} from "react-icons/ri";
import { useHistoryBackClose, dismissOnBackdrop } from "@/hooks/useHistoryBackClose";
import { downloadCsv } from "@/lib/download-csv";

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  source: string | null;
  location: string | null;
  country: string | null;
  device: string | null;
  created_at: string;
  unsubscribed_at?: string | null;
};

type ConfirmedFilter = "all" | "true" | "false" | "unsubscribed";
type Audience = "confirmed" | "unconfirmed" | "both";

const PAGE_SIZE = 10;

export default function SubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [counts, setCounts] = useState({ all: 0, confirmed: 0, unconfirmed: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedFilter>("all");
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);
  const [confirmIds, setConfirmIds] = useState<string[] | null>(null);

  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");

  const [bulkOpen, setBulkOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>("confirmed");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  useHistoryBackClose(bulkOpen, () => setBulkOpen(false));
  useHistoryBackClose(Boolean(confirmIds), () => setConfirmIds(null));

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (confirmed !== "all") params.set("confirmed", confirmed);
      if (source) params.set("source", source);
      const res = await fetch(`/api/subscribers?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setRows((data.subscribers || []) as Subscriber[]);
      setCounts(data.counts || { all: 0, confirmed: 0, unconfirmed: 0, unsubscribed: 0 });
      setSelected([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmed, source]);

  useEffect(() => {
    setPage(1);
  }, [confirmed, source, q]);

  useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [exportOpen]);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const allSelected = pageRows.length > 0 && pageRows.every((row) => selected.includes(row.id));

  const exportRows = (scope: "visible" | "all" | "selected") => {
    const data =
      scope === "selected"
        ? rows.filter((row) => selected.includes(row.id))
        : rows;
    if (!data.length) {
      setError(scope === "selected" ? "Select subscribers to export." : "Nothing to export.");
      setExportOpen(false);
      return;
    }
    downloadCsv(
      `subscribers-${scope}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Email", "Name", "Confirmed", "Source", "Country", "Location", "Device", "Created", "Unsubscribed"],
      data.map((row) => [
        row.email,
        row.name,
        row.confirmed ? "yes" : "no",
        row.source,
        row.country,
        row.location,
        row.device,
        row.created_at,
        row.unsubscribed_at || "",
      ]),
    );
    setExportOpen(false);
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected((current) => current.filter((id) => !pageRows.some((row) => row.id === id)));
      return;
    }
    setSelected((current) => Array.from(new Set([...current, ...pageRows.map((row) => row.id)])));
  };

  const toggleOne = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  };

  const addSubscriber = async () => {
    if (!addEmail.includes("@")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: addEmail, name: addName, confirmed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add");
      setAddEmail("");
      setAddName("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add subscriber");
    } finally {
      setBusy(false);
    }
  };

  const setConfirmedFlag = async (id: string, next: boolean) => {
    setBusy(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, confirmed: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setBusy(false);
    }
  };

  const removeIds = async (ids: string[]) => {
    if (!ids.length) return;
    setBusy(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unsubscribe failed");
      setConfirmIds(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsubscribe failed");
    } finally {
      setBusy(false);
    }
  };

  const resubscribeId = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, resubscribe: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not re-subscribe");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not re-subscribe");
    } finally {
      setBusy(false);
    }
  };

  const sendBulk = async () => {
    if (!bulkSubject.trim() || !bulkBody.trim()) return;
    setBusy(true);
    setBulkNote("");
    try {
      const res = await fetch("/api/subscribers/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: bulkSubject,
          title: bulkTitle || bulkSubject,
          body: bulkBody,
          audience: selected.length ? undefined : audience,
          ids: selected.length ? selected : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk send failed");
      setBulkNote(`Queued ${data.queued} email${data.queued === 1 ? "" : "s"}.`);
      setBulkOpen(false);
      setBulkSubject("");
      setBulkTitle("");
      setBulkBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk send failed");
    } finally {
      setBusy(false);
    }
  };

  const audienceHint = useMemo(() => {
    if (selected.length) return `${selected.length} selected row${selected.length === 1 ? "" : "s"}`;
    if (audience === "confirmed") return `${counts.confirmed} confirmed`;
    if (audience === "unconfirmed") return `${counts.unconfirmed} unconfirmed`;
    return `${counts.all} total`;
  }, [audience, counts, selected.length]);

  return (
    <div className="dash-tm dash-subs">
      <header className="dash-tm-head">
        <div>
          <p className="section-label">Audience</p>
          <h1>Subscribers</h1>
          <p>Manage newsletter addresses. Unsubscribe never deletes a row — it only stops mail.</p>
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
                <button type="button" role="menuitem" onClick={() => exportRows("visible")}>
                  Export filtered CSV
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => exportRows("selected")}
                  disabled={!selected.length}
                >
                  Export selected CSV
                </button>
              </div>
            ) : null}
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void load()} disabled={loading}>
            {loading ? <RiLoader4Line size={15} className="dash-tm-spin" /> : <RiRefreshLine size={15} />} Refresh
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setBulkOpen(true)}>
            <RiMailSendLine size={15} /> Bulk email
          </button>
        </div>
      </header>

      <div className="dash-tm-toolbar">
        <label className="dash-tm-search">
          <RiSearchLine size={16} aria-hidden="true" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            placeholder="Search email, name, country…"
            aria-label="Search subscribers"
          />
        </label>
        <label className="dash-tm-filter">
          <span>Status</span>
          <select value={confirmed} onChange={(e) => setConfirmed(e.target.value as ConfirmedFilter)}>
            <option value="all">All {counts.all}</option>
            <option value="true">Confirmed {counts.confirmed}</option>
            <option value="false">Unconfirmed {counts.unconfirmed}</option>
            <option value="unsubscribed">Unsubscribed {counts.unsubscribed || 0}</option>
          </select>
        </label>
        <label className="dash-tm-filter">
          <span>Source</span>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="">All sources</option>
            <option value="widget">Widget</option>
            <option value="contact">Contact</option>
            <option value="dashboard">Dashboard</option>
            <option value="import">Import</option>
          </select>
        </label>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => void load()}>
          Apply
        </button>
        {selected.length ? (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setConfirmIds(selected)}
            disabled={busy}
          >
            <RiDeleteBin6Line size={15} /> Unsubscribe ({selected.length})
          </button>
        ) : null}
        <p className="dash-tm-result-count" aria-live="polite">
          {rows.length} result{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="dash-subs-add">
        <RiUserAddLine size={16} />
        <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Name (optional)" />
        <input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@example.com" />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => void addSubscriber()}
          disabled={busy || !addEmail.includes("@")}
        >
          Add confirmed
        </button>
      </div>

      {error ? <p className="dash-tm-error">{error}</p> : null}
      {bulkNote ? <p className="dash-subs-note">{bulkNote}</p> : null}

      {loading ? (
        <p className="dash-tm-empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="dash-tm-empty">No subscribers match these filters.</p>
      ) : (
        <>
          <div className="dash-tm-table-wrap">
            <table className="dash-tm-table is-compact dash-subs-table">
              <thead>
                <tr>
                  <th scope="col">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all on page" />
                  </th>
                  <th scope="col">Email</th>
                  <th scope="col">Name</th>
                  <th scope="col">Status</th>
                  <th scope="col">Source</th>
                  <th scope="col">Location</th>
                  <th scope="col">Joined</th>
                  <th scope="col">Manage</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleOne(row.id)}
                        aria-label={`Select ${row.email}`}
                      />
                    </td>
                    <td>
                      <strong className="dash-subs-email">{row.email}</strong>
                    </td>
                    <td>{row.name || "—"}</td>
                    <td>
                      {row.unsubscribed_at ? (
                        <span className="dash-tm-status is-declined">Unsubscribed</span>
                      ) : (
                        <span className={`dash-tm-status is-${row.confirmed ? "published" : "draft"}`}>
                          {row.confirmed ? "Confirmed" : "Unconfirmed"}
                        </span>
                      )}
                    </td>
                    <td>{row.source || "—"}</td>
                    <td>
                      <span className="dash-subs-loc">
                        {[row.location, row.country].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td>
                      <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString()}</time>
                    </td>
                    <td>
                      <div className="dash-tm-row-actions is-compact">
                        {row.unsubscribed_at ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Re-subscribe"
                            onClick={() => void resubscribeId(row.id)}
                            disabled={busy}
                          >
                            <RiCheckLine size={14} />
                          </button>
                        ) : row.confirmed ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Mark unconfirmed"
                            onClick={() => void setConfirmedFlag(row.id, false)}
                            disabled={busy}
                          >
                            <RiCloseLine size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            title="Confirm"
                            onClick={() => void setConfirmedFlag(row.id, true)}
                            disabled={busy}
                          >
                            <RiCheckLine size={14} />
                          </button>
                        )}
                        {!row.unsubscribed_at ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm dash-tm-delete"
                            title="Unsubscribe (keep row)"
                            onClick={() => setConfirmIds([row.id])}
                            disabled={busy}
                          >
                            <RiDeleteBin6Line size={15} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dash-tm-pager" aria-label="Pagination">
            {safePage > 1 ? (
              <button type="button" className="dash-tm-page-link" onClick={() => setPage((p) => Math.max(1, p - 1))}>
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
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
              </button>
            ) : (
              <span className="dash-tm-page-link is-disabled">Next</span>
            )}
          </div>
        </>
      )}

      {confirmIds ? (
        <div className="dash-sheet-layer" role="presentation">
          <button
            type="button"
            className="dash-sheet-backdrop"
            aria-label="Dismiss confirmation"
            onClick={() => setConfirmIds(null)}
          />
          <div className="dash-sheet" role="dialog" aria-modal="true" aria-labelledby="dash-subs-confirm-title">
            <div className="dash-sheet-handle" aria-hidden="true" />
            <h2 id="dash-subs-confirm-title">Unsubscribe?</h2>
            <p>
              Soft-unsubscribe {confirmIds.length} address{confirmIds.length === 1 ? "" : "es"}? Rows are kept — they
              just stop receiving updates.
            </p>
            <div className="dash-sheet-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setConfirmIds(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary dash-tm-confirm-danger"
                onClick={() => void removeIds(confirmIds)}
                disabled={busy}
              >
                {busy ? "Working…" : "Unsubscribe"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {bulkOpen ? (
        <div
          className="dash-subs-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Bulk email"
          onMouseDown={dismissOnBackdrop(() => setBulkOpen(false))}
        >
          <div className="dash-subs-modal-card" onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <p className="section-label">Broadcast</p>
                <h2>Send bulk email</h2>
                <p>Target: {audienceHint}</p>
              </div>
              <button type="button" className="dash-icon-btn" onClick={() => setBulkOpen(false)} aria-label="Close">
                <RiCloseLine size={18} />
              </button>
            </header>

            {!selected.length ? (
              <div className="dash-subs-audience">
                <button
                  type="button"
                  className={audience === "confirmed" ? "is-active" : ""}
                  onClick={() => setAudience("confirmed")}
                >
                  <RiUserHeartLine size={15} /> Confirmed only
                </button>
                <button
                  type="button"
                  className={audience === "unconfirmed" ? "is-active" : ""}
                  onClick={() => setAudience("unconfirmed")}
                >
                  Unconfirmed only
                </button>
                <button type="button" className={audience === "both" ? "is-active" : ""} onClick={() => setAudience("both")}>
                  Both
                </button>
              </div>
            ) : null}

            <label>
              Subject
              <input
                value={bulkSubject}
                onChange={(e) => setBulkSubject(e.target.value)}
                placeholder="What’s new this month"
              />
            </label>
            <label>
              Title
              <input
                value={bulkTitle}
                onChange={(e) => setBulkTitle(e.target.value)}
                placeholder="Optional email headline"
              />
            </label>
            <label>
              Body
              <textarea
                rows={7}
                value={bulkBody}
                onChange={(e) => setBulkBody(e.target.value)}
                placeholder="Write the update…"
              />
            </label>
            <div className="dash-subs-modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void sendBulk()}
                disabled={busy || !bulkSubject.trim() || !bulkBody.trim()}
              >
                <RiMailSendLine size={16} /> {busy ? "Queuing…" : "Queue send"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
