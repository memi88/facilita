alter table public.profiles
  add column if not exists calendar_email_is_account_email boolean not null default false;

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

alter table public.booking_requests
  add column if not exists service_type_id uuid references public.service_types(id) on delete set null,
  add column if not exists service_type_name text,
  add column if not exists service_type_duration_minutes integer,
  add column if not exists cancel_reason text,
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by text,
  add column if not exists reschedule_reason text,
  add column if not exists rescheduled_at timestamptz,
  add column if not exists rescheduled_by text;

update public.booking_requests
set service_type_name = coalesce(service_type_name, appointment_type, 'Consulta'),
    service_type_duration_minutes = coalesce(service_type_duration_minutes, 60)
where service_type_name is null
   or service_type_duration_minutes is null;

alter table public.booking_requests
  alter column service_type_name set not null,
  alter column service_type_duration_minutes set not null;

alter table public.google_calendar_connections
  add column if not exists is_primary boolean not null default false;

drop trigger if exists service_types_set_updated_at on public.service_types;
create trigger service_types_set_updated_at
before update on public.service_types
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists booking_requests_set_updated_at on public.booking_requests;
create trigger booking_requests_set_updated_at
before update on public.booking_requests
for each row
execute function public.set_updated_at();
