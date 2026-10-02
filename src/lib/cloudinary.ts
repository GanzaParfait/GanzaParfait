import { v2 as cloudinary } from "cloudinary";
import { cloudinary as cloudinaryEnv } from "@/lib/env";

export {
  cloudinaryOptimizedUrl,
  cloudinaryVideoDeliveryUrl,
  cloudinaryVideoPosterUrl,
} from "@/lib/cloudinary-url";

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
  options: {
    filename: string;
    mime?: string;
    folder?: string;
    transformation?: Record<string, string | number | boolean>[];
  },
): Promise<CloudinaryUploadResult> {
  if (!ensureConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }

  const folder = options.folder || "princeparfait/library";
  const looksVideo =
    Boolean(options.mime?.startsWith("video/")) || /\.(mp4|webm|mov|m4v|ogg)$/i.test(options.filename);
  const looksImage =
    Boolean(options.mime?.startsWith("image/")) || /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i.test(options.filename);
  const resourceType = looksVideo ? "video" : looksImage ? "image" : "auto";
  const isVideo = resourceType === "video";

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
        // Image-only upload knobs break some video uploads on Cloudinary.
        ...(isVideo
          ? {
              eager_async: true,
              eager: [{ format: "mp4", quality: "auto:good" }],
            }
          : {
              quality: "auto:eco",
              eager_async: !options.transformation,
              eager:
                !options.transformation
                  ? [{ fetch_format: "auto", quality: "auto:eco" }]
                  : undefined,
            }),
        transformation: options.transformation,
        context: `alt=${options.filename}|source=dashboard`,
        tags: ["ppg", "library", "seo", isVideo ? "video" : "image"],
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          const message =
            error && typeof error === "object" && "message" in error
              ? String((error as { message?: string }).message || "Cloudinary upload failed.")
              : "Cloudinary upload failed.";
          reject(new Error(message));
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

export const CLOUDINARY_LIBRARY_FOLDER = "princeparfait/library";

/** Signed params for browser → Cloudinary direct upload (real progress, no Next body limit). */
export function createCloudinaryUploadSignature(options?: {
  folder?: string;
  resourceType?: "image" | "video" | "auto";
}) {
  if (!ensureConfigured()) {
    throw new Error("Cloudinary is not configured.");
  }
  const folder = options?.folder || CLOUDINARY_LIBRARY_FOLDER;
  const timestamp = Math.round(Date.now() / 1000);
  // Keep the signed field set minimal — extra form fields that aren't signed will be rejected.
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder,
  };
  const signature = cloudinary.utils.api_sign_request(paramsToSign, cloudinary.config().api_secret as string);
  const cloudName = cloudinary.config().cloud_name;
  const apiKey = cloudinary.config().api_key;
  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary cloud name or API key is missing.");
  }
  return {
    cloudName: String(cloudName),
    apiKey: String(apiKey),
    timestamp,
    signature,
    folder,
    resourceType: options?.resourceType || "auto",
    uploadPreset: cloudinaryEnv.uploadPreset() || undefined,
  };
}
