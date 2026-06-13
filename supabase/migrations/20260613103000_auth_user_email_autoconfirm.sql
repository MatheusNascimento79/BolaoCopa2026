create or replace function private.autoconfirm_auth_user_email()
returns trigger
language plpgsql
security definer
set search_path = auth
as $$
begin
  if new.email is not null and new.email_confirmed_at is null then
    new.email_confirmed_at := now();
  end if;

  return new;
end;
$$;

revoke all on function private.autoconfirm_auth_user_email() from public;

drop trigger if exists autoconfirm_auth_user_email on auth.users;

create trigger autoconfirm_auth_user_email
before insert on auth.users
for each row
execute function private.autoconfirm_auth_user_email();
