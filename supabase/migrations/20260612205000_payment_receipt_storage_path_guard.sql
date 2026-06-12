alter table public.payment_receipts
add constraint payment_receipts_storage_path_required
check (
  status not in ('aguardando', 'aprovado')
  or nullif(pg_catalog.btrim(storage_path), '') is not null
);
