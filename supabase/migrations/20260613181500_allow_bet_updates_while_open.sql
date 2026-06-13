drop policy if exists "bets_update_own_paid_when_open" on public.bets;

create policy "bets_update_own_paid_when_open"
on public.bets
for update
to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'participant'
      and profiles.payment_status = 'pago'
  )
  and exists (
    select 1
    from public.app_settings
    where key = 'bets_open'
      and coalesce((value ->> 'open')::boolean, false) = true
      and coalesce(nullif(value ->> 'betsDeadlineAt', '')::timestamptz > now(), true)
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'participant'
      and profiles.payment_status = 'pago'
  )
  and exists (
    select 1
    from public.app_settings
    where key = 'bets_open'
      and coalesce((value ->> 'open')::boolean, false) = true
      and coalesce(nullif(value ->> 'betsDeadlineAt', '')::timestamptz > now(), true)
  )
);
