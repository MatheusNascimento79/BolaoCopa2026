create or replace function public.get_ranking_bets()
returns table (
  id uuid,
  user_id uuid,
  champion_team_id uuid,
  runner_up_team_id uuid,
  third_place_team_id uuid,
  submitted_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    bets.id,
    bets.user_id,
    bets.champion_team_id,
    bets.runner_up_team_id,
    bets.third_place_team_id,
    bets.submitted_at
  from public.bets
  inner join public.profiles
    on profiles.id = bets.user_id
  where private.current_user_can_access_app()
    and profiles.payment_status = 'pago'
  order by bets.submitted_at asc;
$$;

revoke all on function public.get_ranking_bets() from public;
grant execute on function public.get_ranking_bets() to authenticated;

create or replace function public.get_ranking_profiles()
returns table (
  id uuid,
  nickname text,
  role public.profile_role,
  payment_status public.payment_status
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    profiles.id,
    profiles.nickname,
    profiles.role,
    profiles.payment_status
  from public.profiles
  where private.current_user_can_access_app()
    and profiles.payment_status = 'pago'
    and exists (
      select 1
      from public.bets
      where bets.user_id = profiles.id
    )
  order by profiles.nickname asc;
$$;

revoke all on function public.get_ranking_profiles() from public;
grant execute on function public.get_ranking_profiles() to authenticated;
