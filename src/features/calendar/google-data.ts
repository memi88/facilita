import { addSeconds, isBefore, parseISO } from "date-fns";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { GoogleCalendarConnection } from "@/lib/supabase/types";
import { refreshGoogleAccessToken } from "./google-oauth";

export async function getGoogleCalendarConnection(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("google_calendar_connections")
    .select("*")
    .eq("profile_id", profileId)
    .eq("is_primary", true)
    .single();

  if (error) {
    const fallback = await supabase
      .from("google_calendar_connections")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    return fallback.error ? null : fallback.data;
  }

  return data;
}

export async function getGoogleCalendarConnections(profileId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("google_calendar_connections")
    .select("*")
    .eq("profile_id", profileId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    return [];
  }

  return data as GoogleCalendarConnection[];
}

export async function getValidGoogleAccessToken(
  connection: GoogleCalendarConnection
) {
  const expiresAt = connection.token_expires_at
    ? parseISO(connection.token_expires_at)
    : null;

  if (
    connection.access_token &&
    expiresAt &&
    isBefore(addSeconds(new Date(), 60), expiresAt)
  ) {
    return connection.access_token;
  }

  if (!connection.refresh_token) {
    return connection.access_token;
  }

  const refreshed = await refreshGoogleAccessToken(connection.refresh_token);
  const tokenExpiresAt = addSeconds(new Date(), refreshed.expires_in).toISOString();
  const supabase = createSupabaseAdminClient();

  await supabase
    .from("google_calendar_connections")
    .update({
      access_token: refreshed.access_token,
      token_expires_at: tokenExpiresAt,
      scope: refreshed.scope ?? connection.scope
    })
    .eq("id", connection.id);

  return refreshed.access_token;
}
