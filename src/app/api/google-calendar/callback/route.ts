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

function redirectToProfile(params?: Record<string, string>) {
  const url = new URL("/admin/perfil", getSiteUrl());

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
    return redirectToProfile({ calendar: "missing_oauth_data" });
  }

  const [stateToken, profileId] = state.split(":");

  if (stateToken !== savedState || !profileId) {
    return redirectToProfile({ calendar: "invalid_state" });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/admin/perfil", getSiteUrl()));
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile || profile.id !== profileId) {
    return redirectToProfile({ calendar: "profile_mismatch" });
  }

  try {
    const token = await exchangeGoogleCode(code);
    const googleEmail = await getGoogleUserEmail(token.access_token);
    const adminSupabase = createSupabaseAdminClient();
    const { data: existingConnection } = await adminSupabase
      .from("google_calendar_connections")
      .select("refresh_token")
      .eq("profile_id", profile.id)
      .single();

    await adminSupabase.from("google_calendar_connections").upsert(
      {
        profile_id: profile.id,
        google_email: googleEmail,
        calendar_id: profile.google_calendar_id || "primary",
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? existingConnection?.refresh_token ?? null,
        token_expires_at: addSeconds(new Date(), token.expires_in).toISOString(),
        scope: token.scope ?? null
      },
      { onConflict: "profile_id" }
    );

    await adminSupabase
      .from("profiles")
      .update({
        calendar_connected: true,
        calendar_email: googleEmail ?? profile.calendar_email,
        google_calendar_id: profile.google_calendar_id || "primary"
      })
      .eq("id", profile.id);

    const response = redirectToProfile({ calendar: "connected" });
    response.cookies.delete("google_calendar_oauth_state");
    return response;
  } catch (error) {
    console.error("[google-calendar] OAuth callback failed", error);
    return redirectToProfile({ calendar: "failed" });
  }
}
