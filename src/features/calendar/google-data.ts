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
    .single();

  if (error) {
    return null;
  }

  return data;
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
