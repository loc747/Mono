-- Image uploads (run after schema.sql). Safe to re-run.
-- Files live in the public "uploads" bucket:
--   looks/<user id>/<random>.png   -> any signed-in user, only into their own folder
--   studies/<random>.png           -> admins only

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('uploads', 'uploads', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists uploads_insert_own_look on storage.objects;
create policy uploads_insert_own_look on storage.objects for insert to authenticated
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = 'looks'
    and (storage.foldername(name))[2] = (select auth.uid()::text)
  );

drop policy if exists uploads_admin_all on storage.objects;
create policy uploads_admin_all on storage.objects for all to authenticated
  using (bucket_id = 'uploads' and public.is_admin())
  with check (bucket_id = 'uploads' and public.is_admin());

-- Look images must be the submitter's own upload (no hot-linking arbitrary URLs).
alter table public.submissions drop constraint if exists submissions_image_url_check;
alter table public.submissions add constraint submissions_image_url_check check (
  image_url is null or image_url like
    'https://hhzzwodmruphsxldgvfv.supabase.co/storage/v1/object/public/uploads/looks/' || user_id::text || '/%'
);

-- Research studies get an optional image, uploaded by admins.
alter table public.studies add column if not exists image_url text;
alter table public.studies drop constraint if exists studies_image_url_check;
alter table public.studies add constraint studies_image_url_check check (
  image_url is null or image_url like 'https://hhzzwodmruphsxldgvfv.supabase.co/storage/v1/object/public/uploads/studies/%'
);
