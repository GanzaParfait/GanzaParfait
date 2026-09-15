import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";

function requireAdmin(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  return cookie.includes("ppg_admin_auth=true");
}

export async function GET(request: Request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerSupabase(true);
  const [{ data: contacts, error: contactError }, { data: subscribers, error: subError }, { data: sent, error: sentError }] =
    await Promise.all([
      supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(150),
      supabase.from("subscribers").select("*").order("created_at", { ascending: false }).limit(150),
      supabase.from("mail_outbox").select("*").order("created_at", { ascending: false }).limit(150),
    ]);

  if (contactError) {
    return NextResponse.json({ error: contactError.message }, { status: 500 });
  }
  if (subError) {
    return NextResponse.json({ error: subError.message }, { status: 500 });
  }
  if (sentError) {
    return NextResponse.json({ error: sentError.message }, { status: 500 });
  }

  const items = [
    ...(contacts || []).map((row) => ({
      id: `contact:${row.id}`,
      sourceId: row.id as string,
      type: "contact" as const,
      direction: "inbound" as const,
      title: row.name as string,
      email: row.email as string,
      subtitle: (row.reason as string | null) || "Contact form",
      body: row.message as string,
      status: row.status as string,
      replyText: (row.reply_text as string | null) || null,
      previewHtml: null as string | null,
      createdAt: row.created_at as string,
    })),
    ...(subscribers || []).map((row) => ({
      id: `subscribe:${row.id}`,
      sourceId: row.id as string,
      type: "subscribe" as const,
      direction: "inbound" as const,
      title: (row.name as string | null) || "New subscriber",
      email: row.email as string,
      subtitle:
        [row.confirmed ? "Confirmed" : "Unconfirmed", row.source, row.location, row.country]
          .filter(Boolean)
          .join(" · ") || "Newsletter signup",
      body: `Subscribed from ${row.device || "unknown device"}.`,
      status: row.confirmed ? "confirmed" : "unconfirmed",
      replyText: null as string | null,
      previewHtml: null as string | null,
      createdAt: row.created_at as string,
    })),
    ...(sent || []).map((row) => ({
      id: `sent:${row.id}`,
      sourceId: row.id as string,
      type: "sent" as const,
      direction: "outbound" as const,
      title: row.subject as string,
      email: row.to_email as string,
      subtitle: `${row.kind}${(row.from_email as string | null) ? ` · from ${row.from_email}` : ""}`,
      body: (row.preview_text as string | null) || "",
      status: row.status as string,
      replyText: null as string | null,
      previewHtml: (row.preview_html as string | null) || null,
      createdAt: row.created_at as string,
      kind: row.kind as string,
      relatedType: (row.related_type as string | null) || null,
      relatedId: (row.related_id as string | null) || null,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    items,
    counts: {
      contact: contacts?.length || 0,
      subscribe: subscribers?.length || 0,
      sent: sent?.length || 0,
      all: items.length,
    },
  });
}
