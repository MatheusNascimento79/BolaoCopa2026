create or replace function private.get_participant_statuses()
returns table (
  user_id uuid,
  nickname text,
  has_bet boolean
)
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select
    profiles.id as user_id,
    profiles.nickname,
    exists (
      select 1
      from public.bets
      where bets.user_id = profiles.id
    ) as has_bet
  from public.profiles
  where private.current_user_can_access_app()
    and profiles.role = 'participant'
    and profiles.payment_status = 'pago'
  order by profiles.nickname asc;
$$;

revoke all on function private.get_participant_statuses() from public;
grant execute on function private.get_participant_statuses() to authenticated;

create or replace function public.get_participant_statuses()
returns table (
  user_id uuid,
  nickname text,
  has_bet boolean
)
language sql
stable
security invoker
set search_path = public, private, pg_catalog
as $$
  select *
  from private.get_participant_statuses();
$$;

revoke all on function public.get_participant_statuses() from public;
grant execute on function public.get_participant_statuses() to authenticated;
