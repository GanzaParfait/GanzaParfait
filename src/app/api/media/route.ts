import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import { MEDIA_MAX_FILE_BYTES } from "@/lib/media";
import { listMediaAssets, mediaAdminClient, uploadMediaBuffer } from "@/lib/media-server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = mediaAdminClient();
    const assets = await listMediaAssets(supabase);
    return NextResponse.json({ assets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load media.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    if (!files.length) {
      return NextResponse.json({ error: "Choose at least one file to upload." }, { status: 400 });
    }

    const supabase = mediaAdminClient();
    const assets = [];
    for (const file of files) {
      if (file.size > MEDIA_MAX_FILE_BYTES) {
        return NextResponse.json({ error: `${file.name} is larger than 10 MB.` }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const asset = await uploadMediaBuffer(
        supabase,
        { name: file.name, type: file.type, buffer, size: file.size },
        { source: "upload", alt: String(form.get("alt") || "") },
      );
      assets.push(asset);
    }

    return NextResponse.json({ assets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload that file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
