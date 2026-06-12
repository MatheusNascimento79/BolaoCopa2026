insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'payment-receipts',
  'payment-receipts',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_receipts_storage_insert_own" on storage.objects;
drop policy if exists "payment_receipts_storage_select_own_or_admin" on storage.objects;

create policy "payment_receipts_storage_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'payment-receipts'
  and owner_id = (select auth.uid())::text
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "payment_receipts_storage_select_own_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'payment-receipts'
  and (
    owner_id = (select auth.uid())::text
    or (select private.current_user_is_super_admin())
  )
);
