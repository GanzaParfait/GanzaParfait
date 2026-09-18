import { NextResponse, after } from "next/server";
import {
  CV_UNLOCK_COOKIE,
  cvUnlockMaxAgeSeconds,
  isValidEmail,
  normalizeCvAccess,
  parseCvAccessSource,
  type CvAccessAction,
} from "@/lib/cv-access";
import { isCvTemplateId, getCvConfig } from "@/lib/cv";
import { sendMail, subscriberThanksMail } from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { createServerSupabase } from "@/lib/supabase-server";
import { upsertSubscriber } from "@/lib/subscribers";

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 80);
}

function rateLimited(key: string, limit = 12, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

function unlockCookie(rememberDays: ReturnType<typeof normalizeCvAccess>["rememberDays"]) {
  const maxAge = cvUnlockMaxAgeSeconds(rememberDays);
  const parts = [
    `${CV_UNLOCK_COOKIE}=1`,
    "Path=/",
    "SameSite=Lax",
  ];
  if (typeof maxAge === "number") parts.push(`Max-Age=${maxAge}`);
  return parts.join("; ");
}

export async function POST(request: Request) {
  try {
    if (rateLimited(clientKey(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const intent = String(body.intent || "submit").toLowerCase();
    const templateRaw = String(body.template || body.cv_format || "");
    const actionRaw = String(body.action || "view").toLowerCase();
    const honeypot = String(body.company || body.website_url || "").trim();

    if (honeypot) {
      // Silent success for bots
      const settings = await getServerSiteSettings();
      const access = getCvConfig(settings).access;
      const res = NextResponse.json({ ok: true, unlocked: true });
      res.headers.append("Set-Cookie", unlockCookie(access.rememberDays));
      return res;
    }

    if (!isCvTemplateId(templateRaw)) {
      return NextResponse.json({ error: "Invalid CV format." }, { status: 400 });
    }
    if (actionRaw !== "view" && actionRaw !== "download") {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
    const action = actionRaw as CvAccessAction;

    const settings = await getServerSiteSettings();
    const config = getCvConfig(settings);
    const access = config.access;
    const source = parseCvAccessSource(body.source);
    const referrer = String(body.referrer || "").slice(0, 500) || null;
    const utm_source = String(body.utm_source || "").slice(0, 120) || null;
    const utm_medium = String(body.utm_medium || "").slice(0, 120) || null;
    const utm_campaign = String(body.utm_campaign || "").slice(0, 120) || null;

    if (intent === "skip") {
      if (!access.allowSkip) {
        return NextResponse.json({ error: "Skip is not allowed." }, { status: 403 });
      }
      const res = NextResponse.json({ ok: true, unlocked: true, skipped: true });
      res.headers.append("Set-Cookie", unlockCookie(access.rememberDays));
      return res;
    }

    const email = String(body.email || "").trim().toLowerCase();
    const name = access.collectName ? String(body.name || "").trim().slice(0, 120) || null : null;
    const marketingConsent = Boolean(body.marketing_consent) && access.marketingOptInAvailable;

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = createServerSupabase(true);
    const { error: insertError } = await supabase.from("cv_access_leads").insert([
      {
        email,
        name,
        cv_format: templateRaw,
        action,
        marketing_consent: marketingConsent,
        source,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
      },
    ]);

    if (insertError) {
      console.error("cv_access_leads insert failed", insertError);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }

    if (marketingConsent) {
      try {
        const result = await upsertSubscriber(supabase, {
          email,
          name,
          source: "cv",
          confirmed: true,
        });
        const shouldThanks = result.created || !result.alreadyConfirmed;
        if (shouldThanks) {
          after(async () => {
            try {
              const mail = await subscriberThanksMail(email, settings);
              await sendMail({
                ...mail,
                log: {
                  kind: "subscriber_thanks",
                  relatedType: "subscriber",
                  relatedId: result.row?.id,
                },
              });
            } catch (mailError) {
              console.error("CV marketing thanks mail failed", mailError);
            }
          });
        }
      } catch (subError) {
        console.error("CV marketing subscribe failed", subError);
      }
    }

    const res = NextResponse.json({
      ok: true,
      unlocked: true,
      format: templateRaw,
      action,
    });
    res.headers.append("Set-Cookie", unlockCookie(access.rememberDays));
    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
