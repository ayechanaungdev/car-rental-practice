-- 1. Insert a PENDING booking that was supposed to start YESTERDAY
INSERT INTO bookings (customer_id, car_id, start_date, end_date, total_price, status)
VALUES (
  '<RENTER1_UUID>', 
  (SELECT id FROM cars WHERE brand = 'Toyota' LIMIT 1),
  CURRENT_DATE - INTERVAL '1 day',  
  CURRENT_DATE + INTERVAL '2 days', 
  90000, 
  'pending'
);

-- 2. Insert an APPROVED booking that ENDED YESTERDAY
INSERT INTO bookings (customer_id, car_id, driver_id, start_date, end_date, total_price, status)
VALUES (
  '<RENTER1_UUID>', 
  (SELECT id FROM cars WHERE brand = 'Honda' LIMIT 1),
  (SELECT id FROM drivers LIMIT 1),
  CURRENT_DATE - INTERVAL '4 days',  
  CURRENT_DATE - INTERVAL '1 day', 
  120000, 
  'approved'
);
