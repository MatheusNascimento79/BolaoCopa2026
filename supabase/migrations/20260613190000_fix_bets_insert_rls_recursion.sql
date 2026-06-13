drop policy if exists "bets_insert_own_paid_once" on public.bets;

create policy "bets_insert_own_paid_once"
on public.bets
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role in ('participant', 'super_admin')
      and profiles.payment_status = 'pago'
  )
);
