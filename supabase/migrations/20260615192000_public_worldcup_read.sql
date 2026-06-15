grant select on public.teams to anon, authenticated;
grant select on public.matches to anon, authenticated;

drop policy if exists "teams_select_public" on public.teams;
create policy "teams_select_public"
on public.teams
for select
to anon, authenticated
using (true);

drop policy if exists "matches_select_public" on public.matches;
create policy "matches_select_public"
on public.matches
for select
to anon, authenticated
using (true);
