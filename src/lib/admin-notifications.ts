import type { SupabaseClient } from "@supabase/supabase-js";
import { brandEmailHtml, brandEmailText } from "@/lib/email-template";
import { sendMail } from "@/lib/mail";
import { getServerSiteSettings } from "@/lib/site-settings-server";

export type AdminNoticeKind = "subscriber" | "message" | "testimonial";

export type AdminNotice = {
  id: string;
  kind: AdminNoticeKind;
  title: string;
  body: string;
  href: string;
  relatedId: string;
  createdAt: string;
  readAt: string | null;
  emailedAt: string | null;
};

export type AdminNoticeCounts = {
  subscriber: number;
  message: number;
  testimonial: number;
  total: number;
};

const KINDS: AdminNoticeKind[] = ["subscriber", "message", "testimonial"];
const DEFAULT_EMAIL = "ganzaparfait7@gmail.com";

function isKind(value: string): value is AdminNoticeKind {
  return KINDS.includes(value as AdminNoticeKind);
}

function missingTable(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || /does not exist/i.test(error.message || "");
}

function mapRow(row: Record<string, unknown>): AdminNotice {
  const kind = String(row.kind || "");
  return {
    id: String(row.id || ""),
    kind: isKind(kind) ? kind : "message",
    title: String(row.title || ""),
    body: String(row.body || ""),
    href: String(row.href || "/dashboard/notifications"),
    relatedId: String(row.related_id || ""),
    createdAt: String(row.created_at || ""),
    readAt: row.read_at ? String(row.read_at) : null,
    emailedAt: row.emailed_at ? String(row.emailed_at) : null,
  };
}

export async function recordAdminNotification(
  supabase: SupabaseClient,
  input: {
    kind: AdminNoticeKind;
    title: string;
    body?: string;
    href: string;
    relatedId: string;
  },
) {
  if (!input.relatedId) return;
  try {
    const { error } = await supabase.from("admin_notifications").upsert(
      {
        kind: input.kind,
        title: input.title.slice(0, 180),
        body: (input.body || "").slice(0, 500),
        href: input.href,
        related_id: input.relatedId,
      },
      { onConflict: "kind,related_id", ignoreDuplicates: true },
    );
    if (error && !missingTable(error)) console.error("admin notification insert failed", error);
  } catch (error) {
    console.error("admin notification insert failed", error);
  }
}

async function syncUnread(supabase: SupabaseClient) {
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("id, name, message, created_at")
    .eq("status", "new")
    .order("created_at", { ascending: false })
    .limit(80);
  for (const row of messages || []) {
    await recordAdminNotification(supabase, {
      kind: "message",
      title: `New message from ${row.name || "someone"}`,
      body: String(row.message || "").slice(0, 180),
      href: "/dashboard/messages",
      relatedId: String(row.id),
    });
  }

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("id, person_name, body, submitted_at")
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false })
    .limit(80);
  for (const row of testimonials || []) {
    await recordAdminNotification(supabase, {
      kind: "testimonial",
      title: `New testimonial from ${row.person_name || "a visitor"}`,
      body: String(row.body || "").slice(0, 180),
      href: "/dashboard/testimonials",
      relatedId: String(row.id),
    });
  }

  const since = new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString();
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("id, email, name, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(80);
  for (const row of subscribers || []) {
    await recordAdminNotification(supabase, {
      kind: "subscriber",
      title: `New subscriber ${row.email || ""}`.trim(),
      body: row.name ? String(row.name) : "Joined the list",
      href: "/dashboard/subscribers",
      relatedId: String(row.id),
    });
  }
}

export async function adminNoticeCounts(supabase: SupabaseClient): Promise<AdminNoticeCounts> {
  const empty: AdminNoticeCounts = { subscriber: 0, message: 0, testimonial: 0, total: 0 };
  try {
    await syncUnread(supabase);
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("kind")
      .is("read_at", null);
    if (error) {
      if (!missingTable(error)) console.error("admin notification counts failed", error);
      return empty;
    }
    for (const row of data || []) {
      const kind = String(row.kind || "");
      if (isKind(kind)) empty[kind] += 1;
    }
    empty.total = empty.subscriber + empty.message + empty.testimonial;
    return empty;
  } catch (error) {
    console.error("admin notification counts failed", error);
    return empty;
  }
}

export async function listAdminNotifications(
  supabase: SupabaseClient,
  query: { q?: string; sort?: string; kind?: string; page?: number; pageSize?: number },
) {
  const pageSize = Math.min(40, Math.max(5, query.pageSize || 12));
  const page = Math.max(1, query.page || 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  try {
    await syncUnread(supabase);
    let request = supabase
      .from("admin_notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: query.sort === "oldest" });
    if (query.kind && isKind(query.kind)) request = request.eq("kind", query.kind);
    const q = (query.q || "").trim();
    if (q) {
      const safe = q.replace(/[%_,]/g, "");
      request = request.or(`title.ilike.%${safe}%,body.ilike.%${safe}%`);
    }
    const { data, error, count } = await request.range(from, to);
    if (error) {
      if (!missingTable(error)) console.error("admin notification list failed", error);
      return {
        items: [] as AdminNotice[],
        total: 0,
        page,
        pageSize,
        missing: missingTable(error),
        blocked: !missingTable(error),
      };
    }
    return {
      items: (data || []).map((row) => mapRow(row as Record<string, unknown>)),
      total: count || 0,
      page,
      pageSize,
      missing: false,
    };
  } catch (error) {
    console.error("admin notification list failed", error);
    return { items: [] as AdminNotice[], total: 0, page, pageSize, missing: false };
  }
}

export async function markAdminNotificationsRead(
  supabase: SupabaseClient,
  input: { ids?: string[]; kind?: string; all?: boolean },
) {
  const stamp = new Date().toISOString();
  try {
    let request = supabase.from("admin_notifications").update({ read_at: stamp }).is("read_at", null);
    if (input.ids?.length) request = request.in("id", input.ids);
    else if (input.kind && isKind(input.kind)) request = request.eq("kind", input.kind);
    else if (!input.all) return { ok: false };
    const { error } = await request;
    if (error && !missingTable(error)) console.error("admin notification read failed", error);
    return { ok: !error };
  } catch (error) {
    console.error("admin notification read failed", error);
    return { ok: false };
  }
}

export async function getAdminNoticePrefs(supabase: SupabaseClient) {
  const fallback = { email: DEFAULT_EMAIL, enabled: true };
  try {
    const { data, error } = await supabase
      .from("admin_notification_prefs")
      .select("email, enabled")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return fallback;
    const email = String(data.email || "").trim();
    return { email: email.includes("@") ? email : DEFAULT_EMAIL, enabled: Boolean(data.enabled) };
  } catch {
    return fallback;
  }
}

export async function saveAdminNoticePrefs(
  supabase: SupabaseClient,
  input: { email?: string; enabled?: boolean },
) {
  const current = await getAdminNoticePrefs(supabase);
  const email = String(input.email ?? current.email).trim().toLowerCase();
  if (!email.includes("@") || email.length > 180) {
    return { ok: false as const, error: "Enter a valid email address." };
  }
  const enabled = input.enabled ?? current.enabled;
  const { error } = await supabase.from("admin_notification_prefs").upsert(
    { id: 1, email, enabled, updated_at: new Date().toISOString() },
    { onConflict: "id" },
  );
  if (error) return { ok: false as const, error: "Could not save the notification email. Run the latest database migration." };
  return { ok: true as const, email, enabled };
}

export async function deleteAdminNotifications(
  supabase: SupabaseClient,
  input: { ids?: string[]; all?: boolean },
) {
  try {
    let request = supabase.from("admin_notifications").delete();
    if (input.ids?.length) request = request.in("id", input.ids);
    else if (input.all) request = request.not("id", "is", null);
    else return { ok: false };
    const { error } = await request;
    if (error && !missingTable(error)) console.error("admin notification delete failed", error);
    return { ok: !error };
  } catch (error) {
    console.error("admin notification delete failed", error);
    return { ok: false };
  }
}

export async function sendAdminNotificationDigest(supabase: SupabaseClient) {
  const prefs = await getAdminNoticePrefs(supabase);
  if (!prefs.enabled || !prefs.email.includes("@")) return { sent: 0, skipped: "disabled" };

  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .is("emailed_at", null)
    .order("created_at", { ascending: true })
    .limit(40);
  if (error || !data?.length) return { sent: 0, skipped: error ? "unavailable" : "empty" };

  const items = data.map((row) => mapRow(row as Record<string, unknown>));
  const site = await getServerSiteSettings();
  const origin = "https://www.princeparfait.com";
  const lines = items
    .map((item) => `• ${item.title}${item.body ? ` — ${item.body}` : ""}`)
    .join("\n");
  const list = items
    .map(
      (item) =>
        `<li style="margin:0 0 10px"><strong>${item.title}</strong>${item.body ? `<br><span style="color:#475569">${item.body}</span>` : ""}</li>`,
    )
    .join("");
  const html = brandEmailHtml(
    {
      eyebrow: "Dashboard",
      title: `${items.length} new item${items.length === 1 ? "" : "s"} on your portfolio`,
      body: "These arrived since the last inbox digest.",
      blocksHtml: `<ul style="margin:18px 0 0;padding:0 0 0 18px">${list}</ul>`,
      ctaLabel: "Open notifications",
      ctaHref: `${origin}/dashboard/notifications`,
      footerNote: "Hourly digest. Already emailed items are not sent again.",
    },
    site,
  );
  const text = brandEmailText(
    {
      title: `${items.length} new portfolio notifications`,
      body: lines,
      ctaLabel: "Open notifications",
      ctaHref: `${origin}/dashboard/notifications`,
    },
    site,
  );

  await sendMail({
    to: prefs.email,
    subject: `${items.length} new portfolio notification${items.length === 1 ? "" : "s"}`,
    html,
    text,
    log: { kind: "admin_notification_digest", relatedType: "admin_notifications" },
  });

  const stamp = new Date().toISOString();
  await supabase
    .from("admin_notifications")
    .update({ emailed_at: stamp })
    .in(
      "id",
      items.map((item) => item.id),
    );
  return { sent: items.length };
}
