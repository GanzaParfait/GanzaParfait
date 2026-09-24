import { NextResponse } from "next/server";
import { isCloudinaryConfigured, uploadToCloudinary, cloudinaryOptimizedUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 80);
}

function rateLimited(key: string, limit = 6, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

/**
 * Guest-safe avatar upload for the public testimonial form.
 * Images only, size-capped, rate-limited. Does not require dashboard auth.
 */
export async function POST(request: Request) {
  try {
    if (!isCloudinaryConfigured()) {
      return NextResponse.json(
        { error: "Photo upload is unavailable. You can still submit with a public image URL." },
        { status: 503 },
      );
    }

    if (rateLimited(clientKey(request))) {
      return NextResponse.json({ error: "Too many uploads. Please try again shortly." }, { status: 429 });
    }

    const form = await request.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Could not read that file." }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Keep the photo under 2 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer, {
      filename: file.name || "testimonial-photo.jpg",
      mime: file.type,
      folder: "princeparfait/testimonials",
    });
    const url = cloudinaryOptimizedUrl(uploaded.secureUrl || uploaded.url, {
      width: 480,
      height: 480,
      crop: "fill",
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("testimonial photo upload failed", error);
    return NextResponse.json({ error: "Could not upload that photo." }, { status: 500 });
  }
}
