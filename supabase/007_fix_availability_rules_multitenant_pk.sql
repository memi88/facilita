alter table public.availability_rules
  add column if not exists id uuid default gen_random_uuid();

update public.availability_rules
set id = gen_random_uuid()
where id is null;

alter table public.availability_rules
  alter column id set not null;

alter table public.availability_rules
  drop constraint if exists availability_rules_pkey;

alter table public.availability_rules
  add constraint availability_rules_pkey primary key (id);

create unique index if not exists availability_rules_profile_day_unique_idx
  on public.availability_rules (profile_id, day_of_week);
