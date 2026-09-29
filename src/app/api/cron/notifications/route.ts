import { NextResponse } from "next/server";
import { sendAdminNotificationDigest } from "@/lib/admin-notifications";
import { createServerSupabase } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const supabase = createServerSupabase(true);
    const result = await sendAdminNotificationDigest(supabase);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Digest failed";
    console.error("notification digest failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
