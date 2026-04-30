import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGoogleAuthorizationUrl } from "@/features/calendar/google-oauth";
import { getProfileByUserId } from "@/features/profiles/data";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login?next=/admin/perfil", getSiteUrl()));
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return NextResponse.redirect(new URL("/admin/perfil", getSiteUrl()));
  }

  const state = randomBytes(24).toString("hex");
  const authorizationUrl = buildGoogleAuthorizationUrl(
    `${state}:${profile.id}`,
    profile.calendar_email || user.email
  );
  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set("google_calendar_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60
  });

  return response;
}
