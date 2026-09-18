export type MediaAssetType = "image" | "video" | "pdf" | "spreadsheet" | "document" | "archive";
export type MediaSource = "upload" | "url";
export type MediaFilterType = "all" | "image" | "video" | "document";

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: MediaAssetType;
  size?: string;
  sizeBytes?: number;
  uploadedAt: string;
  alt?: string;
  source?: MediaSource;
  storagePath?: string;
  originalUrl?: string;
  mimeType?: string;
}

export const MEDIA_PAGE_SIZE = 12;
/** Soft cap for documents on Supabase; videos/images via Cloudinary can be larger. */
export const MEDIA_MAX_FILE_BYTES = 50 * 1024 * 1024;
export const MEDIA_MAX_VIDEO_BYTES = 100 * 1024 * 1024;
export const MEDIA_BUCKET = "media";
export const LOCAL_MEDIA_STORAGE_KEY = "ppg_media_assets";

export function mediaMaxBytesFor(mimeOrName: string) {
  const value = mimeOrName.toLowerCase();
  if (value.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogg)$/i.test(value)) {
    return MEDIA_MAX_VIDEO_BYTES;
  }
  return MEDIA_MAX_FILE_BYTES;
}

export function mediaMaxLabel(bytes = MEDIA_MAX_FILE_BYTES) {
  const mb = Math.round(bytes / (1024 * 1024));
  return `${mb} MB`;
}

const IMAGE_EXT = ["jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "bmp", "ico"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v", "ogg"];
const PDF_EXT = ["pdf"];
const SPREADSHEET_EXT = ["xls", "xlsx", "csv", "ods", "tsv"];
const DOCUMENT_EXT = ["doc", "docx", "odt", "rtf", "txt", "md", "ppt", "pptx", "odp"];
const ARCHIVE_EXT = ["zip"];

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  ico: "image/x-icon",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  m4v: "video/x-m4v",
  ogg: "video/ogg",
  pdf: "application/pdf",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
  tsv: "text/tab-separated-values",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt: "application/vnd.oasis.opendocument.text",
  rtf: "application/rtf",
  txt: "text/plain",
  md: "text/markdown",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  odp: "application/vnd.oasis.opendocument.presentation",
  zip: "application/zip",
};

const BLOCKED_EXT = [
  "exe", "dll", "bat", "cmd", "com", "scr", "msi", "js", "mjs", "cjs", "html", "htm", "php", "phtml",
  "sh", "bash", "zsh", "ps1", "jar", "apk", "dmg", "iso", "wasm", "svgz",
];

export const LIBRARY_ACCEPT = [
  "image/*",
  "video/*",
  "application/pdf",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  ".rtf",
  ".txt",
  ".md",
  ".zip",
].join(",");

export function formatBytes(bytes?: number | null): string | undefined {
  if (!bytes || bytes <= 0) return undefined;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mediaSourceLabel(asset: MediaAsset) {
  if (asset.source === "url") return "Imported URL";
  if (asset.source === "upload") return "Uploaded";
  if (asset.url.startsWith("http://") || asset.url.startsWith("https://") || asset.url.startsWith("/")) return "URL";
  return "Linked";
}

export function fileExtension(nameOrUrl?: string | null) {
  if (!nameOrUrl) return "";
  const cleaned = nameOrUrl.split("?")[0].split("#")[0];
  const base = cleaned.split("/").pop() || cleaned;
  const match = base.match(/\.([a-z0-9]{1,8})$/i);
  return match ? match[1].toLowerCase() : "";
}

export function mimeFromName(nameOrUrl?: string | null) {
  const ext = fileExtension(nameOrUrl);
  return ext ? MIME_BY_EXT[ext] : undefined;
}

function inList(ext: string, list: string[]) {
  return list.includes(ext);
}

export function classifyMediaType(mime?: string | null, nameOrUrl?: string): MediaAssetType {
  const ext = fileExtension(nameOrUrl);
  const type = (mime || "").toLowerCase();

  if (type.startsWith("image/") || inList(ext, IMAGE_EXT)) return "image";
  if (type.startsWith("video/") || inList(ext, VIDEO_EXT)) return "video";
  if (type === "application/pdf" || inList(ext, PDF_EXT)) return "pdf";
  if (
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type === "text/csv" ||
    type === "text/tab-separated-values" ||
    inList(ext, SPREADSHEET_EXT)
  ) {
    return "spreadsheet";
  }
  if (type.includes("zip") || inList(ext, ARCHIVE_EXT)) return "archive";
  if (
    type.includes("word") ||
    type.includes("msword") ||
    type.includes("presentation") ||
    type.includes("powerpoint") ||
    type.includes("opendocument") ||
    type.startsWith("text/") ||
    inList(ext, DOCUMENT_EXT)
  ) {
    return "document";
  }
  return "document";
}

export function isAllowedLibraryFile(mime?: string | null, nameOrUrl?: string) {
  const ext = fileExtension(nameOrUrl);
  if (ext && BLOCKED_EXT.includes(ext)) return false;
  const type = (mime || "").toLowerCase();
  if (type.includes("javascript") || type.includes("html") || type.includes("executable")) return false;
  if (ext && MIME_BY_EXT[ext]) return true;
  if (type.startsWith("image/") || type.startsWith("video/")) return true;
  if (
    type === "application/pdf" ||
    type.includes("spreadsheet") ||
    type.includes("excel") ||
    type.includes("word") ||
    type.includes("msword") ||
    type.includes("presentation") ||
    type.includes("powerpoint") ||
    type.includes("opendocument") ||
    type.includes("zip") ||
    type === "text/csv" ||
    type === "text/plain" ||
    type === "text/markdown" ||
    type === "application/rtf"
  ) {
    return true;
  }
  return false;
}

export function isDocumentFilterType(type: MediaAssetType) {
  return type === "pdf" || type === "spreadsheet" || type === "document" || type === "archive";
}

export function fileKindLabel(type: MediaAssetType) {
  if (type === "image") return "Image";
  if (type === "video") return "Video";
  if (type === "pdf") return "PDF";
  if (type === "spreadsheet") return "Spreadsheet";
  if (type === "archive") return "Archive";
  return "Document";
}

export function looksLikeMediaUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
