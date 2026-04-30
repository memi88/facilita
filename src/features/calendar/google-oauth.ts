import { getSiteUrl } from "@/lib/site-url";

export const googleCalendarScopes = [
  "https://www.googleapis.com/auth/calendar.freebusy",
  "https://www.googleapis.com/auth/calendar.events"
];

export function getGoogleRedirectUri() {
  return `${getSiteUrl()}/api/google-calendar/callback`;
}

export function assertGoogleOAuthConfig() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.");
  }
}

export function buildGoogleAuthorizationUrl(state: string, loginHint?: string | null) {
  assertGoogleOAuthConfig();

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
    scope: googleCalendarScopes.join(" "),
    state
  });

  if (loginHint) {
    params.set("login_hint", loginHint);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string) {
  assertGoogleOAuthConfig();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error("Could not exchange Google authorization code.");
  }

  return (await response.json()) as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope?: string;
  };
}

export async function refreshGoogleAccessToken(refreshToken: string) {
  assertGoogleOAuthConfig();

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });

  if (!response.ok) {
    throw new Error("Could not refresh Google access token.");
  }

  return (await response.json()) as {
    access_token: string;
    expires_in: number;
    scope?: string;
  };
}

export async function getGoogleUserEmail(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { email?: string };
  return data.email ?? null;
}
