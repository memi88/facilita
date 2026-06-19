import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildGoogleAuthorizationUrl } from "@/features/calendar/google-oauth";
import { getProfileByUserId } from "@/features/profiles/data";
import { getSiteUrl } from "@/lib/site-url";
import { getSafeInternalPath } from "@/lib/navigation";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedLabel = requestUrl.searchParams.get("label")?.trim() || "";
  const requestedEmail = requestUrl.searchParams.get("email")?.trim() || "";
  const requestedCalendarId =
    requestUrl.searchParams.get("calendarId")?.trim() || "primary";
  const requestedReturnTo = getSafeInternalPath(
    requestUrl.searchParams.get("returnTo"),
    "/admin/perfil?tab=agendas"
  );
  const requestedIsPrimary =
    requestUrl.searchParams.get("primary") === "1" ||
    requestUrl.searchParams.get("primary") === "true";

  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(requestedReturnTo)}`, getSiteUrl())
    );
  }

  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    return NextResponse.redirect(new URL("/admin/perfil", getSiteUrl()));
  }

  const stateToken = randomBytes(24).toString("hex");
  const statePayload = Buffer.from(
    JSON.stringify({
      profileId: profile.id,
      returnTo: requestedReturnTo,
      label:
        requestedLabel ||
        (requestedCalendarId === "primary" ? "Agenda principal" : "Agenda conectada"),
      email: requestedEmail || profile.calendar_email || user.email || null,
      calendarId: requestedCalendarId,
      isPrimary: requestedIsPrimary || requestedCalendarId === "primary"
    })
  ).toString("base64url");
  const loginHint = requestedEmail || profile.calendar_email || user.email;
  const authorizationUrl = buildGoogleAuthorizationUrl(
    `${stateToken}.${statePayload}`,
    loginHint
  );
  const response = NextResponse.redirect(authorizationUrl);

  response.cookies.set("google_calendar_oauth_state", stateToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60
  });

  return response;
}
