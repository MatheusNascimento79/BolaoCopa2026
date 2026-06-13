update public.app_settings
set value = jsonb_set(
  value,
  '{paymentLink}',
  to_jsonb('https://nubank.com.br/cobrar/12wih4/6a2d66db-ff8b-4a2c-ace3-b63a2c978724'::text),
  true
),
updated_at = now()
where key = 'bets_open';
