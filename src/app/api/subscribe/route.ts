import { NextResponse, after } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { sendMail, subscriberThanksMail } from "@/lib/mail";
import { upsertSubscriber } from "@/lib/subscribers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim() || null;
    const confirmOnly = Boolean(body.confirm);
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const supabase = createServerSupabase(true);
    const result = await upsertSubscriber(supabase, {
      email,
      name,
      source: confirmOnly ? "contact" : "widget",
      confirmed: true,
      device: String(body.device || "").slice(0, 500) || null,
      location: String(body.location || "").slice(0, 200) || null,
      country: String(body.country || "").slice(0, 120) || null,
    });

    const shouldThanks = result.created || !result.alreadyConfirmed;
    if (shouldThanks) {
      after(async () => {
        try {
          const mail = await subscriberThanksMail(email);
          await sendMail({
            ...mail,
            log: {
              kind: "subscriber_thanks",
              relatedType: "subscriber",
              relatedId: result.row?.id,
            },
          });
        } catch (mailError) {
          console.error("Subscriber thanks mail failed", mailError);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      confirmed: true,
      created: result.created,
      alreadyConfirmed: result.alreadyConfirmed,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
  }
}
