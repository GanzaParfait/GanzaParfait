import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import { isCloudinaryConfigured } from "@/lib/cloudinary";
import { mediaAdminClient, registerCloudinaryAsset } from "@/lib/media-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as {
      publicId?: string;
      secureUrl?: string;
      bytes?: number;
      resourceType?: string;
      format?: string;
      width?: number;
      height?: number;
      originalFilename?: string;
      alt?: string;
      mimeType?: string;
    };

    if (!body.publicId || !body.secureUrl) {
      return NextResponse.json({ error: "Missing Cloudinary publicId or secureUrl." }, { status: 400 });
    }

    const supabase = mediaAdminClient();
    const asset = await registerCloudinaryAsset(supabase, {
      publicId: body.publicId,
      secureUrl: body.secureUrl,
      bytes: body.bytes,
      resourceType: body.resourceType,
      format: body.format,
      width: body.width,
      height: body.height,
      originalFilename: body.originalFilename,
      alt: body.alt,
      mimeType: body.mimeType,
    });

    return NextResponse.json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not register that upload.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
