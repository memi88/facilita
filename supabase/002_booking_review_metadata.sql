alter table public.booking_requests
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by text,
  add column if not exists rejection_reason text;

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

create index if not exists booking_requests_reviewed_at_idx
  on public.booking_requests (reviewed_at);
