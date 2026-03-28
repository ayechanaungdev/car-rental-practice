SELECT cron.schedule(
  'notify-bookings-job',
  '5 0 * * *',  -- 12:05 AM daily
  $$
  SELECT net.http_post(
    url := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/notify-bookings',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || '<YOUR_ANON_KEY>'
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
