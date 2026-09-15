import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { brandEmailHtml, brandEmailText, emailBrandFromSettings } from "@/lib/email-template";
import { mailboxes } from "@/lib/env";
import { sendMail } from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("ppg_admin_auth=true")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id || "").trim();
    const replyText = String(body.replyText || "").trim();
    if (!id || !replyText) {
      return NextResponse.json({ error: "Message id and reply text are required." }, { status: 400 });
    }

    const supabase = createServerSupabase(true);
    const { data: message, error } = await supabase.from("contact_messages").select("*").eq("id", id).single();
    if (error || !message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const settings = await getServerSiteSettings();
    const brand = emailBrandFromSettings(settings);
    const content = {
      preheader: `Reply from ${brand.title}`,
      eyebrow: "Reply",
      title: `Re: ${message.reason || "Your message"}`,
      body: replyText,
      detail: `<strong>Your original message</strong><br/>${String(message.message || "").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}`,
      ctaLabel: "Visit the site",
      ctaHref: brand.origin,
    };

    await sendMail({
      to: message.email,
      from: mailboxes.hello(),
      replyTo: mailboxes.replyTo(),
      subject: `Re: ${message.reason || "Your message"} — ${brand.title}`,
      html: brandEmailHtml(content, settings),
      text: brandEmailText(content, settings),
      log: {
        kind: "contact_reply",
        relatedType: "contact_message",
        relatedId: id,
      },
    });

    const { error: updateError } = await supabase
      .from("contact_messages")
      .update({
        status: "replied",
        reply_text: replyText,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not send reply." }, { status: 500 });
  }
}
