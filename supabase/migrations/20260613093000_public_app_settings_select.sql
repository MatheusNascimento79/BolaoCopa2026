drop policy if exists "app_settings_select_authenticated" on public.app_settings;
drop policy if exists "app_settings_select_public" on public.app_settings;

create policy "app_settings_select_public"
on public.app_settings
for select
to anon, authenticated
using (true);
