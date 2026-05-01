alter table public.booking_requests
  add column if not exists google_event_id text,
  add column if not exists google_event_link text;

create index if not exists booking_requests_google_event_id_idx
  on public.booking_requests (google_event_id);
