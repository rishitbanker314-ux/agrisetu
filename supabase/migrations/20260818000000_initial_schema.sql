create table profiles (
  id uuid references auth.users primary key,
  role text check (role in ('farmer','policymaker')),
  name text, phone text, preferred_language text, country text, region text
);

create table fields (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id),
  country text, lat float8, lng float8,
  crop_history jsonb default '[]',
  created_at timestamptz default now()
);

create table health_profiles (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  ndvi float8, soil_properties jsonb, weather_forecast jsonb,
  generated_at timestamptz default now()
);

create table advisories (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  profile_id uuid references health_profiles(id),
  recommendation_text text, language text, voice_url text,
  created_at timestamptz default now()
);

create table diagnoses (
  id uuid primary key default gen_random_uuid(),
  field_id uuid references fields(id),
  image_url text, disease_label text, confidence float8, treatment_advice text,
  created_at timestamptz default now()
);

-- Row Level Security: farmers see only their own fields.
alter table fields enable row level security;
create policy "farmers see own fields" on fields for select using (auth.uid() = owner_id);

-- Replaces BigQuery for the policymaker dashboard
create materialized view regional_trends as
select country, region, avg(ndvi) as avg_ndvi, count(*) as request_volume
from health_profiles hp join fields f on hp.field_id = f.id
group by country, region;
