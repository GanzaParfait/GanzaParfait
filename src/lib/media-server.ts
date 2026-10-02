import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  MEDIA_BUCKET,
  MEDIA_MAX_VIDEO_BYTES,
  classifyMediaType,
  formatBytes,
  isAllowedLibraryFile,
  mediaMaxBytesFor,
  mediaMaxLabel,
  mimeFromName,
  type MediaAsset,
  type MediaAssetType,
  type MediaSource,
} from "@/lib/media";
import { isCloudinaryConfigured, uploadToCloudinary, cloudinaryOptimizedUrl, CLOUDINARY_LIBRARY_FOLDER } from "@/lib/cloudinary";
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
  const existing = listed.data?.find((bucket) => bucket.name === MEDIA_BUCKET || bucket.id === MEDIA_BUCKET);
  if (existing) {
    // Keep video-capable size limit on existing buckets (create-only path used to cap at 50MB).
    await supabase.storage.updateBucket(MEDIA_BUCKET, {
      public: true,
      fileSizeLimit: MEDIA_MAX_VIDEO_BYTES,
    });
    return;
  }
  const { error } = await supabase.storage.createBucket(MEDIA_BUCKET, {
    public: true,
    fileSizeLimit: MEDIA_MAX_VIDEO_BYTES,
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
  const mime = file.type || mimeFromName(file.name) || "application/octet-stream";
  const maxBytes = mediaMaxBytesFor(mime || file.name);
  if (file.size > maxBytes) {
    throw new Error(`Files must be ${mediaMaxLabel(maxBytes)} or smaller.`);
  }

  if (!isAllowedLibraryFile(mime, file.name)) {
    throw new Error("That file type is not allowed. Upload images, video, PDF, Excel, Word, or similar blog files.");
  }
  const type = classifyMediaType(mime, file.name);
  const id = randomUUID();
  const title = sanitizeFileName(file.name);
  const createdAt = new Date().toISOString();

  // Prefer Cloudinary for images/videos when configured (CDN + auto format/quality).
  // Never fall back to Supabase for media files — that hits storage size limits and Vercel body caps.
  if (isCloudinaryConfigured() && (type === "image" || type === "video")) {
    const uploaded = await uploadToCloudinary(file.buffer, {
      filename: title,
      mime,
      folder: "princeparfait/library",
    });
    const delivery =
      type === "image"
        ? cloudinaryOptimizedUrl(uploaded.secureUrl || uploaded.url, { width: 1920, crop: "limit" })
        : cloudinaryOptimizedUrl(uploaded.secureUrl || uploaded.url);

    const asset: MediaAsset = {
      id,
      name: title,
      url: delivery,
      type,
      size: formatBytes(uploaded.bytes || file.size),
      sizeBytes: uploaded.bytes || file.size,
      uploadedAt: createdAt.slice(0, 10),
      alt: options.alt || title.replace(/[-_]/g, " "),
      source: options.source,
      storagePath: `cloudinary:${uploaded.publicId}`,
      originalUrl: options.originalUrl || uploaded.secureUrl,
      mimeType: mime,
    };

    try {
      const catalog = await readCatalog(supabase);
      await writeCatalog(supabase, [asset, ...catalog.filter((item) => item.id !== asset.id)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "catalog write failed";
      throw new Error(`Uploaded to Cloudinary, but library catalog sync failed (${message}).`);
    }
    void syncTableInsert(supabase, asset);
    return asset;
  }

  if (type === "image" || type === "video") {
    throw new Error(
      "Cloudinary is required for image and video uploads. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  await withRetry(() => ensureMediaBucket(supabase));

  const storagePath = `library/${id}-${title}`;
  await withRetry(async () => {
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(storagePath, file.buffer, {
      contentType: mime,
      upsert: false,
    });
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) {
      if (/maximum allowed size|entity too large|payload too large/i.test(uploadError.message)) {
        throw new Error(
          `That file is larger than the storage bucket allows. Use Cloudinary (set CLOUDINARY_* env vars) for videos up to ${mediaMaxLabel(MEDIA_MAX_VIDEO_BYTES)}, or compress the file first.`,
        );
      }
      throw storageError(uploadError, "Could not store that file.");
    }
  });

  const { data: publicData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
  const asset: MediaAsset = {
    id,
    name: title,
    url: publicData.publicUrl,
    type,
    size: formatBytes(file.size),
    sizeBytes: file.size,
    uploadedAt: createdAt.slice(0, 10),
    alt: options.alt || title.replace(/[-_]/g, " "),
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

/** Persist a browser→Cloudinary direct upload into the media catalog. */
export async function registerCloudinaryAsset(
  supabase: SupabaseClient,
  input: {
    publicId: string;
    secureUrl: string;
    bytes?: number;
    resourceType?: string;
    format?: string;
    width?: number;
    height?: number;
    originalFilename?: string;
    alt?: string;
    mimeType?: string;
  },
): Promise<MediaAsset> {
  const publicId = String(input.publicId || "").trim();
  const secureUrl = String(input.secureUrl || "").trim();
  if (!publicId || !secureUrl) {
    throw new Error("Cloudinary upload result is incomplete.");
  }
  if (!publicId.startsWith(`${CLOUDINARY_LIBRARY_FOLDER}/`) && !publicId.startsWith("princeparfait/")) {
    throw new Error("That Cloudinary asset is outside the media library folder.");
  }
  if (!/res\.cloudinary\.com\//i.test(secureUrl)) {
    throw new Error("Delivery URL must be a Cloudinary URL.");
  }

  const resourceType = (input.resourceType || "").toLowerCase();
  const looksVideo =
    resourceType === "video" ||
    /\.(mp4|webm|mov|m4v|ogg)$/i.test(input.originalFilename || publicId) ||
    /\/video\/upload\//i.test(secureUrl);
  const type: MediaAssetType = looksVideo ? "video" : "image";
  const title = sanitizeFileName(input.originalFilename || publicId.split("/").pop() || "asset");
  const mime =
    input.mimeType ||
    mimeFromName(title) ||
    (looksVideo ? "video/mp4" : input.format ? `image/${input.format}` : "application/octet-stream");
  const delivery =
    type === "image"
      ? cloudinaryOptimizedUrl(secureUrl, { width: 1920, crop: "limit" })
      : cloudinaryOptimizedUrl(secureUrl);
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const bytes = typeof input.bytes === "number" && input.bytes > 0 ? input.bytes : 0;

  const asset: MediaAsset = {
    id,
    name: title,
    url: delivery,
    type,
    size: formatBytes(bytes) || undefined,
    sizeBytes: bytes || undefined,
    uploadedAt: createdAt.slice(0, 10),
    alt: input.alt || title.replace(/[-_]/g, " "),
    source: "upload",
    storagePath: `cloudinary:${publicId}`,
    originalUrl: secureUrl,
    mimeType: mime,
  };

  try {
    await withRetry(() => ensureMediaBucket(supabase));
    const catalog = await readCatalog(supabase);
    await writeCatalog(supabase, [asset, ...catalog.filter((item) => item.id !== asset.id)]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save media catalog.";
    throw new Error(
      `Uploaded to Cloudinary, but the library catalog could not be updated (${message}). Retry once — the file is already on the CDN.`,
    );
  }
  void syncTableInsert(supabase, asset);
  return asset;
}

export async function listMediaAssets(supabase: SupabaseClient): Promise<MediaAsset[]> {
  await withRetry(() => ensureMediaBucket(supabase));

  const catalog = await readCatalog(supabase);
  const listed = await supabase.storage.from(MEDIA_BUCKET).list("library", {
    limit: 1000,
    sortBy: { column: "created_at", order: "desc" },
  });

  const fromStorage: MediaAsset[] = !(listed.error || !listed.data)
    ? listed.data
        .filter((item) => item.name && item.name !== "index.json" && !item.name.endsWith("/"))
        .map((item) => {
          const storagePath = `library/${item.name}`;
          const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storagePath);
          const mime = item.metadata?.mimetype as string | undefined;
          const idMatch = item.name.match(/^([0-9a-f-]{36})-/i);
          return {
            id: idMatch?.[1] || item.id || item.name,
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
        })
    : [];

  const byKey = new Map<string, MediaAsset>();
  for (const asset of fromStorage) {
    byKey.set(asset.storagePath || asset.id, asset);
    byKey.set(asset.id, asset);
  }
  for (const asset of catalog) {
    const key = asset.storagePath || asset.id;
    const existing = byKey.get(key) || byKey.get(asset.id);
    byKey.set(key, existing ? { ...existing, ...asset, url: asset.url || existing.url } : asset);
    byKey.set(asset.id, byKey.get(key)!);
  }

  const unique = new Map<string, MediaAsset>();
  for (const asset of byKey.values()) {
    unique.set(asset.id, asset);
  }

  const merged = [...unique.values()]
    .map((asset) => {
      // Heal legacy catalog rows that stored videos as "image" or lost mime type.
      const healedType = classifyMediaType(asset.mimeType, `${asset.name} ${asset.url || ""} ${asset.originalUrl || ""}`);
      return healedType !== asset.type ? { ...asset, type: healedType } : asset;
    })
    .sort((a, b) => (b.uploadedAt || "").localeCompare(a.uploadedAt || ""));

  // Heal incomplete catalogs so reopen always sees storage + catalog together.
  // Prefer keeping Cloudinary-only catalog rows even when Supabase object storage is shorter.
  if (fromStorage.length && merged.length !== catalog.length) {
    try {
      await writeCatalog(supabase, merged);
    } catch {
      // Listing still returns the merge even if heal write fails.
    }
  }

  return merged;
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
  if (asset?.storagePath && !asset.storagePath.startsWith("cloudinary:")) {
    await supabase.storage.from(MEDIA_BUCKET).remove([asset.storagePath]);
  }
  await writeCatalog(supabase, catalog.filter((item) => item.id !== id));
  void syncTableDelete(supabase, id);
}
