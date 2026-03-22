SELECT cron.schedule(
  'auto-complete-midnight', 
  '5 0 * * *',  -- Minute: 5, Hour: 0 (12:05 AM)
  'SELECT auto_complete_expired_bookings()'
);
