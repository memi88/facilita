import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.error("[DEBUG] supabaseUrl exists:", !!supabaseUrl);
  console.error("[DEBUG] serviceRoleKey exists:", !!serviceRoleKey);
  console.error("[DEBUG] all env keys with SUPABASE:", Object.keys(process.env).filter(k => k.includes("SUPABASE")));

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
