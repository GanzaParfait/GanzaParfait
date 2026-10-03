"use client";

import { useRef } from "react";
import { RiBold, RiItalic, RiLink } from "react-icons/ri";
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

  const apply = (kind: "bold" | "italic" | "link") => {
    const node = ref.current;
    if (!node) return;
    const start = node.selectionStart ?? 0;
    const end = node.selectionEnd ?? 0;
    let linkUrl: string | undefined;
    if (kind === "link") {
      const asked = window.prompt("Link URL (https://, mailto:, tel:, or /path)", "https://");
      if (asked === null) return;
      linkUrl = asked.trim();
    }
    const next = wrapAnnouncementSelection(value, start, end, kind, linkUrl);
    onChange(next.value);
    requestAnimationFrame(() => {
      node.focus();
      node.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  };

  return (
    <div className="ann-detail-editor">
      <div className="ann-detail-toolbar" role="toolbar" aria-label="Detail formatting">
        <button type="button" className="ann-detail-tool" onClick={() => apply("bold")} title="Bold">
          <RiBold size={15} />
        </button>
        <button type="button" className="ann-detail-tool" onClick={() => apply("italic")} title="Italic">
          <RiItalic size={15} />
        </button>
        <button type="button" className="ann-detail-tool" onClick={() => apply("link")} title="Add link">
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
    </div>
  );
}
