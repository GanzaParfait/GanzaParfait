import { v2 as cloudinary } from "cloudinary";
import { cloudinary as cloudinaryEnv } from "@/lib/env";

let configured = false;

function ensureConfigured() {
  if (configured) return true;
  const cloudName = cloudinaryEnv.cloudName();
  const apiKey = cloudinaryEnv.apiKey();
  const apiSecret = cloudinaryEnv.apiSecret();
  const url = cloudinaryEnv.url();

  if (url) {
    // CLOUDINARY_URL in env is picked up by the SDK when config() is called.
    cloudinary.config();
    configured = Boolean(cloudinary.config().cloud_name);
    return configured;
  }

  if (!cloudName || !apiKey || !apiSecret) return false;

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
  return true;
}

export function isCloudinaryConfigured() {
  return ensureConfigured();
}

export type CloudinaryUploadResult = {
  url: string;
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  width?: number;
  height?: number;
  format?: string;
};

/**
 * Upload to Cloudinary with quality-preserving defaults.
 * Delivery URLs can still use f_auto,q_auto:good for fast SEO-friendly rendering.
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  options: { filename: string; mime?: string; folder?: string },
): Promise<CloudinaryUploadResult> {
  if (!ensureConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const folder = options.folder || "princeparfait/library";
  const resourceType = options.mime?.startsWith("video/")
    ? "video"
    : options.mime?.startsWith("image/")
      ? "image"
      : "auto";

  const result = await new Promise<{
    url: string;
    secure_url: string;
    public_id: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
    format?: string;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: undefined,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        quality: "auto:good",
        eager_async: true,
        eager:
          resourceType === "image"
            ? [{ fetch_format: "auto", quality: "auto:good" }]
            : undefined,
        context: `alt=${options.filename}|source=dashboard`,
        tags: ["ppg", "library", "seo"],
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }
        resolve(uploadResult as {
          url: string;
          secure_url: string;
          public_id: string;
          resource_type: string;
          bytes: number;
          width?: number;
          height?: number;
          format?: string;
        });
      },
    );
    stream.end(buffer);
  });

  return {
    url: result.url,
    secureUrl: result.secure_url,
    publicId: result.public_id,
    resourceType: result.resource_type,
    bytes: result.bytes,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}

/** Insert SEO-friendly delivery transforms into a Cloudinary URL when possible. */
export function cloudinaryOptimizedUrl(
  url: string,
  opts?: { width?: number; height?: number; crop?: "fill" | "limit" | "fit" },
): string {
  if (!url || !/res\.cloudinary\.com\//.test(url)) return url;
  const crop = opts?.crop || "limit";
  const parts: string[] = ["f_auto", "q_auto:good"];
  if (opts?.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts?.height) parts.push(`h_${Math.round(opts.height)}`);
  if (opts?.width || opts?.height) parts.push(`c_${crop}`);
  const transform = parts.join(",");
  return url.replace("/upload/", `/upload/${transform}/`);
}
