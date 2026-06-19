import { addSeconds } from "date-fns";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  exchangeGoogleCode,
  getGoogleUserEmail
} from "@/features/calendar/google-oauth";
import { getProfileByUserId } from "@/features/profiles/data";
import { getSiteUrl } from "@/lib/site-url";
import { getSafeInternalPath } from "@/lib/navigation";

function redirectToPath(path: string, params?: Record<string, string>) {
  const url = new URL(getSafeInternalPath(path, "/admin/perfil?tab=agendas"), getSiteUrl());

  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("google_calendar_oauth_state")?.value;

  if (!code || !state || !savedState) {
    return redirectToPath("/admin/perfil?tab=agendas", { calendar: "missing_oauth_data" });
  }

  const [stateToken, encodedPayload] = state.split(".");

  if (stateToken !== savedState || !encodedPayload) {
    return redirectToPath("/admin/perfil?tab=agendas", { calendar: "invalid_state" });
  }

  let payload: {
    profileId: string;
    returnTo: string;
    label: string;
    email: string | null;
    calendarId: string;
    isPrimary: boolean;
  };

  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    return redirectToPath("/admin/perfil?tab=agendas", { calendar: "invalid_state" });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(
        `/login?next=${encodeURIComponent(getSafeInternalPath(payload?.returnTo ?? "/admin/perfil?tab=agendas", "/admin/perfil?tab=agendas"))}`,
        getSiteUrl()
      )
    );
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile || profile.id !== payload.profileId) {
    return redirectToPath(payload.returnTo, { calendar: "profile_mismatch" });
  }

  try {
    const token = await exchangeGoogleCode(code);
    const googleEmail = await getGoogleUserEmail(token.access_token);
    const adminSupabase = createSupabaseAdminClient();
    const { data: existingConnection } = await adminSupabase
      .from("google_calendar_connections")
      .select("refresh_token")
      .eq("profile_id", profile.id)
      .eq("calendar_id", payload.calendarId || "primary")
      .maybeSingle();

    if (payload.isPrimary) {
      await adminSupabase
        .from("google_calendar_connections")
        .update({ is_primary: false })
        .eq("profile_id", profile.id);
    }

    await adminSupabase.from("google_calendar_connections").upsert(
      {
        profile_id: profile.id,
        label: payload.label,
        google_email: googleEmail,
        calendar_id: payload.calendarId || "primary",
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? existingConnection?.refresh_token ?? null,
        token_expires_at: addSeconds(new Date(), token.expires_in).toISOString(),
        scope: token.scope ?? null,
        is_primary: payload.isPrimary
      },
      { onConflict: "profile_id,calendar_id" }
    );

    const { data: remainingConnections } = await adminSupabase
      .from("google_calendar_connections")
      .select("id")
      .eq("profile_id", profile.id)
      .limit(1);

    await adminSupabase
      .from("profiles")
      .update({
        calendar_connected: Boolean(remainingConnections?.length),
        calendar_email: profile.calendar_email_is_account_email
          ? profile.calendar_email ?? user.email
          : googleEmail ?? profile.calendar_email,
        google_calendar_id: payload.calendarId || "primary"
      })
      .eq("id", profile.id);

    const response = redirectToPath(payload.returnTo, { calendar: "connected" });
    response.cookies.delete("google_calendar_oauth_state");
    return response;
  } catch (error) {
    console.error("[google-calendar] OAuth callback failed", error);
    return redirectToPath(payload.returnTo, { calendar: "failed" });
  }
}
