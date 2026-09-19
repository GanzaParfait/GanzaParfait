import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase-server";
import { softUnsubscribe } from "@/lib/subscribers";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

function parseBody(body: Record<string, unknown>) {
  const email = String(body.email || "").trim().toLowerCase();
  const token = String(body.token || "").trim();
  return { email, token };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const { email, token } = parseBody(body);

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!verifyUnsubscribeToken(email, token)) {
      return NextResponse.json({ error: "Invalid or expired unsubscribe link." }, { status: 403 });
    }

    const supabase = createServerSupabase(true);
    const result = await softUnsubscribe(supabase, email);

    if (!result.row) {
      // Still success for privacy — don't reveal whether the address existed.
      return NextResponse.json({ ok: true, unsubscribed: true, alreadyUnsubscribed: false });
    }

    return NextResponse.json({
      ok: true,
      unsubscribed: true,
      alreadyUnsubscribed: result.alreadyUnsubscribed,
    });
  } catch (error) {
    console.error("Unsubscribe failed", error);
    return NextResponse.json({ error: "Could not unsubscribe." }, { status: 500 });
  }
}
