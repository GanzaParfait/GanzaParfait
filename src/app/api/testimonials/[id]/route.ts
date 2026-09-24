import { NextResponse, after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendMail, testimonialPublishedMail } from "@/lib/mail";
import { emailBrandFromSettings } from "@/lib/email-template";
import { getServerSiteSettings } from "@/lib/site-settings-server";
import { createServerSupabase } from "@/lib/supabase-server";
import {
  buildAdminPatch,
  canPublishTestimonial,
  isTestimonialStatus,
  testimonialShareUrl,
  toAdminTestimonial,
} from "@/lib/testimonials";

function isAdmin(request: Request): boolean {
  return (request.headers.get("cookie") || "").includes("ppg_admin_auth=true");
}

/**
 * Swap a row with its neighbour inside the same featured bucket, then re-stamp
 * sequential display_order values so repeated moves stay stable.
 */
async function moveWithinBucket(
  supabase: SupabaseClient,
  id: string,
  featured: boolean,
  direction: "up" | "down",
) {
  const { data, error } = await supabase
    .from("testimonials")
    .select("id")
    .eq("status", "published")
    .eq("is_public", true)
    .eq("featured", featured)
    .order("display_order", { ascending: true })
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);

  const rows = (data || []).map((row) => String(row.id));
  const index = rows.indexOf(id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return;

  [rows[index], rows[target]] = [rows[target], rows[index]];

  const stamp = new Date().toISOString();
  for (const [position, rowId] of rows.entries()) {
    const { error: updateError } = await supabase
      .from("testimonials")
      .update({ display_order: position, updated_at: stamp })
      .eq("id", rowId);
    if (updateError) throw new Error(updateError.message);
  }
}

function publishGate(current: Record<string, unknown>, patch: Record<string, unknown>) {
  const source = String(patch.source ?? current.source ?? "visitor");
  const verified = "verified" in patch ? Boolean(patch.verified) : Boolean(current.verified);
  const personName = String(patch.person_name ?? current.person_name ?? "");
  return canPublishTestimonial({ source, verified, personName });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing testimonial id." }, { status: 400 });

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const supabase = createServerSupabase(true);

    const { data: current, error: loadError } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (loadError) return NextResponse.json({ error: loadError.message }, { status: 500 });
    if (!current) return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });

    const action = String(body.action || "").toLowerCase();

    if (action === "move") {
      const direction = body.direction === "up" ? "up" : "down";
      await moveWithinBucket(supabase, id, Boolean(current.featured), direction);
      const { data: moved } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
      return NextResponse.json({ ok: true, item: moved ? toAdminTestimonial(moved) : null });
    }

    const patch: Record<string, unknown> = {
      ...buildAdminPatch(body),
      updated_at: new Date().toISOString(),
    };

    const notifyAuthor =
      body.notifyAuthor === true ||
      body.notify_author === true ||
      ("notify_on_publish" in body && Boolean(body.notify_on_publish));

    if (action === "confirm") {
      patch.status = "confirmed";
    } else if (action === "approve" || action === "publish") {
      const gate = publishGate(current, patch);
      if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 400 });
      patch.status = "published";
      patch.is_public = true;
      if (!current.share_token) patch.share_token = crypto.randomUUID();
      if (!current.approved_at) patch.approved_at = new Date().toISOString();
      if (notifyAuthor) patch.notify_on_publish = true;
    } else if (action === "decline") {
      patch.status = "declined";
      patch.is_public = false;
    } else if (action === "reset") {
      patch.status = "submitted";
      patch.approved_at = null;
      patch.is_public = false;
    } else if (action === "feature") {
      patch.featured = true;
    } else if (action === "unfeature") {
      patch.featured = false;
    } else if (isTestimonialStatus(body.status)) {
      if (body.status === "published") {
        const gate = publishGate(current, patch);
        if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 400 });
        patch.is_public = true;
        if (!current.share_token) patch.share_token = crypto.randomUUID();
        if (!current.approved_at) patch.approved_at = new Date().toISOString();
        if (notifyAuthor) patch.notify_on_publish = true;
      }
      patch.status = body.status;
    }

    if (typeof patch.body === "string" && !current.original_body) {
      patch.original_body = current.body;
    }

    if ("moderation_notes" in body) {
      const notes = String(body.moderation_notes ?? "").trim();
      patch.moderation_notes = notes ? notes.slice(0, 2000) : null;
    }

    const { data, error } = await supabase
      .from("testimonials")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const becamePublished =
      data.status === "published" &&
      current.status !== "published" &&
      (notifyAuthor || Boolean(data.notify_on_publish));

    if (becamePublished && data.submitter_email && data.share_token) {
      const shareToken = String(data.share_token);
      const email = String(data.submitter_email);
      const name = String(data.person_name || "");
      const project =
        (data.project_title_other as string | null) ||
        (data.project_id as string | null) ||
        undefined;
      after(async () => {
        try {
          const site = await getServerSiteSettings();
          const brand = emailBrandFromSettings(site);
          const mail = await testimonialPublishedMail(
            email,
            {
              name,
              shareUrl: testimonialShareUrl(brand.origin, shareToken),
              project: project || undefined,
            },
            site,
          );
          await sendMail({
            ...mail,
            log: { kind: "testimonial_published", relatedType: "testimonial", relatedId: id },
          });
        } catch (mailError) {
          console.error("Testimonial published mail failed", mailError);
        }
      });
    }

    return NextResponse.json({ ok: true, item: toAdminTestimonial(data) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update that testimonial.";
    console.error("testimonial patch failed", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing testimonial id." }, { status: 400 });

  const supabase = createServerSupabase(true);
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
