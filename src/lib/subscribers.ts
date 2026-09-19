import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriberSource = "widget" | "footer" | "contact" | "import" | "dashboard" | "cv";

export type SubscriberRow = {
  id: string;
  email: string;
  name: string | null;
  confirmed: boolean;
  source: string | null;
  location: string | null;
  country: string | null;
  device: string | null;
  created_at: string;
  updated_at?: string;
  unsubscribed_at?: string | null;
};

/**
 * Upsert by email.
 * - contact capture: insert unconfirmed; never downgrade an already-confirmed row
 * - widget/dashboard confirm: set confirmed true and clear soft-unsubscribe
 * - rows are never deleted here
 */
export async function upsertSubscriber(
  supabase: SupabaseClient,
  input: {
    email: string;
    name?: string | null;
    source: SubscriberSource;
    confirmed: boolean;
    device?: string | null;
    location?: string | null;
    country?: string | null;
  },
): Promise<{ row: SubscriberRow | null; created: boolean; alreadyConfirmed: boolean }> {
  const email = input.email.trim().toLowerCase();
  const { data: existing } = await supabase
    .from("subscribers")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  if (existing) {
    const alreadyConfirmed = Boolean(existing.confirmed) && !existing.unsubscribed_at;
    const nextConfirmed = Boolean(existing.confirmed) || input.confirmed;
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      confirmed: nextConfirmed,
    };
    // Re-subscribe clears soft opt-out
    if (input.confirmed) patch.unsubscribed_at = null;
    if (input.name && !existing.name) patch.name = input.name;
    if (input.source && !existing.source) patch.source = input.source;
    if (input.device) patch.device = input.device;
    if (input.location) patch.location = input.location;
    if (input.country) patch.country = input.country;

    const { data, error } = await supabase
      .from("subscribers")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) throw error;
    return { row: data as SubscriberRow, created: false, alreadyConfirmed };
  }

  const { data, error } = await supabase
    .from("subscribers")
    .insert([
      {
        email,
        name: input.name || null,
        source: input.source,
        confirmed: input.confirmed,
        device: input.device || null,
        location: input.location || null,
        country: input.country || null,
        unsubscribed_at: null,
      },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return { row: data as SubscriberRow, created: true, alreadyConfirmed: false };
}

/** Soft unsubscribe — never deletes the row. */
export async function softUnsubscribe(
  supabase: SupabaseClient,
  email: string,
): Promise<{ row: SubscriberRow | null; alreadyUnsubscribed: boolean }> {
  const normalized = email.trim().toLowerCase();
  const { data: existing } = await supabase
    .from("subscribers")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();

  if (!existing) return { row: null, alreadyUnsubscribed: false };
  if (existing.unsubscribed_at) {
    return { row: existing as SubscriberRow, alreadyUnsubscribed: true };
  }

  const { data, error } = await supabase
    .from("subscribers")
    .update({
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .select("*")
    .single();

  if (error) throw error;
  return { row: data as SubscriberRow, alreadyUnsubscribed: false };
}

/** Soft-unsubscribe many ids (admin). Never deletes. */
export async function softUnsubscribeByIds(supabase: SupabaseClient, ids: string[]) {
  if (!ids.length) return 0;
  const { data, error } = await supabase
    .from("subscribers")
    .update({
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .is("unsubscribed_at", null)
    .select("id");

  if (error) throw error;
  return data?.length || 0;
}
