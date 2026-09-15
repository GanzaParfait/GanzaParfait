import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { contactNotifyMail, sendMail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const reason = String(body.reason || "").trim();
    const message = String(body.message || "").trim();

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "A valid name is required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!message || message.length < 10) {
      return NextResponse.json({ error: "Please write a short message." }, { status: 400 });
    }
    if (message.length > 1000) {
      return NextResponse.json({ error: "Message is too long." }, { status: 400 });
    }

    const supabase = createServerSupabase(true);
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([{ name, email, reason: reason || null, message, status: "new" }])
      .select("id")
      .single();

    if (error) {
      console.error("contact_messages insert failed", error);
      return NextResponse.json({ error: "Could not save your message." }, { status: 500 });
    }

    try {
      await sendMail({
        ...(await contactNotifyMail({
          name,
          email,
          message,
          subject: reason || "Project / Collaboration",
        })),
        log: {
          kind: "contact_notify",
          relatedType: "contact_message",
          relatedId: data?.id,
        },
      });
    } catch (mailError) {
      console.error("Contact notify mail failed", mailError);
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not send message." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("ppg_admin_auth=true")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createServerSupabase(true);
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ messages: data || [] });
}
