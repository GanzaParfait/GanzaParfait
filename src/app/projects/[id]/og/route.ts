import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import sharp from "sharp";
import { getPublicProject } from "@/lib/projects";

export const revalidate = 86400;

const FALLBACK = path.join(process.cwd(), "public/images/og/seo-share-image.jpg");

async function loadSource(src: string | undefined): Promise<Buffer> {
  if (!src) return readFile(FALLBACK);
  if (src.startsWith("http://") || src.startsWith("https://")) {
    const response = await fetch(src);
    if (!response.ok) return readFile(FALLBACK);
    return Buffer.from(await response.arrayBuffer());
  }
  const relative = src.replace(/^\//, "").split("?")[0];
  try {
    return await readFile(path.join(process.cwd(), "public", relative));
  } catch {
    return readFile(FALLBACK);
  }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const project = await getPublicProject(id);
  if (!project) return new NextResponse("Not found", { status: 404 });

  const source = await loadSource(project.image || project.pinnedMedia?.[0]);
  const jpeg = await sharp(source)
    .resize(1200, 630, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new NextResponse(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
