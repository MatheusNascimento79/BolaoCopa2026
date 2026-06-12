create or replace function private.sync_payment_receipt_profile_status()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if new.status = 'aguardando' then
    update public.profiles
    set
      payment_status = 'aguardando',
      updated_at = pg_catalog.now()
    where id = new.user_id
      and payment_status <> 'pago';
  end if;

  return new;
end;
$$;

revoke all on function private.sync_payment_receipt_profile_status() from public;

drop trigger if exists payment_receipts_sync_profile_status on public.payment_receipts;

create trigger payment_receipts_sync_profile_status
after insert or update of status on public.payment_receipts
for each row
execute function private.sync_payment_receipt_profile_status();
