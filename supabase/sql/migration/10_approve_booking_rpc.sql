CREATE OR REPLACE FUNCTION approve_booking_and_assign_driver(
  p_booking_id UUID,
  p_driver_id UUID
) RETURNS void AS $$
DECLARE
  v_car_id UUID;
BEGIN
  -- 1. Get the car ID from the pending booking
  SELECT car_id INTO v_car_id FROM bookings WHERE id = p_booking_id;

  -- 2. Update the booking status and assign the driver
  UPDATE bookings SET status = 'approved', driver_id = p_driver_id WHERE id = p_booking_id;

  -- 3. Mark the assigned driver as busy (if a driver was actually selected)
  IF p_driver_id IS NOT NULL THEN
    UPDATE drivers SET status = 'busy', updated_at = NOW() WHERE id = p_driver_id;
  END IF;

  -- 4. Mark the car as booked
  UPDATE cars SET status = 'booked' WHERE id = v_car_id;
END;
$$ LANGUAGE plpgsql;
