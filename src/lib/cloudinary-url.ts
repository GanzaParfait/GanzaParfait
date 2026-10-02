/** Browser-safe Cloudinary delivery URL helpers (no Node SDK). */

function injectCloudinaryTransform(url: string, transform: string) {
  if (!url || !/\/upload\//.test(url)) return url;
  // Prefer versioned paths: /upload/[optional transforms/]v123/...
  const versioned = url.match(
    /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video|raw)\/upload\/)(?:[^/]+\/)*(v\d+\/.+)$/i,
  );
  if (versioned) {
    return `${versioned[1]}${transform}/${versioned[2]}`;
  }
  if (url.includes(`/upload/${transform}/`)) return url;
  return url.replace("/upload/", `/upload/${transform}/`);
}

function ensureStillExtension(url: string) {
  if (/\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(url)) return url;
  // Cloudinary public ids often omit an extension — append .jpg for <img> reliability.
  const hashIndex = url.indexOf("#");
  const queryIndex = url.indexOf("?");
  let end = url.length;
  if (queryIndex >= 0) end = Math.min(end, queryIndex);
  if (hashIndex >= 0) end = Math.min(end, hashIndex);
  const base = url.slice(0, end);
  const suffix = url.slice(end);
  if (/\.(jpe?g|png|gif|webp|avif)$/i.test(base)) return url;
  return `${base}.jpg${suffix}`;
}

function looksLikeCloudinaryStill(url: string) {
  const value = url.toLowerCase();
  return (
    /\.(jpe?g|png|gif|webp|avif)(\?|#|$)/i.test(value) ||
    /(?:^|[/,])(?:f_jpe?g|f_png|f_webp|f_avif|f_auto)\b/i.test(value)
  );
}

/** Insert SEO-friendly delivery transforms into a Cloudinary URL when possible. */
export function cloudinaryOptimizedUrl(
  url: string,
  opts?: { width?: number; height?: number; crop?: "fill" | "limit" | "fit" },
): string {
  if (!url || !/res\.cloudinary\.com\//.test(url)) return url;
  if (/\/video\/upload\//.test(url) && !looksLikeCloudinaryStill(url)) {
    return cloudinaryVideoDeliveryUrl(url, { width: opts?.width || 1600 });
  }
  const crop = opts?.crop || "limit";
  const parts: string[] = ["f_auto", "q_auto:good"];
  if (opts?.width) parts.push(`w_${Math.round(opts.width)}`);
  if (opts?.height) parts.push(`h_${Math.round(opts.height)}`);
  if (opts?.width || opts?.height) parts.push(`c_${crop}`);
  const transform = parts.join(",");
  return injectCloudinaryTransform(url, transform);
}

/**
 * Lean hero/background video delivery — capped resolution + eco quality so the
 * public site does not pull a full camera master file.
 */
export function cloudinaryVideoDeliveryUrl(
  url: string,
  opts?: { width?: number },
): string {
  if (!url || !/res\.cloudinary\.com\//.test(url)) return url;
  if (looksLikeCloudinaryStill(url)) return url;
  const width = Math.round(opts?.width || 1600);
  return injectCloudinaryTransform(url, `f_mp4,q_auto:eco,vc_auto,w_${width},c_limit`);
}

/** Still frame from a Cloudinary video for poster / reduced-motion fallbacks. */
export function cloudinaryVideoPosterUrl(url: string, opts?: { width?: number }): string | undefined {
  if (!url || !/res\.cloudinary\.com\//.test(url)) return undefined;
  const width = Math.round(opts?.width || 1600);

  // Already a derived still (or image resource) — keep it, ensure a usable extension.
  if (looksLikeCloudinaryStill(url) && !/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) {
    return ensureStillExtension(url);
  }

  const framed = injectCloudinaryTransform(url, `so_0,f_jpg,q_auto:eco,w_${width},c_limit`).replace(
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i,
    ".jpg$2",
  );
  return ensureStillExtension(framed);
}

/**
 * URL safe for <img> / dashboard thumbs. Videos become a Cloudinary frame when possible.
 * Pass `isVideo` from the caller when you already know the asset type.
 */
export function mediaStillUrl(
  src?: string | null,
  opts?: { width?: number; isVideo?: boolean },
): string {
  if (!src) return "";
  const forceVideo = opts?.isVideo === true;
  const looksVideo =
    forceVideo ||
    /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(src) ||
    (/\/video\/upload\//i.test(src) && !looksLikeCloudinaryStill(src));
  if (!looksVideo) return src;
  return cloudinaryVideoPosterUrl(src, { width: opts?.width || 640 }) || "";
}
