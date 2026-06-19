export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getPublicBookingUrl(slug: string, serviceTypeId?: string) {
  const url = new URL(`/agendar/${slug}`, getSiteUrl());

  if (serviceTypeId) {
    url.searchParams.set("serviceTypeId", serviceTypeId);
  }

  return url.toString();
}
