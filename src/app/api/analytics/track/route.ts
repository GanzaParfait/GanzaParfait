import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import {
  VISITOR_COOKIE,
  SESSION_COOKIE,
  SESSION_TOUCH_COOKIE,
  SESSION_TIMEOUT_MS,
  parseDevice,
} from "@/lib/analytics";
import { getClientIp, normalizeIp, resolveGeo } from "@/lib/geo";
import { createServerSupabase } from "@/lib/supabase-server";

interface TrackPayload {
  page_path?: string;
  referrer?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackPayload;
    const pagePath = body.page_path?.trim();

    if (!pagePath || pagePath.startsWith("/dashboard") || pagePath.startsWith("/api/")) {
      return NextResponse.json({ ok: false, reason: "ignored" }, { status: 200 });
    }

    const cookieStore = await cookies();
    const now = Date.now();

    let visitorId = cookieStore.get(VISITOR_COOKIE)?.value;
    if (!visitorId) visitorId = randomUUID();

    const sessionTouchRaw = cookieStore.get(SESSION_TOUCH_COOKIE)?.value;
    const sessionTouch = sessionTouchRaw ? Number(sessionTouchRaw) : 0;
    const sessionExpired = !sessionTouch || now - sessionTouch > SESSION_TIMEOUT_MS;

    let sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId || sessionExpired) sessionId = randomUUID();

    const userAgent = request.headers.get("user-agent") || "";
    const { type: deviceType, label: deviceLabel } = parseDevice(userAgent);
    const ip = getClientIp(request.headers);
    const normalizedIp = normalizeIp(ip);
    const geo = await resolveGeo(request.headers, normalizedIp);
    const storedIp = geo.resolved_ip || normalizedIp || ip;

    const supabase = createServerSupabase(true);

    const baseRecord = {
      page_path: pagePath.slice(0, 255),
      referrer: body.referrer?.slice(0, 500) || null,
      country_code: geo.country_code,
      country_name: geo.country_name,
      country_flag: geo.country_flag,
      device: deviceLabel,
      ip_address: storedIp,
    };

    const extendedRecord = {
      ...baseRecord,
      visitor_id: visitorId,
      session_id: sessionId,
      user_agent: userAgent.slice(0, 500),
      device_type: deviceType,
    };

    let { error } = await supabase.from("page_views").insert(extendedRecord);
    if (error && /column|schema cache/i.test(error.message)) {
      ({ error } = await supabase.from("page_views").insert(baseRecord));
    }

    if (error) {
      console.error("Analytics insert failed:", error.message);
      const setupHint =
        /permission denied|relation .* does not exist/i.test(error.message)
          ? "Run supabase_analytics.sql in your Supabase SQL editor to create the page_views table and policies."
          : error.message;
      return NextResponse.json({ ok: false, error: setupHint }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true });
    const cookieOptions = {
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    };

    response.cookies.set(VISITOR_COOKIE, visitorId, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 365,
    });
    response.cookies.set(SESSION_COOKIE, sessionId, {
      ...cookieOptions,
      maxAge: Math.floor(SESSION_TIMEOUT_MS / 1000),
    });
    response.cookies.set(SESSION_TOUCH_COOKIE, String(now), {
      ...cookieOptions,
      maxAge: Math.floor(SESSION_TIMEOUT_MS / 1000),
    });

    return response;
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
