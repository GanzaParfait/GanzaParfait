import { NextResponse, after } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { contactAckMail, contactNotifyMail, sendMail } from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { mailboxes } from "@/lib/env";
import { upsertSubscriber } from "@/lib/subscribers";

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
      return NextResponse.json({ error: "Please write a short message (at least 10 characters)." }, { status: 400 });
    }
    if (message.length > 4000) {
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

    let subscribeOffer = false;
    try {
      const result = await upsertSubscriber(supabase, {
        email,
        name,
        source: "contact",
        confirmed: false,
      });
      subscribeOffer = !result.row?.confirmed;
    } catch (subError) {
      console.error("contact subscriber upsert failed", subError);
    }

    after(async () => {
      const site = await getServerSiteSettings();
      const relatedId = data?.id;
      const primaryTo = (site.contactEmail || "").trim() || mailboxes.contact() || mailboxes.hello();

      // Visitor confirmation first — then inbox notify (avoids shared-host SMTP pile-ups).
      try {
        const ack = await contactAckMail({ name, email, subject: reason || undefined }, site);
        await sendMail({
          ...ack,
          log: {
            kind: "contact_ack",
            relatedType: "contact_message",
            relatedId,
          },
        });
      } catch (mailError) {
        console.error("Contact acknowledgment mail failed", mailError);
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        const notify = await contactNotifyMail(
          {
            name,
            email,
            message,
            subject: reason || "Project / Collaboration",
          },
          site,
        );
        await sendMail({
          ...notify,
          to: primaryTo,
          log: {
            kind: "contact_notify",
            relatedType: "contact_message",
            relatedId,
          },
        });
      } catch (mailError) {
        console.error("Contact notify mail failed", mailError);
      }
    });

    return NextResponse.json({ ok: true, id: data?.id, subscribeOffer, email });
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
