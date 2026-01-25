-- Create a new private bucket 'resumes'
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Allow authenticated users to upload files to their own folder (user_id/*)
create policy "Authenticated users can upload resumes"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text );

-- Allow users to view their own resumes
create policy "Users can view own resumes"
on storage.objects for select
to authenticated
using ( bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text );

-- Allow users to update their own resumes
create policy "Users can update own resumes"
on storage.objects for update
to authenticated
using ( bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text );

-- Allow users to delete their own resumes
create policy "Users can delete own resumes"
on storage.objects for delete
to authenticated
using ( bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text );
