CREATE OR REPLACE FUNCTION auto_complete_expired_bookings()
RETURNS void AS $$
DECLARE
  v_owner RECORD;
BEGIN
  -- 1. Group the expired bookings by Car Owner
  FOR v_owner IN
    SELECT 
      c.owner_id, 
      COUNT(b.id) as total_completed,          
      json_agg(b.id) as booking_ids            
    FROM bookings b
    JOIN cars c ON c.id = b.car_id
    WHERE b.status = 'approved' AND b.end_date < CURRENT_DATE
    GROUP BY c.owner_id
  LOOP
    
    -- 2. Update all bookings for THIS owner simultaneously
    UPDATE bookings SET status = 'completed' 
    WHERE id IN (SELECT json_array_elements_text(v_owner.booking_ids)::uuid);

    -- 3. Free up all drivers involved
    UPDATE drivers SET status = 'available', updated_at = NOW()
    WHERE id IN (
      SELECT driver_id FROM bookings WHERE id IN (SELECT json_array_elements_text(v_owner.booking_ids)::uuid) AND driver_id IS NOT NULL
    );

    -- 5. Insert ONE Daily Report record for this owner (Which triggers Plan 08!)
    INSERT INTO daily_reports (owner_id, total_completed, booking_ids, status) 
    VALUES (v_owner.owner_id, v_owner.total_completed, v_owner.booking_ids, 'pending');

  END LOOP;
END;
$$ LANGUAGE plpgsql;
