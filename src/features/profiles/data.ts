import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, ServiceTypeRow } from "@/lib/supabase/types";

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getProfileByUserId(user.id);
}

export async function getProfileBySlug(slug: string): Promise<Profile | null> {
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function getServiceTypesByProfileId(
  profileId: string
): Promise<ServiceTypeRow[]> {
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data;
}

export async function getServiceTypeById(
  profileId: string,
  id: string
): Promise<ServiceTypeRow | null> {
  noStore();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("service_types")
    .select("*")
    .eq("profile_id", profileId)
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data;
}
