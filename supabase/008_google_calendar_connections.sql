create table if not exists public.google_calendar_connections (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  google_email text,
  calendar_id text not null default 'primary',
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists google_calendar_connections_set_updated_at
  on public.google_calendar_connections;

create trigger google_calendar_connections_set_updated_at
before update on public.google_calendar_connections
for each row
execute function public.set_updated_at();

alter table public.google_calendar_connections enable row level security;
