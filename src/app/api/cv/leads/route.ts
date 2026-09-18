import { NextRequest, NextResponse } from "next/server";
import { isDashboardAuthorized } from "@/lib/admin-auth";
import { createServerSupabase } from "@/lib/supabase-server";

function requireAdmin(request: NextRequest) {
  if (!isDashboardAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format");
    const action = searchParams.get("action");
    const limit = Math.min(Number(searchParams.get("limit") || 100) || 100, 500);

    const supabase = createServerSupabase(true);
    let query = supabase
      .from("cv_access_leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (format && format !== "all") query = query.eq("cv_format", format);
    if (action && action !== "all") query = query.eq("action", action);

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const emails = new Set(rows.map((r) => String(r.email || "").toLowerCase()));
    const metrics = {
      total: rows.length,
      uniqueEmails: emails.size,
      downloads: rows.filter((r) => r.action === "download").length,
      views: rows.filter((r) => r.action === "view").length,
      marketingOptIns: rows.filter((r) => r.marketing_consent).length,
    };

    // Broader metrics from full table (not just filtered page)
    const { count: totalAll } = await supabase
      .from("cv_access_leads")
      .select("*", { count: "exact", head: true });
    const { data: uniqueRows } = await supabase.from("cv_access_leads").select("email");
    const { count: downloadsAll } = await supabase
      .from("cv_access_leads")
      .select("*", { count: "exact", head: true })
      .eq("action", "download");
    const { count: viewsAll } = await supabase
      .from("cv_access_leads")
      .select("*", { count: "exact", head: true })
      .eq("action", "view");
    const { count: marketingAll } = await supabase
      .from("cv_access_leads")
      .select("*", { count: "exact", head: true })
      .eq("marketing_consent", true);

    const uniqueAll = new Set((uniqueRows || []).map((r) => String(r.email || "").toLowerCase())).size;

    return NextResponse.json({
      leads: rows,
      metrics: {
        total: totalAll ?? metrics.total,
        uniqueEmails: uniqueAll || metrics.uniqueEmails,
        downloads: downloadsAll ?? metrics.downloads,
        views: viewsAll ?? metrics.views,
        marketingOptIns: marketingAll ?? metrics.marketingOptIns,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not load CV leads." }, { status: 500 });
  }
}
