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
  MEDIA_MAX_VIDEO_BYTES,
  mediaMaxBytesFor,
  mediaMaxLabel,
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
import { cloudinaryVideoPosterUrl } from "@/lib/cloudinary-url";

interface MediaManagerPageProps {
  onSelect?: (url: string) => void;
  asModal?: boolean;
  pickerMode?: "image" | "video" | "any";
}

function fileKindStyle(type: MediaAssetType) {
  if (type === "pdf") return { Icon: RiFilePdfLine, color: "#b91c1c", bg: "#fef2f2" };
  if (type === "spreadsheet") return { Icon: RiFileExcelLine, color: "#15803d", bg: "#f0fdf4" };
  if (type === "archive") return { Icon: RiFileZipLine, color: "#a16207", bg: "#fffbeb" };
  if (type === "video") return { Icon: RiVideoLine, color: "#6d28d9", bg: "#f5f3ff" };
  if (type === "image") return { Icon: RiImageLine, color: "#0e52a8", bg: "#eff6ff" };
  return { Icon: RiFileTextLine, color: "#334155", bg: "#f8fafc" };
}

/** Keep labels short so hash/URL dumps cannot blow out the detail panel layout. */
function clampMediaLabel(value: string, max = 140) {
  const text = value.trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1))}…`;
}

function mediaImgAlt(asset: MediaAsset) {
  const alt = (asset.alt || "").trim();
  const name = (asset.name || "").trim();
  // Hash-only alt text is useless for a11y and can stall layout with unbroken strings.
  if (alt && alt.length <= 160 && !/^[a-f0-9._-]{40,}$/i.test(alt)) {
    return alt;
  }
  return clampMediaLabel(name || "Media asset", 80);
}

function FileThumb({ asset, height = "6.5rem" }: { asset: MediaAsset; height?: string }) {
  const kind = fileKindStyle(asset.type);
  const ext = (fileExtension(asset.name) || fileKindLabel(asset.type)).toUpperCase();
  const compact = height === "2.25rem";
  if (asset.type === "image") {
    return <img src={asset.url} alt={mediaImgAlt(asset)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />;
  }
  if (asset.type === "video") {
    const poster = cloudinaryVideoPosterUrl(asset.url, { width: 480 });
    return (
      <div style={{ position: "relative", width: "100%", height: "100%", background: "#0b1329" }}>
        {poster ? (
          <img src={poster} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <video src={asset.url} muted preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        <span
          style={{
            position: "absolute",
            left: compact ? "0.2rem" : "0.4rem",
            bottom: compact ? "0.2rem" : "0.4rem",
            fontSize: compact ? "0.5rem" : "0.62rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "#fff",
            background: "rgba(11,25,44,0.72)",
            padding: "0.1rem 0.35rem",
            borderRadius: "999px",
          }}
        >
          Video
        </span>
      </div>
    );
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

type UploadProgressHandler = (percent: number, label?: string) => void;

function xhrFormUpload(url: string, form: FormData, onProgress: UploadProgressHandler): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = url.startsWith("/") || url.includes(window.location.host);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || event.total <= 0) return;
      onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      resolve(
        new Response(xhr.responseText, {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: { "Content-Type": xhr.getResponseHeader("Content-Type") || "application/json" },
        }),
      );
    };
    xhr.onerror = () => reject(new Error("Could not reach the upload endpoint."));
    xhr.send(form);
  });
}

async function uploadFileViaCloudinary(file: File, onProgress: UploadProgressHandler): Promise<MediaAsset> {
  onProgress(0, "Preparing CDN upload…");
  const signRes = await fetch("/api/media/sign", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, mimeType: file.type }),
  });
  const signPayload = (await signRes.json()) as {
    error?: string;
    cloudName?: string;
    apiKey?: string;
    timestamp?: number;
    signature?: string;
    folder?: string;
    resourceType?: string;
    uploadPreset?: string;
  };
  if (!signRes.ok || !signPayload.cloudName) {
    throw new Error(signPayload.error || "Could not prepare Cloudinary upload.");
  }

  const resourceType = signPayload.resourceType === "video" ? "video" : signPayload.resourceType === "image" ? "image" : "auto";
  const endpoint = `https://api.cloudinary.com/v1_1/${signPayload.cloudName}/${resourceType}/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("folder", signPayload.folder || "princeparfait/library");
  // Prefer signed uploads (secure). Unsigned preset only when no signature was issued.
  if (signPayload.signature && signPayload.apiKey && signPayload.timestamp) {
    form.append("api_key", String(signPayload.apiKey));
    form.append("timestamp", String(signPayload.timestamp));
    form.append("signature", String(signPayload.signature));
  } else if (signPayload.uploadPreset) {
    form.append("upload_preset", signPayload.uploadPreset);
  } else {
    throw new Error("Cloudinary sign response was incomplete.");
  }

  onProgress(1, "Uploading to Cloudinary…");
  const uploadRes = await xhrFormUpload(endpoint, form, (percent) => {
    onProgress(Math.min(96, percent), "Uploading to Cloudinary…");
  });
  const uploaded = (await uploadRes.json()) as {
    error?: { message?: string } | string;
    public_id?: string;
    secure_url?: string;
    url?: string;
    bytes?: number;
    resource_type?: string;
    format?: string;
    width?: number;
    height?: number;
    original_filename?: string;
  };
  if (!uploadRes.ok || !uploaded.public_id || !(uploaded.secure_url || uploaded.url)) {
    const message =
      typeof uploaded.error === "string"
        ? uploaded.error
        : uploaded.error?.message || `Cloudinary upload failed (${uploadRes.status}).`;
    throw new Error(message);
  }

  onProgress(98, "Saving to library…");
  const registerRes = await fetch("/api/media/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicId: uploaded.public_id,
      secureUrl: uploaded.secure_url || uploaded.url,
      bytes: uploaded.bytes,
      resourceType: uploaded.resource_type || resourceType,
      format: uploaded.format,
      width: uploaded.width,
      height: uploaded.height,
      originalFilename: file.name || uploaded.original_filename,
      mimeType: file.type,
    }),
  });
  const registerPayload = (await registerRes.json()) as { asset?: MediaAsset; error?: string };
  if (!registerRes.ok || !registerPayload.asset) {
    throw new Error(registerPayload.error || "Uploaded to Cloudinary, but could not save the library entry.");
  }
  onProgress(100, "Done");
  return registerPayload.asset;
}

async function uploadFilesViaServer(files: File[], onProgress: UploadProgressHandler): Promise<MediaAsset[]> {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  onProgress(1, "Uploading to server…");
  const res = await xhrFormUpload("/api/media", form, (percent) => {
    // Server still re-uploads afterward; keep a little headroom until JSON returns.
    onProgress(Math.min(92, percent), "Uploading to server…");
  });
  const payload = (await res.json()) as { assets?: MediaAsset[]; error?: string };
  if (res.status === 413) {
    throw new Error("That file is too large for the server proxy. Configure Cloudinary for videos, or use a smaller file.");
  }
  if (!res.ok || !payload.assets) {
    throw new Error(payload.error || `Upload failed (${res.status}).`);
  }
  onProgress(100, "Done");
  return payload.assets;
}

async function uploadLibraryFiles(
  files: File[],
  preferCloudinary: boolean,
  onProgress: UploadProgressHandler,
): Promise<MediaAsset[]> {
  const mediaFiles = files.filter((file) => {
    const type = classifyMediaType(file.type, file.name);
    return type === "image" || type === "video";
  });
  const otherFiles = files.filter((file) => !mediaFiles.includes(file));
  const uploaded: MediaAsset[] = [];

  if (preferCloudinary && mediaFiles.length) {
    for (let index = 0; index < mediaFiles.length; index += 1) {
      const file = mediaFiles[index];
      const labelPrefix = mediaFiles.length > 1 ? `(${index + 1}/${mediaFiles.length}) ` : "";
      try {
        const asset = await uploadFileViaCloudinary(file, (percent, label) => {
          onProgress(percent, `${labelPrefix}${label || "Uploading…"}`);
        });
        uploaded.push(asset);
      } catch (error) {
        // If Cloudinary is unavailable, fall back once for this batch of media files.
        if (index === 0 && /not configured|503|Could not prepare/i.test(error instanceof Error ? error.message : "")) {
          return uploadFilesViaServer(files, onProgress);
        }
        throw error;
      }
    }
  } else if (mediaFiles.length) {
    uploaded.push(...(await uploadFilesViaServer(mediaFiles, onProgress)));
  }

  if (otherFiles.length) {
    uploaded.push(...(await uploadFilesViaServer(otherFiles, onProgress)));
  }

  return uploaded;
}

export default function MediaManagerPage({ onSelect, asModal, pickerMode = "any" }: MediaManagerPageProps) {
  const { notify } = useDashboardFeedback();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<MediaFilterType>(() =>
    pickerMode === "image" ? "image" : pickerMode === "video" ? "video" : "all",
  );

  useEffect(() => {
    if (pickerMode === "image") setFilterType("image");
    else if (pickerMode === "video") setFilterType("video");
  }, [pickerMode]);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("Uploading…");
  const [uploadPhase, setUploadPhase] = useState<"idle" | "uploading" | "ready" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const [cloudinaryReady, setCloudinaryReady] = useState(
    () => Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME),
  );
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [urlError, setUrlError] = useState("");
  const [previewFailed, setPreviewFailed] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch("/api/media", { cache: "no-store", credentials: "include" });
      const payload = (await res.json()) as { assets?: MediaAsset[]; error?: string; cloudinary?: boolean };
      if (!res.ok) throw new Error(payload.error || "Could not load media.");
      setAssets(payload.assets || []);
      if (typeof payload.cloudinary === "boolean") setCloudinaryReady(payload.cloudinary);
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
      void loadAssets();
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : "Could not import that URL.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
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
    const oversized = files.find((file) => file.size > mediaMaxBytesFor(file.type || file.name));
    if (oversized) {
      notify(`${oversized.name} is larger than ${mediaMaxLabel(mediaMaxBytesFor(oversized.type || oversized.name))}.`, "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setIsUploading(true);
    setUploadPhase("uploading");
    setUploadError("");
    setUploadProgress(0);
    setUploadLabel(cloudinaryReady ? "Preparing CDN upload…" : "Uploading…");
    try {
      const uploaded = await uploadLibraryFiles(files, cloudinaryReady, (percent, label) => {
        setUploadProgress(percent);
        if (label) setUploadLabel(label);
      });
      setAssets((current) => [...uploaded, ...current.filter((item) => !uploaded.some((file) => file.id === item.id || file.storagePath === item.storagePath))]);
      setSelectedId(uploaded[0]?.id || null);
      setFilterType("all");
      setPage(1);
      setUploadProgress(100);
      setUploadLabel(uploaded.length === 1 ? "Uploaded — review selection below" : `${uploaded.length} files uploaded — review below`);
      setUploadPhase("ready");
      notify(uploaded.length === 1 ? `${fileKindLabel(uploaded[0].type)} uploaded. Review it, then use Use selected if needed.` : `${uploaded.length} files uploaded.`);
      // Merge remote list without dropping the just-uploaded Cloudinary rows (catalog can lag briefly).
      void (async () => {
        try {
          const res = await fetch("/api/media", { cache: "no-store", credentials: "include" });
          const payload = (await res.json()) as { assets?: MediaAsset[]; cloudinary?: boolean };
          if (!res.ok) return;
          if (typeof payload.cloudinary === "boolean") setCloudinaryReady(payload.cloudinary);
          const fresh = payload.assets || [];
          setAssets((current) => {
            const map = new Map<string, MediaAsset>();
            for (const asset of fresh) map.set(asset.id, asset);
            for (const asset of uploaded) map.set(asset.id, asset);
            for (const asset of current) {
              if (map.has(asset.id)) continue;
              const duplicate = [...map.values()].some(
                (row) =>
                  (asset.storagePath && row.storagePath === asset.storagePath) ||
                  (asset.url && row.url === asset.url),
              );
              if (!duplicate) map.set(asset.id, asset);
            }
            return [...map.values()].sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));
          });
        } catch {
          // Keep optimistic library state.
        }
      })();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload that file.";
      setUploadPhase("error");
      setUploadError(message);
      setUploadLabel("Upload failed");
      notify(message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const dismissUploadStatus = () => {
    setUploadPhase("idle");
    setUploadProgress(0);
    setUploadLabel("Uploading…");
    setUploadError("");
  };

  const selectedAsset = assets.find((asset) => asset.id === selectedId);
  const imageCount = assets.filter((asset) => asset.type === "image").length;
  const videoCount = assets.filter((asset) => asset.type === "video").length;
  const documentCount = assets.filter((asset) => isDocumentFilterType(asset.type)).length;
  const canUseSelected = Boolean(
    selectedAsset &&
      onSelect &&
      (pickerMode === "any" ||
        (pickerMode === "image" && selectedAsset.type === "image") ||
        (pickerMode === "video" && selectedAsset.type === "video")),
  );

  return (
    <div
      className={asModal ? "media-manager is-modal" : "media-manager"}
      style={{
        height: "100%",
        minHeight: asModal ? 0 : "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
        overflow: "hidden",
        padding: asModal ? "0 1rem 1rem" : undefined,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          padding: asModal ? "0.85rem 0 0.65rem" : "0 0 0.9rem",
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
            {assets.length} stored assets. Images up to {mediaMaxLabel(MEDIA_MAX_FILE_BYTES)}, video up to{" "}
            {mediaMaxLabel(MEDIA_MAX_VIDEO_BYTES)}.{" "}
            {cloudinaryReady
              ? "Videos and images upload directly to Cloudinary (CDN) with real progress, then an optimized URL is stored for the site."
              : "Add Cloudinary env vars for fast video CDN uploads; otherwise large videos may fail on storage limits."}
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
              {isUploading ? `${uploadLabel} ${Math.round(uploadProgress)}%` : "Upload"}
            </span>
          </button>
          <input ref={fileInputRef} type="file" multiple accept={LIBRARY_ACCEPT} style={{ display: "none" }} onChange={handleFileUpload} disabled={isUploading} />
        </div>
      </div>

      {uploadPhase !== "idle" ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            margin: "0 0 0.75rem",
            padding: "0.75rem 0.9rem",
            borderRadius: "0.65rem",
            border: `1px solid ${uploadPhase === "error" ? "#fecaca" : uploadPhase === "ready" ? "#bbf7d0" : "#bfdbfe"}`,
            background: uploadPhase === "error" ? "#fef2f2" : uploadPhase === "ready" ? "#f0fdf4" : "#eff6ff",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 800, color: "#0f172a" }}>
                {uploadPhase === "uploading"
                  ? "Upload in progress"
                  : uploadPhase === "ready"
                    ? "Ready to review"
                    : "Upload failed"}
              </p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#475569", lineHeight: 1.4 }}>
                {uploadPhase === "error"
                  ? uploadError
                  : uploadPhase === "ready"
                    ? "The file stays selected in Asset Details. Use it when you are ready — nothing is applied until you confirm."
                    : `${uploadLabel}${cloudinaryReady ? " · Direct to Cloudinary CDN" : ""}`}
              </p>
              {uploadPhase === "uploading" || uploadPhase === "ready" ? (
                <div style={{ marginTop: "0.55rem", height: "0.35rem", borderRadius: "999px", background: "rgba(15,23,42,0.08)", overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.max(uploadPhase === "ready" ? 100 : uploadProgress, 4)}%`,
                      height: "100%",
                      background: uploadPhase === "ready" ? "#16a34a" : "#0e52a8",
                      transition: "width 0.2s ease",
                    }}
                  />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={dismissUploadStatus}
              disabled={uploadPhase === "uploading"}
              style={{
                border: "none",
                background: "transparent",
                color: "#64748b",
                cursor: uploadPhase === "uploading" ? "not-allowed" : "pointer",
                padding: "0.15rem",
                flexShrink: 0,
              }}
              aria-label="Dismiss upload status"
            >
              <RiCloseLine size={16} />
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ padding: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>
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
          className="media-import-form"
          style={{
            margin: "0 0 0.9rem",
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

      <div className="media-browser" style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0, gap: selectedAsset ? "0.9rem" : 0 }}>
        <div className="media-grid-scroll" style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", minWidth: 0, minHeight: 0, paddingRight: "0.15rem", WebkitOverflowScrolling: "touch" }}>
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
            className="media-detail-panel"
            style={{
              width: "17rem",
              maxWidth: "100%",
              minWidth: 0,
              minHeight: 0,
              border: "1px solid #dbe4f0",
              background: "rgba(255,255,255,0.86)",
              display: "flex",
              flexDirection: "column",
              flexShrink: 0,
              overflowX: "hidden",
              overflowY: "auto",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              borderRadius: "0.5rem",
            }}
          >
            <div style={{ padding: "1rem", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, position: "sticky", top: 0, background: "rgba(255,255,255,0.96)", zIndex: 1 }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>Asset Details</span>
              <button type="button" onClick={() => setSelectedId(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#94a3b8" }}>
                <RiCloseLine size={16} />
              </button>
            </div>
            <div style={{ padding: "1rem", minWidth: 0 }}>
              <div style={{ position: "relative", width: "100%", height: "10rem", borderRadius: "0.375rem", overflow: "hidden", background: "#f1f5f9", marginBottom: "1rem" }}>
                {selectedAsset.type === "video" ? (
                  <video src={selectedAsset.url} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : selectedAsset.type === "image" ? (
                  <img src={selectedAsset.url} alt={mediaImgAlt(selectedAsset)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : selectedAsset.type === "pdf" ? (
                  <iframe title={clampMediaLabel(selectedAsset.name, 80)} src={selectedAsset.url} style={{ width: "100%", height: "100%", border: "none" }} />
                ) : (
                  <FileThumb asset={selectedAsset} height="10rem" />
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8125rem", minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Filename</p>
                  <p title={selectedAsset.name} style={{ fontWeight: 700, color: "#0f172a", wordBreak: "break-all", overflowWrap: "anywhere" }}>{clampMediaLabel(selectedAsset.name, 96)}</p>
                </div>
                {selectedAsset.alt && (
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Alt Text</p>
                    <p title={selectedAsset.alt} style={{ color: "#334155", wordBreak: "break-all", overflowWrap: "anywhere", maxHeight: "4.5rem", overflow: "auto" }}>{clampMediaLabel(selectedAsset.alt, 160)}</p>
                  </div>
                )}
                <div>
                    <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>Type</p>
                    <p style={{ color: "#334155" }}>{fileKindLabel(selectedAsset.type)} · {mediaSourceLabel(selectedAsset)}{selectedAsset.size ? ` · ${selectedAsset.size}` : ""}</p>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase", color: "#94a3b8", marginBottom: "0.25rem" }}>URL</p>
                  <p title={selectedAsset.url} style={{ color: "#0e52a8", wordBreak: "break-all", overflowWrap: "anywhere", fontSize: "0.75rem", maxHeight: "4.5rem", overflow: "auto" }}>{clampMediaLabel(selectedAsset.url, 120)}</p>
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
                    <RiCheckLine size={16} />{" "}
                    {selectedAsset.type === "image"
                      ? "Use This Image"
                      : selectedAsset.type === "video"
                        ? "Use This Video"
                        : "Use This File"}
                  </button>
                )}
                {onSelect && pickerMode === "image" && selectedAsset.type !== "image" && (
                  <p style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}>This picker needs an image. Copy the URL to use this file elsewhere.</p>
                )}
                {onSelect && pickerMode === "video" && selectedAsset.type !== "video" && (
                  <p style={{ fontSize: "0.7rem", color: "#64748b", textAlign: "center" }}>This picker needs a video. Copy the URL to use this file elsewhere.</p>
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
        <div
          className="media-pagination"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            flexWrap: "wrap",
            paddingTop: "0.85rem",
            paddingBottom: asModal ? "0.15rem" : "0.5rem",
            flexShrink: 0,
          }}
        >
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
              <button
                type="button"
                onClick={() => {
                  if (isDeleting) return;
                  setDeleteConfirmId(null);
                }}
                disabled={isDeleting}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#64748b",
                  cursor: isDeleting ? "not-allowed" : "pointer",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  opacity: isDeleting ? 0.55 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                aria-busy={isDeleting}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  minWidth: "6.5rem",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  background: "#ef4444",
                  color: "#ffffff",
                  cursor: isDeleting ? "wait" : "pointer",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  opacity: isDeleting ? 0.9 : 1,
                }}
              >
                {isDeleting ? (
                  <>
                    <RiLoader4Line size={16} className="animate-spin" aria-hidden="true" />
                    Deleting…
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
