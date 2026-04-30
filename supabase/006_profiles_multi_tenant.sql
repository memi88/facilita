create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  public_name text not null,
  phone text,
  slug text not null unique,
  calendar_email text,
  google_calendar_id text,
  calendar_connected boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.profiles (
  id,
  user_id,
  name,
  public_name,
  phone,
  slug
)
values (
  '00000000-0000-0000-0000-000000000001',
  null,
  'Agenda principal',
  'Agenda principal',
  null,
  'agenda-principal'
)
on conflict (id) do nothing;

alter table public.booking_requests
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade;

alter table public.availability_rules
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade;

alter table public.availability_date_blocks
  add column if not exists profile_id uuid references public.profiles(id) on delete cascade;

update public.booking_requests
set profile_id = '00000000-0000-0000-0000-000000000001'
where profile_id is null;

update public.availability_rules
set profile_id = '00000000-0000-0000-0000-000000000001'
where profile_id is null;

update public.availability_date_blocks
set profile_id = '00000000-0000-0000-0000-000000000001'
where profile_id is null;

alter table public.booking_requests
  alter column profile_id set not null;

alter table public.availability_rules
  alter column profile_id set not null;

alter table public.availability_date_blocks
  alter column profile_id set not null;

drop index if exists booking_requests_active_slot_unique_idx;

create unique index if not exists booking_requests_active_slot_unique_idx
  on public.booking_requests (profile_id, date, time)
  where status in ('pending', 'approved');

drop index if exists booking_notifications_unique_pending_type_idx;

create unique index if not exists booking_notifications_unique_pending_type_idx
  on public.booking_notifications (booking_request_id, type)
  where status in ('pending', 'sent');

create unique index if not exists availability_rules_profile_day_unique_idx
  on public.availability_rules (profile_id, day_of_week);

alter table public.availability_date_blocks
  drop constraint if exists availability_date_blocks_date_key;

create unique index if not exists availability_date_blocks_profile_date_unique_idx
  on public.availability_date_blocks (profile_id, date);

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
