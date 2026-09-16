"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiCheckLine,
  RiCloseLine,
  RiDeleteBin6Line,
  RiMailSendLine,
  RiRefreshLine,
  RiSearchLine,
  RiUserAddLine,
  RiUserHeartLine,
} from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

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
};

type ConfirmedFilter = "all" | "true" | "false";
type Audience = "confirmed" | "unconfirmed" | "both";

export default function SubscribersPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [counts, setCounts] = useState({ all: 0, confirmed: 0, unconfirmed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [confirmed, setConfirmed] = useState<ConfirmedFilter>("all");
  const [source, setSource] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const [addEmail, setAddEmail] = useState("");
  const [addName, setAddName] = useState("");

  const [bulkOpen, setBulkOpen] = useState(false);
  const [audience, setAudience] = useState<Audience>("confirmed");
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkTitle, setBulkTitle] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  useHistoryBackClose(bulkOpen, () => setBulkOpen(false));

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
      setCounts(data.counts || { all: 0, confirmed: 0, unconfirmed: 0 });
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

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggleAll = () => {
    setSelected(allSelected ? [] : rows.map((row) => row.id));
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
    if (!window.confirm(`Remove ${ids.length} subscriber${ids.length === 1 ? "" : "s"}?`)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/subscribers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
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
    <div className="dash-subs">
      <header className="dash-subs-head">
        <div>
          <p className="section-label">Audience</p>
          <h1>Subscribers</h1>
          <p>Manage confirmed and unconfirmed emails from the newsletter widget and contact form.</p>
        </div>
        <div className="dash-subs-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void load()} disabled={loading}>
            <RiRefreshLine size={15} /> Refresh
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setBulkOpen(true)}>
            <RiMailSendLine size={15} /> Bulk email
          </button>
        </div>
      </header>

      <div className="dash-subs-stats">
        <button type="button" className={confirmed === "all" ? "is-active" : ""} onClick={() => setConfirmed("all")}>
          All <strong>{counts.all}</strong>
        </button>
        <button type="button" className={confirmed === "true" ? "is-active" : ""} onClick={() => setConfirmed("true")}>
          Confirmed <strong>{counts.confirmed}</strong>
        </button>
        <button type="button" className={confirmed === "false" ? "is-active" : ""} onClick={() => setConfirmed("false")}>
          Unconfirmed <strong>{counts.unconfirmed}</strong>
        </button>
      </div>

      <div className="dash-subs-toolbar">
        <label className="dash-subs-search">
          <RiSearchLine size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load();
            }}
            placeholder="Search email, name, country…"
          />
        </label>
        <select value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source filter">
          <option value="">All sources</option>
          <option value="widget">Widget</option>
          <option value="contact">Contact</option>
          <option value="dashboard">Dashboard</option>
          <option value="import">Import</option>
        </select>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => void load()}>
          Apply
        </button>
        {selected.length ? (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => void removeIds(selected)} disabled={busy}>
            <RiDeleteBin6Line size={15} /> Remove ({selected.length})
          </button>
        ) : null}
      </div>

      <div className="dash-subs-add">
        <RiUserAddLine size={16} />
        <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Name (optional)" />
        <input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} placeholder="email@example.com" />
        <button type="button" className="btn btn-primary btn-sm" onClick={() => void addSubscriber()} disabled={busy || !addEmail.includes("@")}>
          Add confirmed
        </button>
      </div>

      {error ? <p className="dash-subs-error">{error}</p> : null}
      {bulkNote ? <p className="dash-subs-note">{bulkNote}</p> : null}

      <div className="dash-subs-table-wrap">
        <table className="dash-subs-table">
          <thead>
            <tr>
              <th>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Select all" />
              </th>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Source</th>
              <th>Location</th>
              <th>Joined</th>
              <th>Manage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={8}>No subscribers match these filters.</td>
              </tr>
            ) : (
              rows.map((row) => (
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
                    <strong>{row.email}</strong>
                  </td>
                  <td>{row.name || "—"}</td>
                  <td>
                    <span className={row.confirmed ? "dash-subs-pill is-yes" : "dash-subs-pill is-no"}>
                      {row.confirmed ? "Confirmed" : "Unconfirmed"}
                    </span>
                  </td>
                  <td>{row.source || "—"}</td>
                  <td>{[row.location, row.country].filter(Boolean).join(", ") || "—"}</td>
                  <td>{new Date(row.created_at).toLocaleDateString()}</td>
                  <td className="dash-subs-row-actions">
                    {row.confirmed ? (
                      <button type="button" title="Mark unconfirmed" onClick={() => void setConfirmedFlag(row.id, false)} disabled={busy}>
                        <RiCloseLine size={16} />
                      </button>
                    ) : (
                      <button type="button" title="Confirm" onClick={() => void setConfirmedFlag(row.id, true)} disabled={busy}>
                        <RiCheckLine size={16} />
                      </button>
                    )}
                    <button type="button" title="Remove" onClick={() => void removeIds([row.id])} disabled={busy}>
                      <RiDeleteBin6Line size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {bulkOpen ? (
        <div className="dash-subs-modal" role="dialog" aria-modal="true" aria-label="Bulk email">
          <div className="dash-subs-modal-card">
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
                <button type="button" className={audience === "confirmed" ? "is-active" : ""} onClick={() => setAudience("confirmed")}>
                  <RiUserHeartLine size={15} /> Confirmed only
                </button>
                <button type="button" className={audience === "unconfirmed" ? "is-active" : ""} onClick={() => setAudience("unconfirmed")}>
                  Unconfirmed only
                </button>
                <button type="button" className={audience === "both" ? "is-active" : ""} onClick={() => setAudience("both")}>
                  Both
                </button>
              </div>
            ) : null}

            <label>
              Subject
              <input value={bulkSubject} onChange={(e) => setBulkSubject(e.target.value)} placeholder="What’s new this month" />
            </label>
            <label>
              Title
              <input value={bulkTitle} onChange={(e) => setBulkTitle(e.target.value)} placeholder="Optional email headline" />
            </label>
            <label>
              Body
              <textarea rows={7} value={bulkBody} onChange={(e) => setBulkBody(e.target.value)} placeholder="Write the update…" />
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
