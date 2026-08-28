import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MEDIA_BUCKET,
  MEDIA_MAX_FILE_BYTES,
  classifyMediaType,
  formatBytes,
  isAllowedLibraryFile,
  mimeFromName,
  type MediaAsset,
  type MediaAssetType,
  type MediaSource,
} from "@/lib/media";
import { createServerSupabase, hasServiceRoleKey } from "@/lib/supabase-server";

export interface MediaAssetRow {
  id: string;
  title: string;
  url: string;
  asset_type: string | null;
  size_bytes: number | null;
  created_at: string;
  alt?: string | null;
  source?: string | null;
  original_url?: string | null;
  storage_path?: string | null;
  mime_type?: string | null;
}

const CATALOG_PATH = "library/index.json";
const BLOCKED_HOSTS = /^(localhost|127\.|10\.|0\.|192\.168\.|169\.254\.|::1|\[::1\])/i;
const BLOCKED_HOST_SUFFIXES = [".local", ".internal", ".localhost"];

const KNOWN_TYPES: MediaAssetType[] = ["image", "video", "pdf", "spreadsheet", "document", "archive"];

export function mapMediaRow(row: MediaAssetRow): MediaAsset {
  const type = (KNOWN_TYPES.includes(row.asset_type as MediaAssetType)
    ? row.asset_type
    : classifyMediaType(row.mime_type, row.title || row.url)) as MediaAssetType;
  return {
    id: row.id,
    name: row.title,
    url: row.url,
    type,
    size: formatBytes(row.size_bytes),
    sizeBytes: row.size_bytes || undefined,
    uploadedAt: row.created_at.slice(0, 10),
    alt: row.alt || undefined,
    source: row.source === "url" || row.source === "upload" ? row.source : undefined,
    storagePath: row.storage_path || undefined,
    originalUrl: row.original_url || undefined,
    mimeType: row.mime_type || undefined,
  };
}

export function sanitizeFileName(name: string) {
  const base = name.split(/[/\\]/).pop() || "asset";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 80);
  return cleaned || "asset";
}

export function isBlockedMediaHost(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.test(host)) return true;
  if (BLOCKED_HOST_SUFFIXES.some((suffix) => host.endsWith(suffix))) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  return false;
}

export function assertSafeRemoteUrl(raw: string) {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("Enter a valid http(s) URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs can be imported.");
  }
  if (isBlockedMediaHost(parsed.hostname)) {
    throw new Error("That URL cannot be imported.");
  }
  return parsed;
}

export function mediaAdminClient() {
  if (!hasServiceRoleKey()) {
    throw new Error("Media uploads need SUPABASE_SERVICE_ROLE_KEY in the server environment.");
  }
  return createServerSupabase(true);
}

async function withRetry<T>(work: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await work();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!/40P01|deadlock|could not serialize/i.test(message) || attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 150 * attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Storage retry failed.");
}

function storageError(error: { message?: string } | null, fallback: string) {
  return new Error(error?.message || fallback);
}

export async function ensureMediaBucket(supabase: SupabaseClient) {
  const listed = await supabase.storage.listBuckets();
  if (listed.data?.some((bucket) => bucket.name === MEDIA_BUCKET || bucket.id === MEDIA_BUCKET)) return;
  const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: MEDIA_MAX_FILE_BYTES,
  });
  if (error && !/already exists|duplicate/i.test(error.message)) {
    throw storageError(error, "Could not create the media bucket.");
  }
}

async function readCatalog(supabase: SupabaseClient): Promise<MediaAsset[]> {
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).download(CATALOG_PATH);
  if (error || !data) return [];
  try {
    const parsed = JSON.parse(await data.text()) as { assets?: MediaAsset[] };
    return Array.isArray(parsed.assets) ? parsed.assets : [];
  } catch {
    return [];
  }
}

async function writeCatalog(supabase: SupabaseClient, assets: MediaAsset[]) {
  const body = JSON.stringify({ assets }, null, 2);
  await withRetry(async () => {
    const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(CATALOG_PATH, Buffer.from(body), {
      contentType: "application/json",
      upsert: true,
    });
    if (error) throw storageError(error, "Could not update the media catalog.");
  });
}

async function syncTableInsert(supabase: SupabaseClient, asset: MediaAsset) {
  try {
    const fullRow = {
      id: asset.id,
      title: asset.name,
      url: asset.url,
      asset_type: asset.type,
      size_bytes: asset.sizeBytes || 0,
      alt: asset.alt || "",
      source: asset.source || "upload",
      original_url: asset.originalUrl || null,
      storage_path: asset.storagePath || null,
      mime_type: asset.mimeType || null,
    };
    const first = await Promise.race([
      supabase.from("media_assets").insert(fullRow),
      new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ error: { message: "timeout" } }), 2500),
      ),
    ]);
    if (!("error" in first) || !first.error || first.error.message === "timeout") return;
    if (!/column|schema cache/i.test(first.error.message)) return;
    await Promise.race([
      supabase.from("media_assets").insert({
        title: asset.name,
        url: asset.url,
        asset_type: asset.type,
        size_bytes: asset.sizeBytes || 0,
      }),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  } catch {
    // Optional table sync; storage catalog is enough for the library.
  }
}

export async function uploadMediaBuffer(
  supabase: SupabaseClient,
  file: { name: string; type: string; buffer: Buffer; size: number },
  options: { alt?: string; source: MediaSource; originalUrl?: string },
): Promise<MediaAsset> {
  if (file.size <= 0) throw new Error("That file is empty.");
  if (file.size > MEDIA_MAX_FILE_BYTES) {
    throw new Error("Files must be 10 MB or smaller.");
  }

  const mime = file.type || mimeFromName(file.name) || "application/octet-stream";
  if (!isAllowedLibraryFile(mime, file.name)) {
    throw new Error("That file type is not allowed. Upload images, video, PDF, Excel, Word, or similar blog files.");
  }
  const type = classifyMediaType(mime, file.name);

  await withRetry(() => ensureMediaBucket(supabase));

  const id = randomUUID();
  const title = sanitizeFileName(file.name);
  const storagePath = `library/${id}-${title}`;
  await withRetry(async () => {
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file.buffer, {
      contentType: mime,
      upsert: false,
    });
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) {
      throw storageError(uploadError, "Could not store that file.");
    }
  });

  const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  const createdAt = new Date().toISOString();
  const asset: MediaAsset = {
    id,
    name: title,
    url: publicData.publicUrl,
    type,
    size: formatBytes(file.size),
    sizeBytes: file.size,
    uploadedAt: createdAt.slice(0, 10),
    alt: options.alt || "",
    source: options.source,
    storagePath,
    originalUrl: options.originalUrl,
    mimeType: mime,
  };

  try {
    const catalog = await readCatalog(supabase);
    await writeCatalog(supabase, [asset, ...catalog.filter((item) => item.id !== asset.id)]);
  } catch (error) {
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    throw error;
  }

  void syncTableInsert(supabase, asset);
  return asset;
}

export async function listMediaAssets(supabase: SupabaseClient): Promise<MediaAsset[]> {
  await withRetry(() => ensureMediaBucket(supabase));

  const catalog = await readCatalog(supabase);
  if (catalog.length) return catalog;

  const listed = await supabase.storage.from(MEDIA_BUCKET).list("library", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (listed.error || !listed.data) return [];

  return listed.data
    .filter((item) => item.name && item.name !== "index.json" && !item.name.endsWith("/"))
    .map((item) => {
      const storagePath = `library/${item.name}`;
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
      const mime = item.metadata?.mimetype as string | undefined;
      return {
        id: item.id || item.name,
        name: item.name.replace(/^[0-9a-f-]{36}-/i, ""),
        url: data.publicUrl,
        type: classifyMediaType(mime, item.name),
        size: formatBytes(typeof item.metadata?.size === "number" ? item.metadata.size : undefined),
        sizeBytes: typeof item.metadata?.size === "number" ? item.metadata.size : undefined,
        uploadedAt: (item.created_at || "").slice(0, 10),
        source: "upload" as const,
        storagePath,
        mimeType: mime,
      };
    });
}

async function syncTableDelete(supabase: SupabaseClient, id: string) {
  try {
    await Promise.race([
      supabase.from("media_assets").delete().eq("id", id),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500)),
    ]);
  } catch {
    // Table metadata is optional; the storage catalog is the source of truth.
  }
}

export async function deleteMediaAsset(supabase: SupabaseClient, id: string) {
  const catalog = await readCatalog(supabase);
  const asset = catalog.find((item) => item.id === id);
  if (asset?.storagePath) {
    await supabase.storage.from(MEDIA_BUCKET).remove([asset.storagePath]);
  }
  await writeCatalog(supabase, catalog.filter((item) => item.id !== id));
  void syncTableDelete(supabase, id);
}
