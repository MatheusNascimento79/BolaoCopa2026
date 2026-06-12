drop policy if exists "payment_receipts_update_admin" on public.payment_receipts;

create or replace function private.decide_payment_receipt(
  p_receipt_id uuid,
  p_decision public.receipt_status,
  p_rejection_reason text default null
)
returns public.payment_receipts
language plpgsql
volatile
security definer
set search_path = pg_catalog
as $$
declare
  v_actor_id uuid := auth.uid();
  v_receipt public.payment_receipts%rowtype;
  v_result public.payment_receipts%rowtype;
  v_action text;
  v_rejection_reason text;
begin
  if v_actor_id is null or not private.current_user_is_super_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  if p_decision is null or p_decision not in ('aprovado', 'rejeitado') then
    raise exception 'invalid_payment_decision' using errcode = '22023';
  end if;

  select *
  into v_receipt
  from public.payment_receipts
  where id = p_receipt_id
  for update;

  if not found then
    raise exception 'receipt_not_found' using errcode = 'P0002';
  end if;

  if v_receipt.status <> 'aguardando' then
    return v_receipt;
  end if;

  if p_decision = 'aprovado' then
    v_action := 'payment_approved';
    v_rejection_reason := null;

    update public.payment_receipts
    set
      status = 'aprovado',
      approved_by = v_actor_id,
      approved_at = pg_catalog.now(),
      rejection_reason = null,
      updated_at = pg_catalog.now()
    where id = p_receipt_id
      and status = 'aguardando'
    returning * into v_result;
  else
    v_action := 'payment_rejected';
    v_rejection_reason := coalesce(
      nullif(pg_catalog.btrim(p_rejection_reason), ''),
      'Pagamento não recebido. Reenvie novo comprovante ou efetue o pagamento.'
    );

    update public.payment_receipts
    set
      status = 'rejeitado',
      approved_by = null,
      approved_at = null,
      rejection_reason = v_rejection_reason,
      updated_at = pg_catalog.now()
    where id = p_receipt_id
      and status = 'aguardando'
    returning * into v_result;
  end if;

  if not found then
    select *
    into v_result
    from public.payment_receipts
    where id = p_receipt_id;

    return v_result;
  end if;

  if p_decision = 'aprovado' then
    update public.profiles
    set
      payment_status = 'pago',
      updated_at = pg_catalog.now()
    where id = v_result.user_id;
  else
    update public.profiles
    set
      payment_status = 'pendente',
      updated_at = pg_catalog.now()
    where id = v_result.user_id
      and not exists (
        select 1
        from public.payment_receipts other_receipt
        where other_receipt.user_id = v_result.user_id
          and other_receipt.id <> v_result.id
          and other_receipt.status = 'aprovado'
      );
  end if;

  insert into public.admin_audit_logs (
    actor_id,
    action,
    target_user_id,
    metadata
  )
  values (
    v_actor_id,
    v_action,
    v_result.user_id,
    pg_catalog.jsonb_build_object(
      'receipt_id', v_result.id,
      'previous_status', v_receipt.status,
      'next_status', v_result.status,
      'decision', p_decision,
      'detected_amount_cents', v_result.detected_amount_cents,
      'detected_beneficiary', v_result.detected_beneficiary
    )
  );

  return v_result;
end;
$$;

revoke all on function private.decide_payment_receipt(uuid, public.receipt_status, text) from public;
grant execute on function private.decide_payment_receipt(uuid, public.receipt_status, text) to authenticated;

create or replace function public.decide_payment_receipt(
  p_receipt_id uuid,
  p_decision public.receipt_status,
  p_rejection_reason text default null
)
returns public.payment_receipts
language sql
volatile
security invoker
set search_path = pg_catalog
as $$
  select private.decide_payment_receipt(p_receipt_id, p_decision, p_rejection_reason);
$$;

revoke all on function public.decide_payment_receipt(uuid, public.receipt_status, text) from public;
grant execute on function public.decide_payment_receipt(uuid, public.receipt_status, text) to authenticated;
