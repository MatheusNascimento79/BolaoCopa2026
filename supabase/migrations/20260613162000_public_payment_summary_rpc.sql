create or replace function private.get_payment_summary()
returns table (
  paid integer,
  awaiting integer,
  pending integer,
  rejected integer,
  total_raised_cents integer
)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  with settings as (
    select coalesce((value ->> 'paymentAmountCents')::integer, 0) as payment_amount_cents
    from public.app_settings
    where key = 'bets_open'
  )
  select
    count(*) filter (where profiles.role = 'participant' and profiles.payment_status = 'pago')::integer as paid,
    count(*) filter (where profiles.role = 'participant' and profiles.payment_status = 'aguardando')::integer as awaiting,
    count(*) filter (where profiles.role = 'participant' and profiles.payment_status = 'pendente')::integer as pending,
    (
      select count(*)::integer
      from public.payment_receipts
      where payment_receipts.status = 'rejeitado'
    ) as rejected,
    (
      count(*) filter (where profiles.role = 'participant' and profiles.payment_status = 'pago')::integer
      * coalesce((select settings.payment_amount_cents from settings), 0)
    )::integer as total_raised_cents
  from public.profiles;
$$;

revoke all on function private.get_payment_summary() from public;
grant execute on function private.get_payment_summary() to authenticated;

create or replace function public.get_payment_summary()
returns table (
  paid integer,
  awaiting integer,
  pending integer,
  rejected integer,
  total_raised_cents integer
)
language sql
stable
security invoker
set search_path = public, private, pg_catalog
as $$
  select *
  from private.get_payment_summary();
$$;

revoke all on function public.get_payment_summary() from public;
grant execute on function public.get_payment_summary() to authenticated;
