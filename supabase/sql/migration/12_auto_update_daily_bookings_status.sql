-- We explicitly DROP the old function first because PostgreSQL restricts changing RETURN TABLE structures on the fly!
DROP FUNCTION IF EXISTS public.auto_update_daily_bookings_status();

CREATE OR REPLACE FUNCTION auto_update_daily_bookings_status()
RETURNS TABLE (
  booking_id UUID,
  customer_id UUID,
  driver_id UUID,
  car_id UUID,
  owner_id UUID,
  start_date DATE,
  end_date DATE,
  old_status TEXT,
  new_status TEXT
) AS $$
DECLARE
  v_booking RECORD;
BEGIN
  FOR v_booking IN 
    SELECT b.id, b.customer_id, b.driver_id, b.car_id, b.start_date, b.end_date, b.status, c.owner_id
    FROM public.bookings b
    JOIN public.cars c ON b.car_id = c.id
    WHERE (b.status = 'pending' AND b.start_date = current_date - interval '1 day')
       OR (b.status = 'approved' AND b.end_date = current_date - interval '1 day')
  LOOP
    IF v_booking.status = 'pending' THEN
      UPDATE public.bookings SET status = 'rejected', updated_at = NOW() WHERE id = v_booking.id;
      
      booking_id := v_booking.id; customer_id := v_booking.customer_id; driver_id := v_booking.driver_id; 
      car_id := v_booking.car_id; owner_id := v_booking.owner_id; start_date := v_booking.start_date; end_date := v_booking.end_date; 
      old_status := v_booking.status; new_status := 'rejected';
      RETURN NEXT;

    ELSIF v_booking.status = 'approved' THEN
      UPDATE public.bookings SET status = 'completed', updated_at = NOW() WHERE id = v_booking.id;

      booking_id := v_booking.id; customer_id := v_booking.customer_id; driver_id := v_booking.driver_id; 
      car_id := v_booking.car_id; owner_id := v_booking.owner_id; start_date := v_booking.start_date; end_date := v_booking.end_date; 
      old_status := v_booking.status; new_status := 'completed';
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
