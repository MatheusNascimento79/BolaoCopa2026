update public.app_settings
set value = jsonb_set(
  value,
  '{paymentPixKey}',
  to_jsonb('d3acdf19-4f3c-4beb-9ac7-cfa221792628'::text),
  true
),
updated_at = now()
where key = 'bets_open';
