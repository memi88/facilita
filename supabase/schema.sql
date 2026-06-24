create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  public_name text not null,
  profession text,
  phone text,
  slug text not null unique,
  calendar_email text,
  google_calendar_id text,
  calendar_connected boolean not null default false,
  calendar_email_is_account_email boolean not null default false,
  legal_consent_version integer not null default 0,
  legal_consent_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_types (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  appointment_type text,
  notes text,
  date date not null,
  time time not null,
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected')
  ),
  rejection_reason text,
  reviewed_at timestamptz,
  reviewed_by text,
  google_event_id text,
  google_event_link text,
  service_type_id uuid references public.service_types(id) on delete set null,
  service_type_name text not null,
  service_type_duration_minutes integer not null,
  cancel_reason text,
  cancelled_at timestamptz,
  cancelled_by text,
  reschedule_reason text,
  rescheduled_at timestamptz,
  rescheduled_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  enabled boolean not null default false,
  slots text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_date_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now()
);

create unique index if not exists availability_rules_profile_day_unique_idx
  on public.availability_rules (profile_id, day_of_week);

create unique index if not exists availability_date_blocks_profile_date_unique_idx
  on public.availability_date_blocks (profile_id, date);

create table if not exists public.booking_notifications (
  id uuid primary key default gen_random_uuid(),
  booking_request_id uuid not null references public.booking_requests(id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('whatsapp')),
  type text not null check (
    type in (
      'booking_created',
      'booking_approved',
      'booking_rejected',
      'booking_reminder_24h'
    )
  ),
  status text not null default 'pending' check (
    status in ('pending', 'sent', 'failed', 'cancelled')
  ),
  recipient_phone text not null,
  scheduled_for timestamptz not null default now(),
  sent_at timestamptz,
  provider_message_id text,
  payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.google_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text not null default '',
  google_email text,
  calendar_id text not null default 'primary',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists booking_requests_status_idx
  on public.booking_requests (status);

create index if not exists booking_requests_date_idx
  on public.booking_requests (date);

create unique index if not exists booking_requests_active_slot_unique_idx
  on public.booking_requests (date, time)
  where status in ('pending', 'approved');

create index if not exists booking_requests_google_event_id_idx
  on public.booking_requests (google_event_id);

create index if not exists booking_requests_service_type_idx
  on public.booking_requests (service_type_id);

create index if not exists booking_notifications_status_schedule_idx
  on public.booking_notifications (status, scheduled_for);

create index if not exists booking_notifications_booking_request_idx
  on public.booking_notifications (booking_request_id);

create unique index if not exists booking_notifications_unique_pending_type_idx
  on public.booking_notifications (booking_request_id, type)
  where status in ('pending', 'sent');

create index if not exists service_types_profile_sort_idx
  on public.service_types (profile_id, sort_order);

create unique index if not exists google_calendar_connections_profile_calendar_unique_idx
  on public.google_calendar_connections (profile_id, calendar_id);

create unique index if not exists google_calendar_connections_profile_primary_unique_idx
  on public.google_calendar_connections (profile_id)
  where is_primary;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists booking_requests_set_updated_at on public.booking_requests;

create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists availability_rules_set_updated_at on public.availability_rules;

create trigger availability_rules_set_updated_at
before update on public.availability_rules
for each row
execute function public.set_updated_at();

drop trigger if exists booking_notifications_set_updated_at on public.booking_notifications;

create trigger booking_notifications_set_updated_at
before update on public.booking_notifications
for each row
execute function public.set_updated_at();

drop trigger if exists google_calendar_connections_set_updated_at
  on public.google_calendar_connections;

create trigger google_calendar_connections_set_updated_at
before update on public.google_calendar_connections
for each row
execute function public.set_updated_at();

drop trigger if exists service_types_set_updated_at on public.service_types;

create trigger service_types_set_updated_at
before update on public.service_types
for each row
execute function public.set_updated_at();

alter table public.booking_requests enable row level security;
alter table public.profiles enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_date_blocks enable row level security;
alter table public.booking_notifications enable row level security;
alter table public.google_calendar_connections enable row level security;
alter table public.service_types enable row level security;

create policy "Allow public booking inserts"
on public.booking_requests
for insert
to anon
with check (status = 'pending');

-- Admin reads and updates are performed with SUPABASE_SERVICE_ROLE_KEY on the server.

insert into public.service_types (profile_id, name, description, duration_minutes, sort_order)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Consulta inicial',
    'Atendimento padrão criado automaticamente para a agenda.',
    60,
    0
  )
on conflict do nothing;

insert into public.profiles (
  id,
  user_id,
  name,
  public_name,
  phone,
  slug,
  calendar_email_is_account_email
)
values (
  '00000000-0000-0000-0000-000000000001',
  null,
  'Agenda principal',
  'Agenda principal',
  null,
  'agenda-principal',
  false
)
on conflict (id) do nothing;

insert into public.availability_rules (day_of_week, enabled, slots)
values
  (0, false, '{}'),
  (1, true, '{"09:00","10:30","14:00","15:30","17:00"}'),
  (2, true, '{"09:00","10:30","14:00","15:30","17:00"}'),
  (3, true, '{"09:00","10:30","14:00","15:30","17:00"}'),
  (4, true, '{"09:00","10:30","14:00","15:30","17:00"}'),
  (5, true, '{"09:00","10:30","14:00","15:30","17:00"}'),
  (6, true, '{"09:00","10:30","12:00"}')
on conflict (day_of_week) do nothing;
