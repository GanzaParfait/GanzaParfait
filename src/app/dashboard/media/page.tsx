"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  RiLinkM,
  RiFolder3Line,
  RiLoader4Line,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiFilePdfLine,
  RiFileExcelLine,
  RiFileWordLine,
  RiFilePptLine,
  RiFileZipLine,
  RiFileTextLine,
  RiVideoLine,
  RiExternalLinkLine,
} from "react-icons/ri";
import { useDashboardFeedback } from "@/components/dashboard/DashboardFeedback";
import {
  LIBRARY_ACCEPT,
  MEDIA_MAX_FILE_BYTES,
  MEDIA_PAGE_SIZE,
  classifyMediaType,
  fileExtension,
  fileKindLabel,
  isDocumentFilterType,
  looksLikeMediaUrl,
  mediaSourceLabel,
  isAllowedLibraryFile,
  type MediaAsset,
  type MediaAssetType,
  type MediaFilterType,
} from "@/lib/media";

interface MediaManagerPageProps {
  onSelect?: (url: string) => void;
  asModal?: boolean;
  pickerMode?: "image" | "any";
}

function fileKindStyle(type: MediaAssetType) {
  if (type === "pdf") return { Icon: RiFilePdfLine, color: "#b91c1c", bg: "#fef2f2" };
  if (type === "spreadsheet") return { Icon: RiFileExcelLine, color: "#15803d", bg: "#f0fdf4" };
  if (type === "archive") return { Icon: RiFileZipLine, color: "#a16207", bg: "#fffbeb" };
  if (type === "video") return { Icon: RiVideoLine, color: "#6d28d9", bg: "#f5f3ff" };
  if (type === "image") return { Icon: RiImageLine, color: "#0e52a8", bg: "#eff6ff" };
  return { Icon: RiFileTextLine, color: "#334155", bg: "#f8fafc" };
}

function FileThumb({ asset, height = "6.5rem" }: { asset: MediaAsset; height?: string }) {
  const kind = fileKindStyle(asset.type);
  const ext = (fileExtension(asset.name) || fileKindLabel(asset.type)).toUpperCase();
  const compact = height === "2.25rem";
  if (asset.type === "image") {
    return <img src={asset.url} alt={asset.alt || asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  if (asset.type === "video") {
    return <video src={asset.url} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  const wordExt = fileExtension(asset.name);
  const Icon = wordExt.startsWith("ppt") ? RiFilePptLine : ["doc", "docx"].includes(wordExt) ? RiFileWordLine : kind.Icon;
  return (
    <div style={{ width: "100%", height, minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: compact ? "0.1rem" : "0.35rem", background: kind.bg }}>
      <Icon size={compact ? 14 : 28} color={kind.color} />
      {!compact && <span style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.04em", color: kind.color }}>{ext}</span>}
    </div>
  );
}

function pageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const unique = new Set([1, total, current - 1, current, current + 1]);
  return [...unique].filter((value) => value >= 1 && value <= total).sort((a, b) => a - b);
}

function uploadWithProgress(files: File[], onProgress: (percent: number) => void): Promise<MediaAsset[]> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    files.forEach((file) => form.append("files", file));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.max(8, Math.round((event.loaded / event.total) * 90)));
    };
    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText || "{}") as { assets?: MediaAsset[]; error?: string };
        if (xhr.status >= 200 && xhr.status < 300 && payload.assets) {
          onProgress(100);
          resolve(payload.assets);
          return;
        }
        reject(new Error(payload.error || "Could not upload that file."));
      } catch {
        reject(new Error("Could not upload that file."));
      }
    };
    xhr.onerror = () => reject(new Error("Could not reach the media library."));
    xhr.send(form);
  });
}

export default function MediaManagerPage({ onSelect, asModal, pickerMode = "any" }: MediaManagerPageProps) {
  const { notify } = useDashboardFeedback();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<MediaFilterType>("all");
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [urlError, setUrlError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/media", { cache: "no-store", credentials: "include" });
      const payload = (await res.json()) as { assets?: MediaAsset[]; error?: string };
      if (!res.ok) throw new Error(payload.error || "Could not load media.");
      setAssets(payload.assets || []);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not load media.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return assets.filter((asset) => {
      const matchSearch =
        !query ||
        asset.name.toLowerCase().includes(query) ||
        (asset.alt || "").toLowerCase().includes(query);
      const matchType =
        filterType === "all" ||
        (filterType === "document" ? isDocumentFilterType(asset.type) : asset.type === filterType);
      return matchSearch && matchType;
    });
  }, [assets, search, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / MEDIA_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * MEDIA_PAGE_SIZE;
  const paged = filtered.slice(pageStart, pageStart + MEDIA_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, filterType]);

  const previewUrl = looksLikeMediaUrl(newUrl.trim()) ? newUrl.trim() : "";
  const previewType = classifyMediaType(undefined, previewUrl);

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const resetUrlForm = () => {
    setNewUrl("");
    setNewName("");
    setNewAlt("");
    setUrlError("");
    setPreviewFailed(false);
  };

  const handleImportUrl = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!previewUrl) {
      setUrlError("Paste a public https:// file URL.");
      return;
    }
    setIsImporting(true);
    setUrlError("");
    try {
      const res = await fetch("/api/media/from-url", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: previewUrl, name: newName.trim(), alt: newAlt.trim() }),
      });
      const payload = (await res.json()) as { asset?: MediaAsset; error?: string };
      if (!res.ok || !payload.asset) throw new Error(payload.error || "Could not import that URL.");
      setAssets((current) => [payload.asset!, ...current.filter((item) => item.id !== payload.asset!.id)]);
      setIsAdding(false);
      resetUrlForm();
      setSelectedId(payload.asset.id);
      setPage(1);
      notify(payload.asset.type === "image" ? "Image imported into the library." : "File imported into the library.");
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : "Could not import that URL.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE", credentials: "include" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(payload.error || "Could not delete that asset.");
      setAssets((current) => current.filter((asset) => asset.id !== id));
      if (selectedId === id) setSelectedId(null);
      setDeleteConfirmId(null);
      notify("Asset removed from the library.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not delete that asset.", "error");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const blocked = files.find((file) => !isAllowedLibraryFile(file.type, file.name));
    if (blocked) {
      notify(`${blocked.name} is not an allowed file type.`, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    const oversized = files.find((file) => file.size > MEDIA_MAX_FILE_BYTES);
    if (oversized) {
      notify(`${oversized.name} is larger than 10 MB.`, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setIsUploading(true);
    setUploadProgress(8);
    try {
      const uploaded = await uploadWithProgress(files, setUploadProgress);
      setAssets((current) => [...uploaded, ...current]);
      setSelectedId(uploaded[0]?.id || null);
      setPage(1);
      notify(uploaded.length === 1 ? `${fileKindLabel(uploaded[0].type)} uploaded.` : `${uploaded.length} files uploaded.`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not upload that file.", "error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const selectedAsset = assets.find((asset) => asset.id === selectedId);
  const imageCount = assets.filter((asset) => asset.type === "image").length;
  const videoCount = assets.filter((asset) => asset.type === "video").length;
  const documentCount = assets.filter((asset) => isDocumentFilterType(asset.type)).length;
  const canUseSelected = Boolean(selectedAsset && onSelect && (pickerMode === "any" || selectedAsset.type === "image"));

  return (
    <div
      style={{
        height: "100%",
        minHeight: asModal ? 0 : "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: asModal ? "0.85rem 1rem" : "0 0 0.9rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#0b192c", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <RiFolder3Line style={{ color: "#0e52a8" }} /> Media Library
          </h2>
          <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.1rem" }}>
            {assets.length} stored assets. Images, video, PDF, Excel, and other blog files up to 10 MB.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <RiSearchLine size={14} style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: "0.375rem 0.75rem 0.375rem 2rem", borderRadius: "0.375rem", border: "1px solid #dbe4f0", background: "rgba(255,255,255,0.72)", fontSize: "0.8125rem", color: "#0f172a", width: "11rem", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", background: "rgba(255,255,255,0.55)", borderRadius: "0.375rem", padding: "2px", gap: "2px", border: "1px solid #dbe4f0" }}>
            <button type="button" onClick={() => setViewMode("grid")} style={{ padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", background: viewMode === "grid" ? "#ffffff" : "transparent", color: "#0f172a", cursor: "pointer" }}>
              <RiGridLine size={15} />
            </button>
            <button type="button" onClick={() => setViewMode("list")} style={{ padding: "0.25rem 0.5rem", borderRadius: "0.25rem", border: "none", background: viewMode === "list" ? "#ffffff" : "transparent", color: "#0f172a", cursor: "pointer" }}>
              <RiListCheck size={15} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsAdding((open) => !open);
              setUrlError("");
            }}
            style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #dbe4f0", background: "rgba(255,255,255,0.8)", color: "#0f172a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}
          >
            <RiLinkM size={14} /> Add URL
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0.875rem", borderRadius: "0.375rem", border: "none", background: "#0e52a8", color: "#ffffff", cursor: isUploading ? "wait" : "pointer", fontSize: "0.8125rem", fontWeight: 700, overflow: "hidden", position: "relative" }}
          >
            {isUploading && (
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: "rgba(255,255,255,0.2)", width: `${uploadProgress}%` }} />
            )}
            <span style={{ position: "relative", display: "flex", alignItems: "center", gap: "0.375rem", zIndex: 1 }}>
              {isUploading ? <RiLoader4Line size={14} className="animate-spin" /> : <RiUploadCloud2Line size={14} />}
              {isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : "Upload"}
            </span>
          </button>
          <input ref={fileInputRef} type="file" multiple accept={LIBRARY_ACCEPT} style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
        </div>
      </div>

      <div style={{ padding: asModal ? "0 1rem 0.75rem" : "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
        {([
          { id: "all", label: `All (${assets.length})` },
          { id: "image", label: `Images (${imageCount})` },
          { id: "video", label: `Videos (${videoCount})` },
          { id: "document", label: `Documents (${documentCount})` },
        ] as const).map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setFilterType(filter.id)}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid",
              borderColor: filterType === filter.id ? "#0e52a8" : "#dbe4f0",
              background: filterType === filter.id ? "rgba(14,82,168,0.08)" : "rgba(255,255,255,0.55)",
              color: filterType === filter.id ? "#0e52a8" : "#64748b",
              cursor: "pointer",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isAdding && (
        <form
          onSubmit={handleImportUrl}
          style={{
            margin: asModal ? "0 1rem 0.9rem" : "0 0 0.9rem",
            padding: "1rem",
            background: "rgba(255,255,255,0.72)",
            border: "1px solid #dbe4f0",
            borderRadius: "0.5rem",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 11rem",
            gap: "0.85rem",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            <div>
              <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>
                Image / file URL <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => {
                  setNewUrl(e.target.value);
                  setUrlError("");
                  setPreviewFailed(false);
                }}
                style={{ width: "100%", padding: "0.4rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.8125rem", color: "#0f172a" }}
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <div>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>Asset Name</label>
                <input type="text" placeholder="hero-banner.png" value={newName} onChange={(e) => setNewName(e.target.value)}
                  style={{ width: "100%", padding: "0.4rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.8125rem", color: "#0f172a" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.7rem", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "0.25rem" }}>Description / Alt</label>
                <input type="text" placeholder="What this file is for" value={newAlt} onChange={(e) => setNewAlt(e.target.value)}
                  style={{ width: "100%", padding: "0.4rem 0.625rem", borderRadius: "0.375rem", border: "1px solid #cbd5e1", background: "#ffffff", fontSize: "0.8125rem", color: "#0f172a" }} />
              </div>
            </div>
            {urlError && <p style={{ fontSize: "0.75rem", color: "#b91c1c" }}>{urlError}</p>}
            <div style={{ display: "flex", gap: "0.375rem" }}>
              <button type="button" onClick={() => { setIsAdding(false); resetUrlForm(); }} style={{ padding: "0.4rem 0.75rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
                Cancel
              </button>
              <button type="submit" disabled={isImporting || !previewUrl} style={{ padding: "0.4rem 0.875rem", borderRadius: "0.375rem", border: "none", background: "#0e52a8", color: "#ffffff", cursor: isImporting ? "wait" : "pointer", fontSize: "0.8125rem", fontWeight: 700, opacity: isImporting || !previewUrl ? 0.7 : 1 }}>
                {isImporting ? "Importing…" : "Import to library"}
              </button>
            </div>
          </div>
          <div style={{ border: "1px dashed #cbd5e1", borderRadius: "0.5rem", background: "#f8fafc", minHeight: "9.5rem", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "0.4rem" }}>
            {!previewUrl ? (
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", padding: "0.75rem" }}>Paste a URL to preview before importing.</p>
            ) : previewFailed && previewType === "image" ? (
              <p style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", padding: "0.75rem" }}>Preview blocked by the source. You can still import it.</p>
            ) : previewType === "video" ? (
              <video src={previewUrl} muted playsInline style={{ width: "100%", height: "9rem", objectFit: "contain" }} onError={() => setPreviewFailed(true)} />
            ) : previewType === "image" ? (
              <img src={previewUrl} alt="URL preview" style={{ width: "100%", height: "9rem", objectFit: "contain" }} onError={() => setPreviewFailed(true)} />
            ) : (
              <div style={{ textAlign: "center", padding: "0.75rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#0e52a8" }}>{fileKindLabel(previewType)}</p>
                <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "0.25rem" }}>{fileExtension(previewUrl).toUpperCase() || "File"} ready to import</p>
              </div>
            )}
          </div>
        </form>
      )}

      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, gap: selectedAsset ? "0.9rem" : 0 }}>
        <div style={{ flex: 1, overflowY: "auto", minWidth: 0, paddingRight: "0.15rem" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "16rem", color: "#64748b", gap: "0.6rem" }}>
              <RiLoader4Line size={22} className="animate-spin" color="#0e52a8" />
              Loading library…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "16rem", color: "#64748b", gap: "0.75rem" }}>
              <RiImageLine size={40} style={{ opacity: 0.35 }} />
              <p style={{ fontSize: "0.875rem", fontWeight: 600 }}>No assets found{search ? ` for "${search}"` : ""}</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => fileInputRef.current?.click()} style={{ padding: "0.375rem 1rem", borderRadius: "0.375rem", border: "none", background: "#0e52a8", color: "#ffffff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>
                  Upload a file
                </button>
                <button type="button" onClick={() => setIsAdding(true)} style={{ padding: "0.375rem 1rem", borderRadius: "0.375rem", border: "1px solid #dbe4f0", background: "rgba(255,255,255,0.8)", color: "#0f172a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}>
                  Add from URL
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(9rem, 1fr))", gap: "0.75rem" }}>
              {paged.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(selectedId === asset.id ? null : asset.id)}
                  style={{
                    border: "2px solid",
                    borderColor: selectedId === asset.id ? "#0e52a8" : "#dbe4f0",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "rgba(255,255,255,0.78)",
                    boxShadow: selectedId === asset.id ? "0 0 0 3px rgba(14,82,168,0.15)" : "none",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", height: "6.5rem", background: "#e2e8f0" }}>
                    <FileThumb asset={asset} />
                    {selectedId === asset.id && (
                      <div style={{ position: "absolute", top: "0.375rem", right: "0.375rem", width: "1.25rem", height: "1.25rem", borderRadius: "50%", background: "#0e52a8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <RiCheckLine size={10} color="#ffffff" />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "0.5rem" }}>
                    <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{asset.name}</p>
                    <p style={{ fontSize: "0.625rem", color: "#94a3b8", marginTop: "0.1rem" }}>{fileKindLabel(asset.type)} · {asset.uploadedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              {paged.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedId(selectedId === asset.id ? null : asset.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.625rem 0.875rem",
                    border: "1px solid",
                    borderColor: selectedId === asset.id ? "#0e52a8" : "#dbe4f0",
                    borderRadius: "0.5rem",
                    background: selectedId === asset.id ? "rgba(14,82,168,0.08)" : "rgba(255,255,255,0.78)",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ position: "relative", width: "2.75rem", height: "2.25rem", borderRadius: "0.25rem", overflow: "hidden", background: "#e2e8f0", flexShrink: 0 }}>
                    <FileThumb asset={asset} height="2.25rem" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#0f172a", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{asset.name}</p>
                    <p style={{ fontSize: "0.7rem", color: "#64748b" }}>{fileKindLabel(asset.type)} · {asset.size || mediaSourceLabel(asset)} · {asset.uploadedAt}</p>
                  </div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); copyUrl(asset.url, asset.id); }} style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: copiedId === asset.id ? "#16a34a" : "#64748b" }} title="Copy URL">
                    {copiedId === asset.id ? <RiCheckLine size={15} /> : <RiFileCopyLine size={15} />}
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(asset.id); }} style={{ padding: "0.25rem", border: "none", background: "none", cursor: "pointer", color: "#ef4444" }} title="Delete">
                    <RiDeleteBinLine size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedAsset && (
          <div
            style={{
              width: "17rem",
              border: "1px solid #dbe4f0",
              background: "rgba(255,255,255,0.86)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              overflowY: "auto",
              borderRadius: "0.5rem",
            }}
          >
            <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>Asset Details</span>
              <button type="button" onClick={() => setSelectedId(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}>
                <RiCloseLine size={16} />
              </button>
            </div>
            <div style={{ padding: "1rem", flex: 1 }}>
              <div style={{ position: "relative", width: "100%", height: "10rem", borderRadius: "0.375rem", overflow: "hidden", background: "#f1f5f9", marginBottom: "1rem" }}>
                {selectedAsset.type === "video" ? (
                  <video src={selectedAsset.url} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : selectedAsset.type === "image" ? (
                  <img src={selectedAsset.url} alt={selectedAsset.alt || selectedAsset.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : selectedAsset.type === "pdf" ? (
                  <iframe title={selectedAsset.name} src={selectedAsset.url} style={{ width: "100%", height: "100%", border: "none" }} />
                ) : (
                  <FileThumb asset={selectedAsset} height="10rem" />
                )}
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
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Type</p>
                    <p style={{ color: "#334155" }}>{fileKindLabel(selectedAsset.type)} · {mediaSourceLabel(selectedAsset)}{selectedAsset.size ? ` · ${selectedAsset.size}` : ""}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>URL</p>
                  <p style={{ color: "#0e52a8", wordBreak: "break-all", fontSize: "0.75rem" }}>{selectedAsset.url}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Uploaded</p>
                  <p style={{ color: "#334155" }}>{selectedAsset.uploadedAt}</p>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1.25rem" }}>
                {canUseSelected && (
                  <button
                    type="button"
                    onClick={() => onSelect?.(selectedAsset.url)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.625rem", borderRadius: "0.375rem", border: "none", background: "#0e52a8", color: "#ffffff", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 700 }}
                  >
                    <RiCheckLine size={16} /> {selectedAsset.type === "image" ? "Use This Image" : "Use This File"}
                  </button>
                )}
                {onSelect && selectedAsset.type !== "image" && pickerMode === "image" && (
                  <p style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}>Cover and hero pickers need an image. Copy the URL to use this file in a blog post.</p>
                )}
                <a
                  href={selectedAsset.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600, textDecoration: "none" }}
                >
                  <RiExternalLinkLine size={14} /> Open file
                </a>
                <button type="button" onClick={() => copyUrl(selectedAsset.url, selectedAsset.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#0f172a", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
                  {copiedId === selectedAsset.id ? <><RiCheckLine size={14} /> Copied!</> : <><RiFileCopyLine size={14} /> Copy URL</>}
                </button>
                <button type="button" onClick={() => setDeleteConfirmId(selectedAsset.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem", padding: "0.5rem", borderRadius: "0.375rem", border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444", cursor: "pointer", fontSize: "0.8125rem", fontWeight: 600 }}>
                  <RiDeleteBinLine size={14} /> Delete Asset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.85rem", flexShrink: 0 }}>
          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Showing {pageStart + 1}–{Math.min(pageStart + MEDIA_PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage <= 1}
              style={{ display: "flex", alignItems: "center", padding: "0.3rem 0.45rem", borderRadius: "0.35rem", border: "1px solid #dbe4f0", background: "rgba(255,255,255,0.8)", color: "#0f172a", cursor: currentPage <= 1 ? "not-allowed" : "pointer", opacity: currentPage <= 1 ? 0.45 : 1 }}
            >
              <RiArrowLeftSLine size={16} />
            </button>
            {pageNumbers(currentPage, totalPages).map((pageNumber, index, list) => {
              const previous = list[index - 1];
              return (
                <span key={pageNumber} style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  {previous && pageNumber - previous > 1 && (
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem", padding: "0 0.15rem" }}>…</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    style={{
                      minWidth: "2rem",
                      padding: "0.3rem 0.45rem",
                      borderRadius: "0.35rem",
                      border: "1px solid",
                      borderColor: currentPage === pageNumber ? "#0e52a8" : "#dbe4f0",
                      background: currentPage === pageNumber ? "#0e52a8" : "rgba(255,255,255,0.8)",
                      color: currentPage === pageNumber ? "#ffffff" : "#0f172a",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {pageNumber}
                  </button>
                </span>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              disabled={currentPage >= totalPages}
              style={{ display: "flex", alignItems: "center", padding: "0.3rem 0.45rem", borderRadius: "0.35rem", border: "1px solid #dbe4f0", background: "rgba(255,255,255,0.8)", color: "#0f172a", cursor: currentPage >= totalPages ? "not-allowed" : "pointer", opacity: currentPage >= totalPages ? 0.45 : 1 }}
            >
              <RiArrowRightSLine size={16} />
            </button>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div style={{ position: "fixed", inset: 0, zIndex: 250, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: "0.5rem", padding: "1.5rem", maxWidth: "22rem", width: "100%", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>Delete Asset?</h4>
            <p style={{ fontSize: "0.8125rem", color: "#64748b", marginBottom: "1.25rem" }}>
              This removes the file from the media library and storage.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setDeleteConfirmId(null)} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "1px solid #e2e8f0", background: "#ffffff", color: "#64748b", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}>Cancel</button>
              <button type="button" onClick={() => handleDelete(deleteConfirmId)} style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", background: "#ef4444", color: "#ffffff", cursor: "pointer", fontWeight: 700, fontSize: "0.875rem" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
