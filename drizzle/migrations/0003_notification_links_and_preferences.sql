alter table public.notifications
  add column if not exists entity_type text,
  add column if not exists entity_id text,
  add column if not exists link text;

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mission_in_app boolean not null default true,
  mission_email boolean not null default true,
  message_in_app boolean not null default true,
  message_email boolean not null default true,
  candidature_in_app boolean not null default true,
  candidature_email boolean not null default true,
  digest_frequency text not null default 'instant',
  updated_at timestamptz not null default now(),
  constraint notification_preferences_digest_check check (digest_frequency in ('instant','daily','weekly','never'))
);

grant select, insert, update, delete on public.notification_preferences to authenticated;
grant all on public.notification_preferences to service_role;

alter table public.notification_preferences enable row level security;

create policy "own notification preferences select" on public.notification_preferences
  for select to authenticated using (auth.uid() = user_id);
create policy "own notification preferences insert" on public.notification_preferences
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own notification preferences update" on public.notification_preferences
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own notification preferences delete" on public.notification_preferences
  for delete to authenticated using (auth.uid() = user_id);