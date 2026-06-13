create or replace function private.bootstrap_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    nickname,
    role,
    payment_status
  )
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(coalesce(new.email, ''), '@', 1), 'Participante'),
    coalesce(nullif(new.raw_user_meta_data->>'nickname', ''), split_part(coalesce(new.email, ''), '@', 1), 'Participante'),
    'participant',
    'pendente'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function private.bootstrap_profile_from_auth_user() from public;

drop trigger if exists bootstrap_profile_from_auth_user on auth.users;

create trigger bootstrap_profile_from_auth_user
after insert on auth.users
for each row
execute function private.bootstrap_profile_from_auth_user();
