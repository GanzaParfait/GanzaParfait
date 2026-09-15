import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function createServerSupabase(useServiceRole = true) {
  if (!supabaseUrl || !(useServiceRole && serviceRoleKey ? serviceRoleKey : anonKey)) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and keys.");
  }
  const key = useServiceRole && serviceRoleKey ? serviceRoleKey : anonKey;
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function hasServiceRoleKey(): boolean {
  return Boolean(serviceRoleKey);
}
