"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  RiUploadCloud2Line,
  RiSearchLine,
  RiGridLine,
  RiListCheck,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiCheckLine,
  RiCloseLine,
  RiImageLine,
  RiAddLine,
  RiRefreshLine,
  RiLinkM,
  RiFolder3Line,
  RiLoader4Line,
} from "react-icons/ri";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "other";
  size?: string;
  uploadedAt: string;
  alt?: string;
}

// Persist media in localStorage for cross-modal access
const MEDIA_STORAGE_KEY = "ppg_media_assets";

const DEFAULT_ASSETS: MediaAsset[] = [
  { id: "m1", name: "hero-photo.png", url: "/images/profile/hero-photo.png", type: "image", uploadedAt: "2025-07-15", alt: "Prince Parfait GANZA portrait" },
  { id: "m2", name: "logo-horizontal-blue.png", url: "/brand/logos/logo-horizontal-blue.png", type: "image", uploadedAt: "2025-07-15", alt: "PPG Blue Logo" },
  { id: "m3", name: "logo-horizontal-dark.png", url: "/brand/logos/logo-horizontal-dark.png", type: "image", uploadedAt: "2025-07-15", alt: "PPG Dark Logo" },
  { id: "m4", name: "logo-horizontal-light.png", url: "/brand/logos/logo-horizontal-light.png", type: "image", uploadedAt: "2025-07-15", alt: "PPG Light Logo" },
  { id: "m5", name: "og-image.png", url: "/og-image.png", type: "image", uploadedAt: "2025-08-08", alt: "OG Social Share Image" },
];

export function getMediaAssets(): MediaAsset[] {
  if (typeof window === "undefined") return DEFAULT_ASSETS;
  try {
    const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_ASSETS;
}

export function saveMediaAsset(asset: MediaAsset): MediaAsset[] {
  const current = getMediaAssets();
  const exists = current.find((a) => a.id === asset.id);
  const updated = exists ? current : [asset, ...current];
  if (typeof window !== "undefined") {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function deleteMediaAsset(id: string): MediaAsset[] {
  const current = getMediaAssets().filter((a) => a.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(current));
  }
  return current;
}

interface MediaManagerPageProps {
  /** When used as a modal picker, pass this callback */
  onSelect?: (url: string) => void;
  /** When used as a modal, hide the outer layout chrome */
  asModal?: boolean;
}

export default function MediaManagerPage({ onSelect, asModal }: MediaManagerPageProps) {
  const [assets, setAssets] = useState<MediaAsset[]>(getMediaAssets());
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<"all" | "image" | "video">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || (a.alt || "").toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || a.type === filterType;
    return matchSearch && matchType;
  });

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const asset: MediaAsset = {
      id: Date.now().toString(),
      name: newName.trim() || newUrl.split("/").pop() || "asset",
      url: newUrl.trim(),
      type: newUrl.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) ? "image" : "other",
      alt: newAlt.trim(),
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    const updated = saveMediaAsset(asset);
    setAssets(updated);
    setIsAdding(false);
    setNewUrl("");
    setNewName("");
    setNewAlt("");
  };

  const handleDelete = (id: string) => {
    const updated = deleteMediaAsset(id);
    setAssets(updated);
    if (selectedId === id) setSelectedId(null);
    setDeleteConfirmId(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setIsUploading(true);
    // Simulate client-side URL conversion (real upload would go to Supabase Storage / Cloudinary)
    const newAssets: MediaAsset[] = files.map((f) => ({
      id: Date.now().toString() + Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : "other",
      size: (f.size / 1024).toFixed(1) + " KB",
      uploadedAt: new Date().toISOString().split("T")[0],
    }));
    setTimeout(() => {
      const allUpdated = [...newAssets, ...assets];
      setAssets(allUpdated);
      localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(allUpdated));
      setIsUploading(false);
    }, 800);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectedAsset = assets.find((a) => a.id === selectedId);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        overflow: "hidden",
      }}
    >
      {/* Sticky Header */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          flexShrink: 0,
          background: "#ffffff",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiFolder3Line style={{ color: "#1d4ed8" }} /> Media Library
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
            {assets.length} assets • Upload, browse and manage all your media
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <RiSearchLine size={14} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "0.375rem 0.75rem 0.375rem 2rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: "0.8125rem", color: "#0f172a", width: "11rem", outline: "none" }}
            />
          </div>

          {/* View Toggle */}
          <div style={{ display: "flex", background: "#f1f5f9", borderRadius: "0.375rem", padding: "2px", gap: "2px" }}>
            <button onClick={() => setViewMode("grid")} style={{ padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", background: viewMode === "grid" ? "#ffffff" : "transparent", color: "#0f172a", cursor: "pointer", boxShadow: viewMode === "grid" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}>
              <RiGridLine size={15} />
            </button>
            <button onClick={() => setViewMode("list")} style={{ padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", background: viewMode === "list" ? "#ffffff" : "transparent", color: "#0f172a", cursor: "pointer", boxShadow: viewMode === "list" ? "0 1px 2px rgba(0,0,0,0.1)" : "none" }}>
              <RiListCheck size={15} />
            </button>
          </div>

          {/* Add URL */}
          <button onClick={() => setIsAdding(!isAdding)} style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
            <RiLinkM size={14} /> Add URL
          </button>

          {/* Upload Files */}
          <label style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: "0.375rem", border: "none", background: "#1d4ed8", color: "#ffffff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>
            {isUploading ? <RiLoader4Line size={14} className="animate-spin" /> : <RiUploadCloud2Line size={14} />}
            {isUploading ? "Uploading..." : "Upload"}
            <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Filter Pills */}
      <div style={{ padding: "0.75rem 1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        {(["all", "image", "video"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid",
              borderColor: filterType === f ? "#1d4ed8" : "#e2e8f0",
              background: filterType === f ? "#eff6ff" : "#ffffff",
              color: filterType === f ? "#1d4ed8" : "#64748b",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "capitalize",
            }}
          >
            {f === "all" ? `All (${assets.length})` : f === "image" ? `Images (${assets.filter(a => a.type === "image").length})` : `Videos (${assets.filter(a => a.type === "video").length})`}
          </button>
        ))}
      </div>

      {/* Add URL Panel */}
      {isAdding && (
        <form
          onSubmit={handleAddUrl}
          style={{ padding: "1rem 1.5rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "flex-end", flexShrink: 0 }}
        >
          <div style={{ flex: "1 1 12rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>Asset Name</label>
            <input type="text" placeholder="hero-banner.png" value={newName} onChange={e => setNewName(e.target.value)}
              style={{ width: "100%", padding: "0.4rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.8125rem", color: "#0f172a" }} />
          </div>
          <div style={{ flex: "2 1 20rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>Image / Media URL <span style={{ color: "#ef4444" }}>*</span></label>
            <input type="url" required placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)}
              style={{ width: "100%", padding: "0.4rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.8125rem", color: "#0f172a" }} />
          </div>
          <div style={{ flex: "1 1 12rem" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>Alt Text</label>
            <input type="text" placeholder="Descriptive alt text" value={newAlt} onChange={e => setNewAlt(e.target.value)}
              style={{ width: "100%", padding: "0.4rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.8125rem", color: "#0f172a" }} />
          </div>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button type="button" onClick={() => setIsAdding(false)} style={{ padding: "0.4rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>Cancel</button>
            <button type="submit" style={{ padding: "0.4rem 0.875rem", borderRadius: "0.375rem", border: "none", background: "#1d4ed8", color: "#ffffff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>Save Asset</button>
          </div>
        </form>
      )}

      {/* Main Grid + Detail Panel */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Asset Grid */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "16rem", color: "#94a3b8", gap: "0.75rem" }}>
              <RiImageLine size={40} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>No assets found{search ? ` for "${search}"` : ""}</p>
              <button onClick={() => setIsAdding(true)} style={{ padding: "0.375rem 1rem", borderRadius: "0.375rem", border: "none", background: "#1d4ed8", color: "#ffffff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>
                Add Media Asset
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))", gap: "0.75rem" }}>
              {filtered.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(selectedId === asset.id ? null : asset.id)}
                  style={{
                    border: "2px solid",
                    borderColor: selectedId === asset.id ? "#1d4ed8" : "#e2e8f0",
                    borderRadius: "0.375rem",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#f8fafc",
                    transition: "all 0.15s ease",
                    boxShadow: selectedId === asset.id ? "0 0 0 3px rgba(29,78,216,0.15)" : "none",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "6.5rem", background: "#e2e8f0" }}>
                    <Image src={asset.url} alt={asset.alt || asset.name} fill className="object-cover" unoptimized />
                    {selectedId === asset.id && (
                      <div style={{ position: "absolute", top: "0.375rem", right: "0.375rem", width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#1d4ed8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <RiCheckLine size={10} color="#ffffff" />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.5rem" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{asset.name}</p>
                    <p style={{ fontSize: "0.625rem", color: "#94a3b8", marginTop: "0.1rem" }}>{asset.uploadedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {filtered.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(selectedId === asset.id ? null : asset.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.625rem 0.875rem",
                    border: "1px solid",
                    borderColor: selectedId === asset.id ? "#1d4ed8" : "#e2e8f0",
                    borderRadius: "0.375rem",
                    background: selectedId === asset.id ? "#eff6ff" : "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", width: "2.75rem", height: "2.25rem", borderRadius: "0.25rem", overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
                    <Image src={asset.url} alt={asset.name} fill className="object-cover" unoptimized />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{asset.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{asset.alt || "No alt text"} • {asset.uploadedAt}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyUrl(asset.url, asset.id); }}
                    style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: copiedId === asset.id ? "#16a34a" : "#64748b" }}
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <RiCheckLine size={15} /> : <RiFileCopyLine size={15} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(asset.id); }}
                    style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: "#ef4444" }}
                    title="Delete"
                  >
                    <RiDeleteBinLine size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Side Panel */}
        {selectedAsset && (
          <div
            style={{
              width: "17rem",
              borderLeft: "1px solid #e2e8f0",
              background: "#ffffff",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>Asset Details</span>
              <button onClick={() => setSelectedId(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}>
                <RiCloseLine size={16} />
              </button>
            </div>

            <div style={{ padding: "1rem", flex: 1 }}>
              <div style={{ position: "relative", width: "100%", height: "10rem", borderRadius: "0.375rem", overflow: "hidden", background: "#f1f5f9", marginBottom: "1rem" }}>
                <Image src={selectedAsset.url} alt={selectedAsset.alt || selectedAsset.name} fill className="object-contain" unoptimized />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem" }}>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Filename</p>
                  <p style={{ fontWeight: 700, color: "#0f172a", wordBreak: "break-all" }}>{selectedAsset.name}</p>
                </div>
                {selectedAsset.alt && (
                  <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Alt Text</p>
                    <p style={{ color: "#334155" }}>{selectedAsset.alt}</p>
                  </div>
                )}
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>URL</p>
                  <p style={{ color: "#1d4ed8", wordBreak: "break-all", fontSize: "0.75rem" }}>{selectedAsset.url}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Uploaded</p>
                  <p style={{ color: "#334155" }}>{selectedAsset.uploadedAt}</p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.25rem" }}>
                {onSelect && (
                  <button
                    onClick={() => { onSelect(selectedAsset.url); }}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.625rem", borderRadius: "0.375rem", border: "none", background: "#1d4ed8", color: "#ffffff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}
                  >
                    <RiCheckLine size={16} /> Use This Image
                  </button>
                )}
                <button
                  onClick={() => copyUrl(selectedAsset.url, selectedAsset.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
                >
                  {copiedId === selectedAsset.id ? <><RiCheckLine size={14} /> Copied!</> : <><RiFileCopyLine size={14} /> Copy URL</>}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(selectedAsset.id)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
                >
                  <RiDeleteBinLine size={14} /> Delete Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: "0.5rem", padding: "1.5rem", maxWidth: "22rem", width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>Delete Asset?</h4>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.25rem" }}>
              This will remove the asset from the media library. It won't delete the actual file from the server.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteConfirmId(null)} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirmId)} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", background: "#ef4444", color: "#ffffff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
