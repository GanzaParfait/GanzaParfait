"use client";

import { useState } from "react";
import Image from "next/image";
import { RiCloseLine, RiCheckLine, RiAddLine, RiImageLine, RiSearchLine, RiDeleteBinLine } from "react-icons/ri";

export interface MediaItem {
  id: string;
  title: string;
  url: string;
}

const DEFAULT_MEDIA: MediaItem[] = [
  { id: "m1", title: "Prince Parfait Portrait Photo", url: "/images/profile/hero-photo.png" },
  { id: "m2", title: "Horizontal Dark Logo", url: "/brand/logos/logo-horizontal-dark.png" },
  { id: "m3", title: "Horizontal Light Logo", url: "/brand/logos/logo-horizontal-light.png" },
  { id: "m4", title: "Horizontal Blue Logo", url: "/brand/logos/logo-horizontal-blue.png" },
];

interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaManagerModal({ isOpen, onClose, onSelect }: MediaManagerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(DEFAULT_MEDIA);
  const [search, setSearch] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const filtered = mediaList.filter(
    (m) => m.title.toLowerCase().includes(search.toLowerCase()) || m.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const newItem: MediaItem = {
      id: Date.now().toString(),
      title: newTitle.trim() || "Uploaded Asset",
      url: newUrl.trim(),
    };
    setMediaList([newItem, ...mediaList]);
    onSelect(newItem.url);
    setNewUrl("");
    setNewTitle("");
    setIsAdding(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0, 0, 0, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "48rem",
          maxHeight: "85vh",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "1.5rem",
          boxShadow: "var(--shadow-xl)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.25rem 1.75rem",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <RiImageLine style={{ color: "var(--color-primary)" }} /> Reusable Media Library
            </h3>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-3)", marginTop: "0.15rem" }}>
              Select an asset or attach a new media URL for banners, projects, blogs, or profiles
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "0.5rem" }}>
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Search & Add Bar */}
        <div style={{ padding: "1rem 1.75rem", borderBottom: "1px solid var(--color-border)", display: "flex", gap: "1rem", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <RiSearchLine size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-3)" }} />
            <input
              type="text"
              placeholder="Search media assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.875rem 0.5rem 2.375rem",
                borderRadius: "0.625rem",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                fontSize: "0.8125rem",
                color: "var(--color-text)",
                outline: "none",
              }}
            />
          </div>
          <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary btn-sm" style={{ gap: "0.375rem" }}>
            <RiAddLine size={16} /> Add Media URL
          </button>
        </div>

        {/* Add Form Collapsible */}
        {isAdding && (
          <form onSubmit={handleAddMedia} style={{ padding: "1.25rem 1.75rem", background: "rgba(14, 82, 168, 0.05)", borderBottom: "1px solid var(--color-border)", display: "grid", gap: "0.75rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="Asset Title (e.g. Hero Banner)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: "0.8125rem", color: "var(--color-text)" }}
              />
              <input
                type="url"
                required
                placeholder="Media Image URL (https://...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                style={{ padding: "0.5rem 0.75rem", borderRadius: "0.5rem", background: "var(--color-surface)", border: "1px solid var(--color-border)", fontSize: "0.8125rem", color: "var(--color-text)" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
              <button type="button" onClick={() => setIsAdding(false)} className="btn btn-ghost btn-sm">Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save & Select Asset</button>
            </div>
          </form>
        )}

        {/* Grid List */}
        <div style={{ flex: 1, padding: "1.5rem 1.75rem", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--color-text-3)" }}>
              <RiImageLine size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.5 }} />
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>No media assets matched your search.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))", gap: "1.25rem" }}>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.url);
                    onClose();
                  }}
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.875rem",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "var(--color-bg)",
                    transition: "all 0.2s ease",
                  }}
                  className="card-hover"
                >
                  <div style={{ position: "relative", width: "100%", height: "7rem", background: "#f1f5f9" }}>
                    <Image src={item.url} alt={item.title} fill className="object-cover" />
                  </div>
                  <div style={{ padding: "0.625rem 0.75rem" }}>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{item.title}</p>
                    <p style={{ fontSize: "0.65rem", color: "var(--color-text-3)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", marginTop: "0.1rem" }}>{item.url}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
