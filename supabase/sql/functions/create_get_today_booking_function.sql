create or replace function public.get_todays_bookings()
returns table(
  booking_id uuid,
  customer_id uuid,
  driver_id uuid,
  car_id uuid,
  start_time timestamptz,
  end_time timestamptz
)
language sql
stable
as $$
  select id, customer_id, driver_id, car_id, start_date, end_date
  from public.bookings
  where date(start_date at time zone 'UTC') = current_date at time zone 'UTC'
  order by customer_id, start_date;
$$;