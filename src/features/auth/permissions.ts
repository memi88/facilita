export function isAllowedAdminEmail(email?: string | null) {
  const allowedEmails = process.env.ADMIN_EMAILS?.split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails?.length) {
    return true;
  }

  return Boolean(email && allowedEmails.includes(email.toLowerCase()));
}
