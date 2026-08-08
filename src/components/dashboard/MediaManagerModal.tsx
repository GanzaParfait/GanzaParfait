"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import MediaManagerPage from "@/app/dashboard/media/page";

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaManagerModal({ isOpen, onClose, onSelect }: MediaManagerModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  const modal = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 500, // always on top
        background: "rgba(0, 0, 0, 0.70)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "62rem",
          height: "min(88vh, 700px)",
          background: "#ffffff",
          borderRadius: "0.5rem",
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Modal top-bar close */}
        <div
          style={{
            padding: "0.75rem 1rem",
            background: "#0b1329",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#ffffff" }}>
            Media Library — Select an Asset
          </span>
          <button
            onClick={onClose}
            style={{ border: "none", background: "rgba(255,255,255,0.1)", color: "#ffffff", cursor: "pointer", padding: "0.375rem", borderRadius: "0.25rem", display: "flex", alignItems: "center" }}
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Embed full media manager */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <MediaManagerPage onSelect={handleSelect} asModal />
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
