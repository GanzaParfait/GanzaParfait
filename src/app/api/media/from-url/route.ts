import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import { MEDIA_MAX_FILE_BYTES, isAllowedLibraryFile, looksLikeMediaUrl, mimeFromName } from "@/lib/media";
import { assertSafeRemoteUrl, mediaAdminClient, uploadMediaBuffer } from "@/lib/media-server";

export const runtime = "nodejs";
export const maxDuration = 60;

function fileNameFromUrl(url: URL, mime: string) {
  const last = url.pathname.split("/").filter(Boolean).pop() || "";
  const decoded = decodeURIComponent(last).split("?")[0];
  if (decoded && /\.[a-z0-9]{2,8}$/i.test(decoded)) return decoded;
  const ext = mime.includes("pdf")
    ? "pdf"
    : mime.includes("spreadsheet") || mime.includes("excel")
      ? "xlsx"
      : mime.includes("word")
        ? "docx"
        : mime.includes("png")
          ? "png"
          : mime.includes("webp")
            ? "webp"
            : mime.includes("gif")
              ? "gif"
              : mime.includes("mp4")
                ? "mp4"
                : mime.includes("webm")
                  ? "webm"
                  : mime.includes("zip")
                    ? "zip"
                    : "bin";
  return `imported-asset.${ext}`;
}

export async function POST(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { url?: string; name?: string; alt?: string };
    const rawUrl = body.url?.trim() || "";
    if (!looksLikeMediaUrl(rawUrl)) {
      return NextResponse.json({ error: "Enter a public https:// file URL." }, { status: 400 });
    }

    const parsed = assertSafeRemoteUrl(rawUrl);
    const remote = await fetch(parsed.toString(), {
      redirect: "follow",
      headers: { Accept: "image/*,video/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.*,*/*;q=0.8" },
    });
    if (!remote.ok) {
      return NextResponse.json({ error: `Could not download that URL (${remote.status}).` }, { status: 400 });
    }

    const headerMime = remote.headers.get("content-type")?.split(";")[0].trim() || "";
    const mime = headerMime && headerMime !== "application/octet-stream"
      ? headerMime
      : mimeFromName(parsed.pathname) || headerMime;
    if (!isAllowedLibraryFile(mime, parsed.pathname)) {
      return NextResponse.json({ error: "That URL is not an allowed library file." }, { status: 400 });
    }

    const length = Number(remote.headers.get("content-length") || 0);
    if (length > MEDIA_MAX_FILE_BYTES) {
      return NextResponse.json({ error: "That file is larger than 10 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await remote.arrayBuffer());
    if (buffer.byteLength > MEDIA_MAX_FILE_BYTES) {
      return NextResponse.json({ error: "That file is larger than 10 MB." }, { status: 400 });
    }

    const name = body.name?.trim() || fileNameFromUrl(parsed, mime);
    const supabase = mediaAdminClient();
    const asset = await uploadMediaBuffer(
      supabase,
      { name, type: mime, buffer, size: buffer.byteLength },
      { source: "url", alt: body.alt?.trim() || "", originalUrl: parsed.toString() },
    );

    return NextResponse.json({ asset });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not import that URL.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
