# Deploy Checklist

## Vercel

Configure these environment variables in the Vercel project:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAILS=admin@example.com
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
```

Optional for local/provider testing:

```bash
MOCK_CALENDAR_BUSY_SLOTS=2026-05-01@09:00,2026-05-02@14:00
```

Do not expose `SUPABASE_SERVICE_ROLE_KEY` in client code. It is only used inside server actions and server components.

## Supabase Database

For a new database, run:

```sql
-- supabase/schema.sql
```

For the current incremental setup, run migrations in this order:

```text
supabase/002_booking_review_metadata.sql
supabase/003_prevent_booking_conflicts.sql
supabase/004_availability_settings.sql
supabase/005_booking_notifications.sql
supabase/006_profiles_multi_tenant.sql
supabase/007_fix_availability_rules_multitenant_pk.sql
```

## Supabase Auth

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://your-domain.com`
- Redirect URLs:
  - `https://your-domain.com/login`
  - `https://your-domain.com/admin`
  - `https://your-domain.com/admin/perfil`
  - `https://your-domain.com/cadastro`
  - `http://localhost:3000/**`

## Smoke Test

1. Open `/cadastro` and create a professional account.
2. Confirm `/admin/perfil` has the public booking URL.
3. Configure availability in `/admin`.
4. Open `/agendar/[slug]` in an incognito window.
5. Submit a booking request.
6. Confirm it appears in `/admin`.
7. Approve/reject and verify notifications are enqueued.

## Google Calendar OAuth

In Google Cloud Console:

1. Enable Google Calendar API.
2. Configure OAuth consent screen.
3. Create OAuth Client ID for a Web application.
4. Add this Authorized redirect URI:

```text
https://your-domain.com/api/google-calendar/callback
```

For local development, also add:

```text
http://localhost:3000/api/google-calendar/callback
```

The app requests these scopes:

```text
https://www.googleapis.com/auth/calendar.freebusy
https://www.googleapis.com/auth/calendar.events
```

## Before Real Users

- Set `ADMIN_EMAILS` intentionally.
- Remove test/mock `MOCK_CALENDAR_BUSY_SLOTS` if not needed.
- Confirm every professional has a `profiles` row.
- Keep Google Calendar and WhatsApp providers in mock mode until credentials and costs are approved.
