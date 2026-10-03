"use client";

import { useEffect, useId, useRef, useState } from "react";
import { RiBold, RiCloseLine, RiItalic, RiLink } from "react-icons/ri";
import { wrapAnnouncementSelection } from "@/lib/announcement-format";

const areaStyle = {
  width: "100%",
  padding: "0.65rem 0.75rem",
  borderRadius: "0.65rem",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  fontSize: "0.82rem",
  color: "#0f172a",
  outline: "none",
  minHeight: "9rem",
  resize: "vertical" as const,
  whiteSpace: "pre-wrap" as const,
  overflowWrap: "anywhere" as const,
  lineHeight: 1.55,
  fontFamily: "inherit",
};

export default function AnnouncementDetailEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const titleId = useId();
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkLabel, setLinkLabel] = useState("");
  const selectionRef = useRef({ start: 0, end: 0 });

  useEffect(() => {
    if (!linkOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLinkOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [linkOpen]);

  const applyMark = (kind: "bold" | "italic") => {
    const node = ref.current;
    if (!node) return;
    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? 0;
    const next = wrapAnnouncementSelection(value, start, end, kind);
    onChange(next.value);
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  const openLinkModal = () => {
    const node = ref.current;
    const start = node?.selectionStart ?? 0;
    const end = node?.selectionEnd ?? 0;
    selectionRef.current = { start, end };
    const selected = value.slice(start, end).trim();
    setLinkLabel(selected);
    setLinkUrl(selected.startsWith("http") || selected.startsWith("/") ? selected : "https://");
    setLinkOpen(true);
  };

  const insertLink = () => {
    const href = linkUrl.trim();
    if (!href) return;
    const { start, end } = selectionRef.current;
    const next = wrapAnnouncementSelection(value, start, end, "link", href, linkLabel.trim() || undefined);
    onChange(next.value);
    setLinkOpen(false);
    requestAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      node.focus();
      node.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  return (
    <div className="ann-detail-editor">
      <div className="ann-detail-toolbar" role="toolbar" aria-label="Detail formatting">
        <button type="button" className="ann-detail-tool" onClick={() => applyMark("bold")} title="Bold">
          <RiBold size={15} />
        </button>
        <button type="button" className="ann-detail-tool" onClick={() => applyMark("italic")} title="Italic">
          <RiItalic size={15} />
        </button>
        <button type="button" className="ann-detail-tool" onClick={openLinkModal} title="Add link">
          <RiLink size={15} />
        </button>
        <span className="ann-detail-toolbar-hint">Bold · Italic · Link — line breaks keep as typed</span>
      </div>
      <textarea
        ref={ref}
        className="ann-field-area is-tall"
        style={areaStyle}
        rows={9}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />

      {linkOpen ? (
        <div className="ann-link-layer" role="presentation" onClick={() => setLinkOpen(false)}>
          <div
            className="ann-link-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="ann-link-sheet-head">
              <div>
                <p className="section-label" style={{ margin: 0 }}>
                  Detail link
                </p>
                <h3 id={titleId}>Add link</h3>
              </div>
              <button type="button" className="ann-link-close" onClick={() => setLinkOpen(false)} aria-label="Close">
                <RiCloseLine size={18} />
              </button>
            </header>
            <label className="ann-field">
              Link URL
              <input
                className="ann-link-input"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                placeholder="https://, mailto:, tel:, or /path"
                autoFocus
              />
            </label>
            <label className="ann-field">
              Display name <span className="ann-field-hint">(optional — leave blank to use the URL)</span>
              <input
                className="ann-link-input"
                value={linkLabel}
                onChange={(event) => setLinkLabel(event.target.value)}
                placeholder="Visit us"
              />
            </label>
            <div className="ann-link-sheet-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setLinkOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={insertLink} disabled={!linkUrl.trim()}>
                Insert link
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
