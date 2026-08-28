import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import { deleteMediaAsset, mediaAdminClient } from "@/lib/media-server";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing asset id." }, { status: 400 });
    const supabase = mediaAdminClient();
    await deleteMediaAsset(supabase, id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete that asset.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
