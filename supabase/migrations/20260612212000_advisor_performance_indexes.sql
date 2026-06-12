create index if not exists app_settings_updated_by_idx
on public.app_settings (updated_by);

create index if not exists bets_champion_team_id_idx
on public.bets (champion_team_id);

create index if not exists bets_runner_up_team_id_idx
on public.bets (runner_up_team_id);

create index if not exists bets_third_place_team_id_idx
on public.bets (third_place_team_id);

create index if not exists matches_home_team_id_idx
on public.matches (home_team_id);

create index if not exists matches_away_team_id_idx
on public.matches (away_team_id);

create index if not exists payment_receipts_approved_by_idx
on public.payment_receipts (approved_by);

drop index if exists public.bets_user_id_idx;
