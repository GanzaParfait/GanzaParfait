import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { softUnsubscribeByIds, upsertSubscriber } from "@/lib/subscribers";

function requireAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("ppg_admin_auth=true");
}

export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();
  const confirmed = searchParams.get("confirmed"); // true | false | all | unsubscribed
  const source = (searchParams.get("source") || "").trim();

  const supabase = createServerSupabase(true);
  let query = supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(500);

  if (confirmed === "true") query = query.eq("confirmed", true).is("unsubscribed_at", null);
  if (confirmed === "false") query = query.eq("confirmed", false).is("unsubscribed_at", null);
  if (confirmed === "unsubscribed") query = query.not("unsubscribed_at", "is", null);
  if (source) query = query.eq("source", source);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = data || [];
  if (q) {
    rows = rows.filter(
      (row) =>
        String(row.email || "")
          .toLowerCase()
          .includes(q) ||
        String(row.name || "")
          .toLowerCase()
          .includes(q) ||
        String(row.country || "")
          .toLowerCase()
          .includes(q) ||
        String(row.location || "")
          .toLowerCase()
          .includes(q),
    );
  }

  const all = data || [];
  const active = all.filter((row) => !row.unsubscribed_at);
  return NextResponse.json({
    subscribers: rows,
    counts: {
      all: all.length,
      confirmed: active.filter((row) => row.confirmed).length,
      unconfirmed: active.filter((row) => !row.confirmed).length,
      unsubscribed: all.filter((row) => row.unsubscribed_at).length,
    },
  });
}

export async function POST(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    const supabase = createServerSupabase(true);
    const result = await upsertSubscriber(supabase, {
      email,
      name: String(body.name || "").trim() || null,
      source: "dashboard",
      confirmed: body.confirmed !== false,
    });
    return NextResponse.json({ ok: true, subscriber: result.row });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save subscriber." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (typeof body.confirmed === "boolean") {
      patch.confirmed = body.confirmed;
      if (body.confirmed) patch.unsubscribed_at = null;
    }
    if (typeof body.name === "string") patch.name = body.name.trim() || null;
    if (typeof body.source === "string") patch.source = body.source.trim() || null;
    if (body.resubscribe === true) {
      patch.unsubscribed_at = null;
      patch.confirmed = true;
    }
    if (body.unsubscribe === true) {
      patch.unsubscribed_at = new Date().toISOString();
    }

    const supabase = createServerSupabase(true);
    const { data, error } = await supabase.from("subscribers").update(patch).eq("id", id).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, subscriber: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not update subscriber." }, { status: 500 });
  }
}

/** Soft-unsubscribe only — rows are never deleted. */
export async function DELETE(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.map(String) : body.id ? [String(body.id)] : [];
    if (!ids.length) return NextResponse.json({ error: "Missing ids." }, { status: 400 });
    const supabase = createServerSupabase(true);
    const count = await softUnsubscribeByIds(supabase, ids);
    return NextResponse.json({ ok: true, unsubscribed: count, deleted: 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not unsubscribe selected rows." }, { status: 500 });
  }
}
