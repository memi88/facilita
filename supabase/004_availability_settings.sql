create table if not exists public.availability_rules (
  day_of_week integer primary key check (day_of_week between 0 and 6),
  enabled boolean not null default false,
  slots text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.availability_date_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  reason text,
  created_at timestamptz not null default now()
);

drop trigger if exists availability_rules_set_updated_at on public.availability_rules;

create trigger availability_rules_set_updated_at
before update on public.availability_rules
for each row
execute function public.set_updated_at();

alter table public.availability_rules enable row level security;
alter table public.availability_date_blocks enable row level security;

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
