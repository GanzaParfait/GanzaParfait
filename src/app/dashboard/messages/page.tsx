"use client";

import { useEffect, useMemo, useState } from "react";
import {
  RiMailLine,
  RiReplyLine,
  RiRefreshLine,
  RiSendPlaneLine,
  RiUserAddLine,
  RiInboxLine,
} from "react-icons/ri";

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
  createdAt: string;
  kind?: string;
};

type Filter = "all" | "contact" | "subscribe" | "sent";

export default function MessagesPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [counts, setCounts] = useState({ all: 0, contact: 0, subscribe: 0, sent: 0 });
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<InboxItem | null>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

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

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.type === filter)),
    [items, filter],
  );

  const canReply = selected && (selected.type === "contact" || selected.type === "subscribe");

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

  const typeIcon = (type: InboxItem["type"]) => {
    if (type === "subscribe") return <RiUserAddLine size={14} />;
    if (type === "sent") return <RiSendPlaneLine size={14} />;
    return <RiInboxLine size={14} />;
  };

  const typeColor = (type: InboxItem["type"]) => {
    if (type === "subscribe") return "#047857";
    if (type === "sent") return "#334155";
    return "#0e52a8";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", height: "100%", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "#0e52a8" }}>
            Inbox
          </p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0b192c", margin: 0 }}>Messages</h1>
          <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.2rem 0 0" }}>
            Contact submissions, newsletter signups, and system-sent mail — with preview and reply.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => void load()} disabled={loading}>
          <RiRefreshLine size={16} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
        {(
          [
            ["all", "All", counts.all],
            ["contact", "Contact", counts.contact],
            ["subscribe", "Subscribers", counts.subscribe],
            ["sent", "Sent", counts.sent],
          ] as const
        ).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            className={filter === key ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => setFilter(key)}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {error ? <p style={{ color: "#b91c1c", fontSize: "0.85rem" }}>{error}</p> : null}

      <div className="dash-inbox-grid">
        <div className="dash-inbox-list">
          {loading ? (
            <p style={{ padding: "1rem", color: "#64748b", fontSize: "0.85rem" }}>Loading…</p>
          ) : visible.length === 0 ? (
            <p style={{ padding: "1rem", color: "#64748b", fontSize: "0.85rem" }}>No messages yet.</p>
          ) : (
            visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={selected?.id === item.id ? "dash-inbox-item is-active" : "dash-inbox-item"}
                onClick={() => {
                  setSelected(item);
                  setReply(item.replyText || "");
                }}
              >
                <span className="dash-inbox-type" style={{ color: typeColor(item.type) }}>
                  {typeIcon(item.type)} {item.type}
                </span>
                <strong>{item.title}</strong>
                <span className="dash-inbox-email">{item.email}</span>
                <span className="dash-inbox-sub">{item.subtitle}</span>
              </button>
            ))
          )}
        </div>

        <div className="dash-inbox-detail">
          {!selected ? (
            <div style={{ display: "grid", placeItems: "center", minHeight: "16rem", color: "#94a3b8" }}>
              <div style={{ textAlign: "center" }}>
                <RiMailLine size={28} />
                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>Select a message</p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: typeColor(selected.type),
                  }}
                >
                  {typeIcon(selected.type)} {selected.type} · {selected.status}
                </span>
                <h2 style={{ margin: "0.35rem 0 0", fontSize: "1.05rem" }}>{selected.title}</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  {selected.email}
                  {selected.subtitle ? ` · ${selected.subtitle}` : ""}
                </p>
                <p style={{ margin: "0.35rem 0 0", color: "#94a3b8", fontSize: "0.75rem" }}>
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              {selected.previewHtml ? (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "0.75rem", overflow: "hidden", background: "#f8fafc" }}>
                  <p
                    style={{
                      margin: 0,
                      padding: "0.55rem 0.85rem",
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "#64748b",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    Email preview
                  </p>
                  <iframe
                    title="Email preview"
                    srcDoc={selected.previewHtml}
                    style={{ width: "100%", height: "22rem", border: 0, background: "#fff" }}
                    sandbox=""
                  />
                </div>
              ) : (
                <div
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "0.75rem",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.55,
                    fontSize: "0.9rem",
                  }}
                >
                  {selected.body || "No body text."}
                </div>
              )}

              {selected.replyText ? (
                <div
                  style={{
                    padding: "0.9rem 1rem",
                    borderRadius: "0.75rem",
                    background: "#eaf2fb",
                    border: "1px solid #bfdbfe",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.55,
                    fontSize: "0.88rem",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "0.35rem", fontSize: "0.72rem", letterSpacing: "0.06em", textTransform: "uppercase", color: "#0e52a8" }}>
                    Previous reply
                  </strong>
                  {selected.replyText}
                </div>
              ) : null}

              {canReply ? (
                <>
                  <label style={{ display: "grid", gap: "0.35rem", fontSize: "0.75rem", fontWeight: 700, color: "#334155" }}>
                    Reply
                    <textarea
                      rows={6}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a branded reply…"
                      style={{
                        width: "100%",
                        padding: "0.7rem 0.85rem",
                        borderRadius: "0.6rem",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        fontSize: "0.85rem",
                        resize: "vertical",
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => void sendReply()}
                    disabled={sending || !reply.trim()}
                  >
                    <RiReplyLine size={16} /> {sending ? "Sending…" : "Send reply"}
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
