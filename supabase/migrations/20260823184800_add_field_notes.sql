create table field_notes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) not null,
  field_id uuid references fields(id) not null,
  title text not null,
  content text not null,
  created_at timestamptz default now()
);

alter table field_notes enable row level security;
create policy "users see own notes" on field_notes for select using (auth.uid() = owner_id);
create policy "users insert own notes" on field_notes for insert with check (auth.uid() = owner_id);
create policy "users update own notes" on field_notes for update using (auth.uid() = owner_id);
create policy "users delete own notes" on field_notes for delete using (auth.uid() = owner_id);
