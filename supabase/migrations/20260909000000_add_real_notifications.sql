create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  is_hidden boolean default false not null,
  created_at timestamptz default now() not null
);

alter table notifications enable row level security;
create policy "users can view their own notifications" on notifications for select using (auth.uid() = user_id);
create policy "users can insert their own notifications" on notifications for insert with check (auth.uid() = user_id);
create policy "users can update their own notifications" on notifications for update using (auth.uid() = user_id);
create policy "users can delete their own notifications" on notifications for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table notifications;

alter table profiles
add column app_notifications boolean default true not null;
