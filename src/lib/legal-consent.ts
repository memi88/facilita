import type { Profile } from "@/lib/supabase/types";

export const CURRENT_LEGAL_CONSENT_VERSION = 1;

export function needsLegalConsent(profile: Pick<Profile, "legal_consent_version"> | null) {
  return (profile?.legal_consent_version ?? 0) < CURRENT_LEGAL_CONSENT_VERSION;
}

export function getLegalConsentRedirectPath(nextPath = "/admin") {
  return `/consentimento?next=${encodeURIComponent(nextPath)}`;
}
