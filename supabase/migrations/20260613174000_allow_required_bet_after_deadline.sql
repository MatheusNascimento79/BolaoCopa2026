drop policy if exists "bets_insert_own_paid_when_open" on public.bets;
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
      and profiles.role = 'participant'
      and profiles.payment_status = 'pago'
  )
  and not exists (
    select 1
    from public.bets existing_bets
    where existing_bets.user_id = (select auth.uid())
  )
);
