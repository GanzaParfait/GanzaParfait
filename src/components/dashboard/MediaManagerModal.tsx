"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import MediaManagerPage from "@/app/dashboard/media/page";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  /** Defaults to any so images, video, and documents can be picked. */
  pickerMode?: "image" | "video" | "any";
  title?: string;
}

export default function MediaManagerModal({
  isOpen,
  onClose,
  onSelect,
  pickerMode = "any",
  title,
}: MediaManagerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useHistoryBackClose(Boolean(isOpen && mounted), onClose);

  if (!isOpen || !mounted) return null;

  const handleSelect = (url: string) => {
    if (url.startsWith("blob:")) return;
    onSelect(url);
    onClose();
  };

  const heading =
    title ||
    (pickerMode === "image"
      ? "Media Library — Select an image"
      : pickerMode === "video"
        ? "Media Library — Select a video"
        : "Media Library — Select media");

  const modal = (
    <div
      className="dash-modal-layer is-media"
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dash-modal-sheet is-media">
        <div
          className="dash-modal-head"
          style={{ background: "#0b1329", borderBottom: "none" }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#ffffff" }}>{heading}</span>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              cursor: "pointer",
              padding: "0.375rem",
              borderRadius: "0.25rem",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <MediaManagerPage onSelect={handleSelect} asModal pickerMode={pickerMode} />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
