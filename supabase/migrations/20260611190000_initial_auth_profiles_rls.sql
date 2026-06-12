create type public.profile_role as enum ('participant', 'super_admin');
create type public.payment_status as enum ('pendente', 'aguardando', 'pago');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  nickname text not null,
  role public.profile_role not null default 'participant',
  payment_status public.payment_status not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  target_user_id uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.app_settings (key, value)
values ('bets_open', '{"open": true}'::jsonb)
on conflict (key) do nothing;

create index profiles_payment_status_idx on public.profiles (payment_status);
create index profiles_role_idx on public.profiles (role);
create index admin_audit_logs_actor_id_idx on public.admin_audit_logs (actor_id);
create index admin_audit_logs_target_user_id_idx on public.admin_audit_logs (target_user_id);

alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.admin_audit_logs enable row level security;

create or replace function public.current_user_is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
  );
$$;

revoke all on function public.current_user_is_super_admin() from public;
grant execute on function public.current_user_is_super_admin() to authenticated;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  ((select auth.uid()) is not null and id = (select auth.uid()))
  or (select public.current_user_is_super_admin())
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and id = (select auth.uid())
  and role = 'participant'
  and payment_status = 'pendente'
);

create policy "profiles_update_own_public_fields"
on public.profiles
for update
to authenticated
using ((select auth.uid()) is not null and id = (select auth.uid()))
with check (
  (select auth.uid()) is not null
  and id = (select auth.uid())
  and role = 'participant'
  and payment_status = 'pendente'
);

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using ((select public.current_user_is_super_admin()))
with check ((select public.current_user_is_super_admin()));

create policy "app_settings_select_authenticated"
on public.app_settings
for select
to authenticated
using (true);

create policy "app_settings_update_admin"
on public.app_settings
for update
to authenticated
using ((select public.current_user_is_super_admin()))
with check ((select public.current_user_is_super_admin()));

create policy "admin_audit_logs_select_admin"
on public.admin_audit_logs
for select
to authenticated
using ((select public.current_user_is_super_admin()));

create policy "admin_audit_logs_insert_admin"
on public.admin_audit_logs
for insert
to authenticated
with check (
  (select public.current_user_is_super_admin())
  and actor_id = (select auth.uid())
);

