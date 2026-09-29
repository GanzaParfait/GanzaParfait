import { NextResponse } from "next/server";
import {
  adminNoticeCounts,
  getAdminNoticePrefs,
  deleteAdminNotifications,
  listAdminNotifications,
  markAdminNotificationsRead,
  saveAdminNoticePrefs,
} from "@/lib/admin-notifications";
import { createServerSupabase } from "@/lib/supabase-server";

function isAdmin(request: Request) {
  return (request.headers.get("cookie") || "").includes("ppg_admin_auth=true");
}

export async function GET(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = createServerSupabase(true);
  const url = new URL(request.url);
  const view = url.searchParams.get("view") || "summary";
  const counts = await adminNoticeCounts(supabase);
  const prefs = await getAdminNoticePrefs(supabase);
  if (view === "summary") {
    const recent = await listAdminNotifications(supabase, { page: 1, pageSize: 8, sort: "newest" });
    return NextResponse.json({ counts, prefs, items: recent.items, missing: recent.missing });
  }
  const listed = await listAdminNotifications(supabase, {
    q: url.searchParams.get("q") || "",
    sort: url.searchParams.get("sort") || "newest",
    kind: url.searchParams.get("kind") || "",
    page: Number(url.searchParams.get("page") || 1),
    pageSize: Number(url.searchParams.get("pageSize") || 12),
  });
  return NextResponse.json({ counts, prefs, ...listed });
}

export async function POST(request: Request) {
  if (!isAdmin(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    ids?: string[];
    kind?: string;
    all?: boolean;
    email?: string;
    enabled?: boolean;
  };
  const supabase = createServerSupabase(true);
  if (body.action === "delete") {
    const removed = await deleteAdminNotifications(supabase, {
      ids: Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string") : undefined,
      all: Boolean(body.all),
    });
    const counts = await adminNoticeCounts(supabase);
    return NextResponse.json({ ok: removed.ok, counts });
  }
  if (body.action === "prefs") {
    const saved = await saveAdminNoticePrefs(supabase, { email: body.email, enabled: body.enabled });
    if (!saved.ok) return NextResponse.json({ error: saved.error }, { status: 400 });
    return NextResponse.json({ ok: true, prefs: { email: saved.email, enabled: saved.enabled } });
  }
  const marked = await markAdminNotificationsRead(supabase, {
    ids: Array.isArray(body.ids) ? body.ids.filter((id) => typeof id === "string") : undefined,
    kind: body.kind,
    all: Boolean(body.all),
  });
  const counts = await adminNoticeCounts(supabase);
  return NextResponse.json({ ok: marked.ok, counts });
}
