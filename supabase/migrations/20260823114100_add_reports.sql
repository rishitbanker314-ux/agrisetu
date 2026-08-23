create table reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  title text not null,
  type text not null,
  date text not null,
  size text not null,
  created_at timestamptz default now()
);

-- Row Level Security: users see only their own reports.
alter table reports enable row level security;
create policy "users see own reports" on reports for select using (auth.uid() = owner_id);
create policy "users can insert own reports" on reports for insert with check (auth.uid() = owner_id);

-- Add insert policies for fields
create policy "users can insert own fields" on fields for insert with check (auth.uid() = owner_id);
create policy "users can update own fields" on fields for update using (auth.uid() = owner_id);

-- Add update policies for profiles
alter table profiles enable row level security;
create policy "users see own profiles" on profiles for select using (auth.uid() = id);
create policy "users can update own profiles" on profiles for update using (auth.uid() = id);
create policy "users can insert own profiles" on profiles for insert with check (auth.uid() = id);

-- Add missing columns to fields table to match UI
alter table fields add column name text;
alter table fields add column crop text;
alter table fields add column area text;
alter table fields add column status text default 'Healthy';
