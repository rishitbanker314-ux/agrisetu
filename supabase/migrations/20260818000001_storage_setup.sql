-- Create the crop_photos storage bucket
insert into storage.buckets (id, name, public) 
values ('crop_photos', 'crop_photos', true)
on conflict (id) do nothing;

-- Enable RLS on the storage.objects table if not already enabled
alter table storage.objects enable row level security;

-- Allow public anonymous uploads to the crop_photos bucket
create policy "Allow public uploads" on storage.objects 
for insert to public with check (bucket_id = 'crop_photos');

-- Allow public reads from the crop_photos bucket
create policy "Allow public reads" on storage.objects 
for select to public using (bucket_id = 'crop_photos');
