alter table public.google_calendar_connections
  add column if not exists label text not null default '';

alter table public.google_calendar_connections
  drop constraint if exists google_calendar_connections_profile_id_key;

update public.google_calendar_connections
set label = case
  when label is not null and label <> '' then label
  when is_primary then 'Agenda principal'
  else coalesce(google_email, calendar_id, 'Agenda conectada')
end;

create unique index if not exists google_calendar_connections_profile_calendar_unique_idx
  on public.google_calendar_connections (profile_id, calendar_id);

create unique index if not exists google_calendar_connections_profile_primary_unique_idx
  on public.google_calendar_connections (profile_id)
  where is_primary;
