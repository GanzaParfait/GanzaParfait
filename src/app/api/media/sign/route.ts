import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import {
  createCloudinaryUploadSignature,
  isCloudinaryConfigured,
} from "@/lib/cloudinary";
import { classifyMediaType } from "@/lib/media";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json(
      {
        error:
          "Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL).",
        cloudinary: false,
      },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      filename?: string;
      mimeType?: string;
    };
    const type = classifyMediaType(body.mimeType, body.filename);
    const resourceType = type === "video" ? "video" : type === "image" ? "image" : "auto";
    const signed = createCloudinaryUploadSignature({ resourceType });
    return NextResponse.json({
      cloudinary: true,
      ...signed,
      resourceType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not prepare Cloudinary upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
