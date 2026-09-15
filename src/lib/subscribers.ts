import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriberSource = "widget" | "contact" | "import" | "dashboard";

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
};

/**
 * Upsert by email.
 * - contact capture: insert unconfirmed; never downgrade an already-confirmed row
 * - widget/dashboard confirm: set confirmed true
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
    const alreadyConfirmed = Boolean(existing.confirmed);
    const nextConfirmed = alreadyConfirmed || input.confirmed;
    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      confirmed: nextConfirmed,
    };
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
      },
    ])
    .select("*")
    .single();

  if (error) throw error;
  return { row: data as SubscriberRow, created: true, alreadyConfirmed: false };
}
