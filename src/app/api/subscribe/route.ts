import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { sendMail, subscriberThanksMail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const url = env("NEXT_PUBLIC_SUPABASE_URL");
    const key = env("SUPABASE_SERVICE_ROLE_KEY") || env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!url || !key) {
      return NextResponse.json({ error: "Subscriptions are not configured." }, { status: 503 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: inserted, error } = await supabase
      .from("subscribers")
      .insert([
        {
          email,
          device: String(body.device || "").slice(0, 500),
          location: String(body.location || "").slice(0, 200),
          country: String(body.country || "").slice(0, 120),
        },
      ])
      .select("id")
      .maybeSingle();

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      const mail = await subscriberThanksMail(email);
      await sendMail({
        ...mail,
        log: {
          kind: "subscriber_thanks",
          relatedType: "subscriber",
          relatedId: inserted?.id,
        },
      });
    } catch (mailError) {
      console.error("Subscriber thanks mail failed", mailError);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not subscribe." }, { status: 500 });
  }
}
