# Facilita

Next.js 14 App Router application for booking requests with mocked availability and Supabase persistence.

## Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase database/auth-ready setup
- Server actions for mutations

## Routes

- `/agendar`: redirects to the default public booking page.
- `/agendar/[slug]`: public booking page for a professional profile.
- `/admin`: protected booking request review page with approve/reject actions.
- `/login`: administrative login with Supabase Auth e-mail/password.
- `/cadastro`: professional sign-up and public agenda creation.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and fill the Supabase values.

3. Run `supabase/schema.sql` in the Supabase SQL editor for a new database.

   If your table already exists from an earlier version, run the incremental migrations in order:

   - `supabase/002_booking_review_metadata.sql`
   - `supabase/003_prevent_booking_conflicts.sql`
   - `supabase/004_availability_settings.sql`
   - `supabase/005_booking_notifications.sql`
   - `supabase/006_profiles_multi_tenant.sql`
   - `supabase/007_fix_availability_rules_multitenant_pk.sql`
   - `supabase/011_service_types_and_profile_email.sql`
   - `supabase/012_multi_google_calendar_connections.sql`

4. Create a professional account from `/cadastro` or directly in Supabase Auth.

5. Start the app:

```bash
npm run dev
```

## Deploy

See `docs/deploy.md` for the AWS Amplify, Supabase, and Google Calendar production checklist.

## Notes

- Availability comes from each professional profile settings, internal bookings, manual blocks, and the calendar provider abstraction.
- Booking writes and status updates use server actions in `src/features/booking/actions.ts`.
- Admin reviews store `reviewed_at`, `reviewed_by`, and `rejection_reason`.
- Pending and approved requests block the same date/time from being selected again.
- Admins can configure active weekdays, slots by weekday, and blocked dates.
- Each professional profile has its own public booking link and isolated admin data.
- Booking events enqueue mock WhatsApp notifications for received, approved, rejected, and 24h reminder messages.
- Calendar availability is abstracted behind a provider. The current provider is mock-only and can block slots using `MOCK_CALENDAR_BUSY_SLOTS`.
- Google Calendar OAuth can be connected per professional profile from `/admin/perfil`.
- The code keeps calendar availability separate from persistence so Google Calendar can be added later without changing the page flow.
- `/admin` is protected by Supabase Auth middleware.
