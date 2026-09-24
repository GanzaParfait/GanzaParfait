import { NextResponse, after } from "next/server";
import { sendMail, testimonialAckMail, testimonialNotifyMail } from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { createServerSupabase } from "@/lib/supabase-server";
import { upsertSubscriber } from "@/lib/subscribers";
import {
  PUBLIC_TESTIMONIAL_COLUMNS,
  TESTIMONIAL_SUCCESS_MESSAGE,
  isPubliclyVisibleRow,
  isTestimonialStatus,
  toAdminTestimonial,
  toPublicTestimonial,
  validateTestimonialSubmission,
} from "@/lib/testimonials";

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return ip.slice(0, 80);
}

function rateLimited(key: string, limit = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > limit;
}

function isAdmin(request: Request): boolean {
  return (request.headers.get("cookie") || "").includes("ppg_admin_auth=true");
}

export async function POST(request: Request) {
  try {
    if (rateLimited(clientKey(request))) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const honeypot = String(body.company || body.website_url || "").trim();
    if (honeypot) {
      return NextResponse.json({ ok: true, message: TESTIMONIAL_SUCCESS_MESSAGE });
    }

    const parsed = validateTestimonialSubmission(body as Record<string, unknown>);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const supabase = createServerSupabase(true);
    const { data, error } = await supabase
      .from("testimonials")
      .insert([
        {
          ...parsed.value,
          status: "submitted",
          source: "visitor",
          is_public: false,
          verified: false,
          original_body: parsed.value.body,
          consent_accepted: true,
        },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("testimonials insert failed", error);
      return NextResponse.json({ error: "Could not save your testimonial." }, { status: 500 });
    }

    let subscribeOffer = false;
    try {
      const result = await upsertSubscriber(supabase, {
        email: parsed.value.submitter_email,
        name: parsed.value.person_name,
        source: "testimonial",
        confirmed: false,
      });
      subscribeOffer = !result.row?.confirmed;
    } catch (subError) {
      console.error("testimonial subscriber upsert failed", subError);
    }

    after(async () => {
      const site = await getServerSiteSettings();
      const relatedId = data?.id as string | undefined;

      try {
        const ack = await testimonialAckMail(
          { name: parsed.value.person_name, email: parsed.value.submitter_email },
          site,
        );
        await sendMail({
          ...ack,
          log: { kind: "testimonial_ack", relatedType: "testimonial", relatedId },
        });
      } catch (mailError) {
        console.error("Testimonial acknowledgment mail failed", mailError);
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        const projectLabel =
          parsed.value.project_title_other ||
          parsed.value.project_id ||
          undefined;
        const notify = await testimonialNotifyMail(
          {
            name: parsed.value.person_name,
            email: parsed.value.submitter_email,
            body: parsed.value.body,
            organization: parsed.value.organization || undefined,
            relationship: parsed.value.relationship || undefined,
            project: projectLabel,
            location: parsed.value.location || undefined,
          },
          site,
        );
        await sendMail({
          ...notify,
          log: { kind: "testimonial_notify", relatedType: "testimonial", relatedId },
        });
      } catch (mailError) {
        console.error("Testimonial notify mail failed", mailError);
      }
    });

    return NextResponse.json({
      ok: true,
      id: data?.id,
      message: TESTIMONIAL_SUCCESS_MESSAGE,
      subscribeOffer,
      email: parsed.value.submitter_email,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save your testimonial." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const supabase = createServerSupabase(true);

  if (isAdmin(request)) {
    let query = supabase
      .from("testimonials")
      .select("*")
      .order("featured", { ascending: false })
      .order("display_order", { ascending: true })
      .order("submitted_at", { ascending: false })
      .limit(500);

    const status = url.searchParams.get("status");
    if (status && isTestimonialStatus(status)) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const items = (data || []).map(toAdminTestimonial);
    const counts = {
      all: items.length,
      draft: items.filter((item) => item.status === "draft").length,
      submitted: items.filter((item) => item.status === "submitted").length,
      confirmed: items.filter((item) => item.status === "confirmed").length,
      published: items.filter((item) => item.status === "published").length,
      declined: items.filter((item) => item.status === "declined").length,
    };
    return NextResponse.json({ items, counts });
  }

  // Public deep-link: share token or id — still must pass visibility gate.
  const shareToken = (url.searchParams.get("token") || url.searchParams.get("testimonial") || "").trim();
  const byId = (url.searchParams.get("tm") || url.searchParams.get("id") || "").trim();
  if (shareToken || byId) {
    const deepSelect =
      "id, person_name, person_title, organization, body, short_body, photo_url, profile_url, relationship, project_id, project_title_other, location, testified_on, featured, display_order, share_token, status, is_public, verified, source";
    let single = supabase.from("testimonials").select(deepSelect);
    if (shareToken) single = single.eq("share_token", shareToken);
    else single = single.eq("id", byId);

    const { data, error } = await single.maybeSingle();
    const row = data as unknown as Record<string, unknown> | null;
    if (error || !row || !isPubliclyVisibleRow(row)) {
      return NextResponse.json({ item: null }, { status: 404 });
    }
    return NextResponse.json({ item: toPublicTestimonial(row) });
  }

  // Public list: published + public + verified + never placeholders.
  const limitParam = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.trunc(limitParam), 24) : 6;
  const projectId = (url.searchParams.get("projectId") || "").trim();

  let query = supabase
    .from("testimonials")
    .select(PUBLIC_TESTIMONIAL_COLUMNS)
    .eq("status", "published")
    .eq("is_public", true)
    .eq("verified", true)
    .neq("source", "placeholder")
    .order("featured", { ascending: false })
    .order("display_order", { ascending: true })
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (url.searchParams.get("featured") === "1") query = query.eq("featured", true);
  if (projectId) query = query.eq("project_id", projectId.slice(0, 120));

  const { data, error } = await query;
  if (error) {
    console.error("testimonials public read failed", error);
    return NextResponse.json({ items: [] });
  }

  const items = (data || []).map((row) => toPublicTestimonial(row as Record<string, unknown>));
  return NextResponse.json({ items });
}
