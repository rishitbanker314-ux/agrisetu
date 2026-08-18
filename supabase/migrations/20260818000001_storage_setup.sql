-- Create the crop_photos storage bucket
insert into storage.buckets (id, name, public) 
values ('crop_photos', 'crop_photos', true)
on conflict (id) do nothing;

-- Allow public anonymous uploads to the crop_photos bucket
create policy "Allow public uploads" on storage.objects 
for insert to public with check (bucket_id = 'crop_photos');

-- Allow public reads from the crop_photos bucket
create policy "Allow public reads" on storage.objects 
for select to public using (bucket_id = 'crop_photos');
