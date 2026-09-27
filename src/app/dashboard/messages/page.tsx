"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  RiDownloadLine,
  RiInboxLine,
  RiLoader4Line,
  RiMailLine,
  RiRefreshLine,
  RiReplyLine,
  RiSearchLine,
  RiSendPlaneLine,
  RiUserAddLine,
} from "react-icons/ri";
import { downloadCsv } from "@/lib/download-csv";

type InboxItem = {
  id: string;
  sourceId: string;
  type: "contact" | "subscribe" | "sent";
  direction: "inbound" | "outbound";
  title: string;
  email: string;
  subtitle: string;
  body: string;
  status: string;
  replyText: string | null;
  previewHtml: string | null;
  hasPreview?: boolean;
  createdAt: string;
  kind?: string;
};

type Filter = "all" | "contact" | "subscribe" | "sent";

const LIST_PAGE = 20;

export default function MessagesPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, contact: 0, subscribe: 0, sent: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<InboxItem | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [listPage, setListPage] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const nextItems = (data.items || []) as InboxItem[];
      setItems(nextItems);
      setCounts(data.counts || { all: nextItems.length, contact: 0, subscribe: 0, sent: 0 });
      if (selected) {
        const next = nextItems.find((item) => item.id === selected.id) || null;
        setSelected(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setListPage(1);
  }, [filter, query]);

  useEffect(() => {
    if (!exportOpen) return;
    const onDoc = (event: MouseEvent) => {
      if (!exportRef.current?.contains(event.target as Node)) setExportOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [exportOpen]);

  const visible = useMemo(() => {
    const typed = filter === "all" ? items : items.filter((item) => item.type === filter);
    const needle = query.trim().toLowerCase();
    if (!needle) return typed;
    return typed.filter((item) =>
      [item.title, item.email, item.subtitle, item.body, item.status, item.kind]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [items, filter, query]);

  const pageCount = Math.max(1, Math.ceil(visible.length / LIST_PAGE));
  const safePage = Math.min(listPage, pageCount);
  const pageItems = visible.slice((safePage - 1) * LIST_PAGE, safePage * LIST_PAGE);
  const canReply = selected && (selected.type === "contact" || selected.type === "subscribe");

  const openItem = async (item: InboxItem) => {
    setSelected(item);
    setReply(item.replyText || "");
    if (item.type !== "sent" || item.previewHtml || !item.hasPreview) return;
    setPreviewLoading(true);
    try {
      const res = await fetch(`/api/messages/preview?id=${encodeURIComponent(item.sourceId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Preview failed");
      const html = (data.previewHtml as string | null) || null;
      setItems((current) =>
        current.map((row) => (row.id === item.id ? { ...row, previewHtml: html, hasPreview: Boolean(html) } : row)),
      );
      setSelected((current) =>
        current?.id === item.id ? { ...current, previewHtml: html, hasPreview: Boolean(html) } : current,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load email preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const sendReply = async () => {
    if (!selected || !canReply || !reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selected.type,
          id: selected.sourceId,
          toEmail: selected.email,
          replyText: reply.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reply failed");
      setReply("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reply failed");
    } finally {
      setSending(false);
    }
  };

  const exportRows = (scope: "visible" | "all" | "selected") => {
    const rows =
      scope === "all"
        ? items
        : scope === "selected"
          ? selected
            ? [selected]
            : []
          : visible;
    if (!rows.length) {
      setError(scope === "selected" ? "Select a message to export." : "Nothing to export.");
      setExportOpen(false);
      return;
    }
    downloadCsv(
      `messages-${scope}-${new Date().toISOString().slice(0, 10)}.csv`,
      ["Type", "Title", "Email", "Status", "Subtitle", "Body", "Created"],
      rows.map((row) => [
        row.type,
        row.title,
        row.email,
        row.status,
        row.subtitle,
        row.body,
        new Date(row.createdAt).toISOString(),
      ]),
    );
    setExportOpen(false);
  };

  const typeIcon = (type: InboxItem["type"]) => {
    if (type === "subscribe") return <RiUserAddLine size={13} />;
    if (type === "sent") return <RiSendPlaneLine size={13} />;
    return <RiInboxLine size={13} />;
  };

  return (
    <div className="dash-tm dash-inbox is-compact">
      <header className="dash-inbox-top">
        <div className="dash-inbox-top-copy">
          <p className="section-label">Inbox</p>
          <h1>Messages</h1>
        </div>
        <div className="dash-inbox-top-actions">
          <label className="dash-inbox-search">
            <RiSearchLine size={15} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search…"
              aria-label="Search messages"
            />
            <span aria-live="polite">{visible.length}</span>
          </label>
          <label className="dash-inbox-filter">
            <select
              value={filter}
              aria-label="Message type"
              onChange={(event) => setFilter(event.target.value as Filter)}
            >
              <option value="all">All {counts.all}</option>
              <option value="contact">Contact {counts.contact}</option>
              <option value="subscribe">Subscribers {counts.subscribe}</option>
              <option value="sent">Sent {counts.sent}</option>
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
                <button type="button" role="menuitem" onClick={() => exportRows("visible")}>
                  Export filtered CSV
                </button>
                <button type="button" role="menuitem" onClick={() => exportRows("all")}>
                  Export all CSV
                </button>
                <button type="button" role="menuitem" onClick={() => exportRows("selected")} disabled={!selected}>
                  Export selected CSV
                </button>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => void load()}
            disabled={loading}
            aria-label="Refresh messages"
          >
            {loading ? <RiLoader4Line size={15} className="dash-tm-spin" /> : <RiRefreshLine size={15} />}
          </button>
        </div>
      </header>

      {error ? <p className="dash-tm-error">{error}</p> : null}

      <div className="dash-inbox-grid">
        <div className="dash-inbox-list">
          {loading ? (
            <div className="dash-inbox-loading" aria-busy="true" aria-live="polite">
              <RiLoader4Line size={18} className="dash-tm-spin" />
              <p>Loading inbox…</p>
              <div className="dash-inbox-skeleton" aria-hidden="true">
                {[0, 1, 2, 3].map((row) => (
                  <span key={row} className="dash-inbox-skeleton-row" />
                ))}
              </div>
            </div>
          ) : pageItems.length === 0 ? (
            <p className="dash-inbox-empty">No messages yet.</p>
          ) : (
            <>
              {pageItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={selected?.id === item.id ? "dash-inbox-item is-active" : "dash-inbox-item"}
                  onClick={() => void openItem(item)}
                >
                  <span className={`dash-inbox-type is-${item.type}`}>
                    {typeIcon(item.type)} {item.type}
                  </span>
                  <strong>{item.title}</strong>
                  <span className="dash-inbox-email">{item.email}</span>
                  <span className="dash-inbox-sub">{item.subtitle}</span>
                </button>
              ))}
              {pageCount > 1 ? (
                <div className="dash-inbox-list-pager">
                  {safePage > 1 ? (
                    <button type="button" className="dash-tm-page-link" onClick={() => setListPage((p) => p - 1)}>
                      Previous
                    </button>
                  ) : (
                    <span className="dash-tm-page-link is-disabled">Previous</span>
                  )}
                  <span className="dash-tm-page-status">
                    {safePage} of {pageCount}
                  </span>
                  {safePage < pageCount ? (
                    <button type="button" className="dash-tm-page-link" onClick={() => setListPage((p) => p + 1)}>
                      Next
                    </button>
                  ) : (
                    <span className="dash-tm-page-link is-disabled">Next</span>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="dash-inbox-detail">
          {!selected ? (
            <div className="dash-inbox-placeholder">
              <div className="dash-inbox-placeholder-inner">
                <RiMailLine size={28} aria-hidden="true" />
                <p>Select a message</p>
              </div>
            </div>
          ) : (
            <>
              <div className="dash-inbox-detail-head">
                <span className={`dash-inbox-type is-${selected.type}`}>
                  {typeIcon(selected.type)} {selected.type} · {selected.status}
                </span>
                <h2>{selected.title}</h2>
                <p>
                  {selected.email}
                  {selected.subtitle ? ` · ${selected.subtitle}` : ""}
                </p>
                <time dateTime={selected.createdAt}>{new Date(selected.createdAt).toLocaleString()}</time>
              </div>

              {previewLoading ? (
                <p className="dash-inbox-empty">Loading preview…</p>
              ) : selected.previewHtml ? (
                <div className="dash-inbox-preview">
                  <p className="dash-inbox-preview-label">Email preview</p>
                  <iframe title="Email preview" srcDoc={selected.previewHtml} sandbox="" loading="lazy" />
                </div>
              ) : (
                <div className="dash-inbox-body">{selected.body || "No body text."}</div>
              )}

              {selected.replyText ? (
                <div className="dash-inbox-prev-reply">
                  <strong>Previous reply</strong>
                  {selected.replyText}
                </div>
              ) : null}

              {canReply ? (
                <>
                  <label className="dash-inbox-reply">
                    Reply
                    <textarea
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a branded reply…"
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => void sendReply()}
                    disabled={sending || !reply.trim()}
                  >
                    <RiReplyLine size={15} /> {sending ? "Sending…" : "Send reply"}
                  </button>
                </>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
