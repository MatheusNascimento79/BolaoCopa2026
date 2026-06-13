insert into public.profiles (
  id,
  email,
  full_name,
  nickname,
  role,
  payment_status
)
select
  users.id,
  coalesce(users.email, ''),
  coalesce(nullif(users.raw_user_meta_data->>'full_name', ''), split_part(coalesce(users.email, ''), '@', 1), 'Participante'),
  coalesce(nullif(users.raw_user_meta_data->>'nickname', ''), split_part(coalesce(users.email, ''), '@', 1), 'Participante'),
  'participant',
  'pendente'
from auth.users
left join public.profiles on profiles.id = users.id
where profiles.id is null
  and users.email is not null
on conflict (id) do nothing;
