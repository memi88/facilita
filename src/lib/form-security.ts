export const MIN_FORM_FILL_TIME_MS = 1200;

export function getSubmissionAgeMs(submittedAt: FormDataEntryValue | null) {
  if (typeof submittedAt !== "string") {
    return null;
  }

  const parsed = Date.parse(submittedAt);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return Date.now() - parsed;
}

export function isLikelyAutomatedSubmission(options: {
  honeypot: FormDataEntryValue | null;
  submittedAt: FormDataEntryValue | null;
}) {
  if (typeof options.honeypot === "string" && options.honeypot.trim()) {
    return true;
  }

  const ageMs = getSubmissionAgeMs(options.submittedAt);

  if (ageMs === null) {
    return true;
  }

  return ageMs < MIN_FORM_FILL_TIME_MS;
}
