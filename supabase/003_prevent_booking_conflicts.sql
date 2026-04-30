create unique index if not exists booking_requests_active_slot_unique_idx
  on public.booking_requests (date, time)
  where status in ('pending', 'approved');
