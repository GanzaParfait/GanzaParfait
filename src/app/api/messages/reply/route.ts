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
    const type = String(body.type || "").trim();
    const id = String(body.id || "").trim();
    const replyText = String(body.replyText || "").trim();
    const toEmail = String(body.toEmail || "").trim().toLowerCase();

    if (!replyText) {
      return NextResponse.json({ error: "Reply text is required." }, { status: 400 });
    }

    const settings = await getServerSiteSettings();
    const brand = emailBrandFromSettings(settings);
    const supabase = createServerSupabase(true);

    if (type === "contact") {
      if (!id) return NextResponse.json({ error: "Message id is required." }, { status: 400 });
      const { data: message, error } = await supabase.from("contact_messages").select("*").eq("id", id).single();
      if (error || !message) {
        return NextResponse.json({ error: "Message not found." }, { status: 404 });
      }

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
    }

    if (type === "subscribe") {
      const email = toEmail || (id
        ? (await supabase.from("subscribers").select("email").eq("id", id).single()).data?.email
        : "");
      if (!email) {
        return NextResponse.json({ error: "Subscriber email is required." }, { status: 400 });
      }

      const content = {
        preheader: `A note from ${brand.title}`,
        eyebrow: "Reply",
        title: "Thanks for subscribing",
        body: replyText,
        ctaLabel: "Visit the site",
        ctaHref: brand.origin,
      };

      await sendMail({
        to: email,
        from: mailboxes.thanks(),
        replyTo: mailboxes.replyTo(),
        subject: `A note from ${brand.title}`,
        html: brandEmailHtml(content, settings),
        text: brandEmailText(content, settings),
        log: {
          kind: "subscriber_reply",
          relatedType: "subscriber",
          relatedId: id || undefined,
        },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unsupported message type for reply." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not send reply." }, { status: 500 });
  }
}
