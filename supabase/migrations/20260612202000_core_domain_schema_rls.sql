create schema if not exists private;
grant usage on schema private to authenticated;

create type public.receipt_status as enum ('pendente', 'aguardando', 'aprovado', 'rejeitado');
create type public.team_status as enum ('ativo', 'eliminado', 'campeao', 'vice', 'terceiro');
create type public.match_status as enum ('agendado', 'ao_vivo', 'encerrado', 'adiado', 'cancelado');
create type public.tournament_stage as enum (
  'fase_de_grupos',
  '32_avos',
  'oitavas',
  'quartas',
  'semifinais',
  'terceiro_lugar',
  'final'
);

create or replace function private.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
  );
$$;

revoke all on function private.current_user_is_super_admin() from public;
grant execute on function private.current_user_is_super_admin() to authenticated;

create or replace function private.current_user_can_access_app()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and (
        role = 'super_admin'
        or payment_status = 'pago'
      )
  );
$$;

revoke all on function private.current_user_can_access_app() from public;
grant execute on function private.current_user_can_access_app() to authenticated;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_admin" on public.profiles;
drop policy if exists "app_settings_update_admin" on public.app_settings;
drop policy if exists "admin_audit_logs_select_admin" on public.admin_audit_logs;
drop policy if exists "admin_audit_logs_insert_admin" on public.admin_audit_logs;

drop function if exists public.current_user_is_super_admin();

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  ((select auth.uid()) is not null and id = (select auth.uid()))
  or (select private.current_user_is_super_admin())
);

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

create policy "app_settings_update_admin"
on public.app_settings
for update
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

create policy "admin_audit_logs_select_admin"
on public.admin_audit_logs
for select
to authenticated
using ((select private.current_user_is_super_admin()));

create policy "admin_audit_logs_insert_admin"
on public.admin_audit_logs
for insert
to authenticated
with check (
  (select private.current_user_is_super_admin())
  and actor_id = (select auth.uid())
);

create table public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  storage_path text,
  detected_amount_cents integer,
  detected_beneficiary text,
  detected_confidence numeric(5, 4),
  status public.receipt_status not null default 'pendente',
  rejection_reason text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payment_receipts_detected_amount_nonnegative check (
    detected_amount_cents is null or detected_amount_cents >= 0
  ),
  constraint payment_receipts_confidence_range check (
    detected_confidence is null or (detected_confidence >= 0 and detected_confidence <= 1)
  ),
  constraint payment_receipts_approval_consistency check (
    (status = 'aprovado' and approved_by is not null and approved_at is not null)
    or (status <> 'aprovado' and approved_by is null and approved_at is null)
  )
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  name text not null,
  flag_url text not null,
  group_name text not null,
  confederation text not null,
  fifa_ranking integer not null,
  stats jsonb not null default '{}'::jsonb,
  status public.team_status not null default 'ativo',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teams_fifa_ranking_positive check (fifa_ranking > 0)
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  external_id text not null unique,
  stage public.tournament_stage not null,
  group_name text,
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_score integer,
  away_score integer,
  status public.match_status not null default 'agendado',
  kickoff_at timestamptz not null,
  venue text not null,
  city text not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint matches_scores_nonnegative check (
    (home_score is null or home_score >= 0)
    and (away_score is null or away_score >= 0)
  ),
  constraint matches_distinct_teams check (
    home_team_id is null
    or away_team_id is null
    or home_team_id <> away_team_id
  )
);

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  champion_team_id uuid not null references public.teams(id),
  runner_up_team_id uuid not null references public.teams(id),
  third_place_team_id uuid not null references public.teams(id),
  submitted_at timestamptz not null default now(),
  constraint bets_distinct_teams check (
    champion_team_id <> runner_up_team_id
    and champion_team_id <> third_place_team_id
    and runner_up_team_id <> third_place_team_id
  )
);

create table public.ranking_snapshots (
  id uuid primary key default gen_random_uuid(),
  generated_at timestamptz not null default now(),
  source_match_version text not null,
  payload jsonb not null default '{}'::jsonb
);

create table public.ranking_entries (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.ranking_snapshots(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  position integer not null,
  probability_score numeric(12, 10) not null,
  expected_prize_cents integer not null default 0,
  expected_tier integer not null,
  nickname text not null,
  created_at timestamptz not null default now(),
  constraint ranking_entries_position_positive check (position > 0),
  constraint ranking_entries_probability_range check (probability_score >= 0 and probability_score <= 1),
  constraint ranking_entries_prize_nonnegative check (expected_prize_cents >= 0),
  constraint ranking_entries_tier_range check (expected_tier between 1 and 7)
);

create view public.public_ranking_entries
with (security_invoker = true)
as
select
  id,
  snapshot_id,
  position,
  nickname,
  probability_score,
  expected_prize_cents,
  expected_tier,
  created_at
from public.ranking_entries;

create unique index bets_user_id_idx on public.bets (user_id);
create index payment_receipts_user_id_idx on public.payment_receipts (user_id);
create index payment_receipts_status_idx on public.payment_receipts (status);
create index teams_external_id_idx on public.teams (external_id);
create index teams_status_idx on public.teams (status);
create index matches_stage_idx on public.matches (stage);
create index matches_status_idx on public.matches (status);
create index matches_kickoff_at_idx on public.matches (kickoff_at);
create index ranking_entries_snapshot_position_idx on public.ranking_entries (snapshot_id, position);
create index ranking_entries_user_id_idx on public.ranking_entries (user_id);

alter table public.payment_receipts enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.bets enable row level security;
alter table public.ranking_snapshots enable row level security;
alter table public.ranking_entries enable row level security;

create policy "payment_receipts_select_own_or_admin"
on public.payment_receipts
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_user_is_super_admin())
);

create policy "payment_receipts_insert_own_pending"
on public.payment_receipts
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and status in ('pendente', 'aguardando')
  and approved_by is null
  and approved_at is null
);

create policy "payment_receipts_update_own_before_approval"
on public.payment_receipts
for update
to authenticated
using (
  user_id = (select auth.uid())
  and status in ('pendente', 'rejeitado')
)
with check (
  user_id = (select auth.uid())
  and status = 'aguardando'
  and approved_by is null
  and approved_at is null
);

create policy "payment_receipts_update_admin"
on public.payment_receipts
for update
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

create policy "teams_select_authenticated"
on public.teams
for select
to authenticated
using ((select private.current_user_can_access_app()));

create policy "teams_write_admin"
on public.teams
for all
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

create policy "matches_select_authenticated"
on public.matches
for select
to authenticated
using ((select private.current_user_can_access_app()));

create policy "matches_write_admin"
on public.matches
for all
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

create policy "bets_select_own_or_admin"
on public.bets
for select
to authenticated
using (
  user_id = (select auth.uid())
  or (select private.current_user_is_super_admin())
);

create policy "bets_insert_own_paid_when_open"
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
  and exists (
    select 1
    from public.app_settings
    where key = 'bets_open'
      and coalesce((value ->> 'open')::boolean, false) = true
  )
);

create policy "ranking_snapshots_select_authenticated"
on public.ranking_snapshots
for select
to authenticated
using ((select private.current_user_can_access_app()));

create policy "ranking_snapshots_write_admin"
on public.ranking_snapshots
for all
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

create policy "ranking_entries_select_authenticated"
on public.ranking_entries
for select
to authenticated
using ((select private.current_user_can_access_app()));

create policy "ranking_entries_write_admin"
on public.ranking_entries
for all
to authenticated
using ((select private.current_user_is_super_admin()))
with check ((select private.current_user_is_super_admin()));

alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.teams;
alter publication supabase_realtime add table public.ranking_snapshots;
alter publication supabase_realtime add table public.ranking_entries;
