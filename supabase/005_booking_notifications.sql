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

create index if not exists booking_notifications_status_schedule_idx
  on public.booking_notifications (status, scheduled_for);

create index if not exists booking_notifications_booking_request_idx
  on public.booking_notifications (booking_request_id);

create unique index if not exists booking_notifications_unique_pending_type_idx
  on public.booking_notifications (booking_request_id, type)
  where status in ('pending', 'sent');

drop trigger if exists booking_notifications_set_updated_at on public.booking_notifications;

create trigger booking_notifications_set_updated_at
before update on public.booking_notifications
for each row
execute function public.set_updated_at();

alter table public.booking_notifications enable row level security;
