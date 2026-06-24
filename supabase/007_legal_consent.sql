alter table public.profiles
  add column if not exists legal_consent_version integer not null default 0;

alter table public.profiles
  add column if not exists legal_consent_accepted_at timestamptz;
