import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

function requireAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("ppg_admin_auth=true");
}

/** Lazy-load a single sent-mail HTML preview (kept out of the inbox list payload). */
export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing preview id" }, { status: 400 });
  }

  const supabase = createServerSupabase(true);
  const { data, error } = await supabase
    .from("mail_outbox")
    .select("preview_html")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    previewHtml: (data?.preview_html as string | null) || null,
  });
}
