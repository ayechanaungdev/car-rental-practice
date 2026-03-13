-- ============================================
-- SEED DATA FOR CAR RENTAL SYSTEM
-- ============================================
-- Replace these with actual UUIDs from Supabase Auth Dashboard:
-- OWNER1_UUID:  <paste owner1@cra.test UUID>
-- OWNER2_UUID:  <paste owner2@cra.test UUID>
-- RENTER1_UUID: <paste renter1@cra.test UUID>
-- RENTER2_UUID: <paste renter2@cra.test UUID>

-- ============================================
-- 1. UPDATE PROFILES (auto-created by auth trigger)
-- ============================================
UPDATE profiles SET
  full_name = 'Aung Ko Ko',
  phone = '09-222-222-222',
  nrc = '12/DEF(N)234567',
  gender = 'Male',
  postal_code = '11051',
  role = 'car_owner',
  is_active = true
WHERE id = '<OWNER1_UUID>';

UPDATE profiles SET
  full_name = 'Mya Mya Win',
  phone = '09-333-333-333',
  nrc = '12/GHI(N)345678',
  gender = 'Female',
  postal_code = '05011',
  role = 'car_owner',
  is_active = true
WHERE id = '<OWNER2_UUID>';

UPDATE profiles SET
  full_name = 'Kyaw Zin Htet',
  phone = '09-444-444-444',
  nrc = '12/JKL(N)456789',
  gender = 'Male',
  postal_code = '11041',
  role = 'user',
  is_active = true
WHERE id = '<RENTER1_UUID>';

UPDATE profiles SET
  full_name = 'Su Su Htwe',
  phone = '09-555-555-555',
  nrc = '12/MNO(N)567890',
  gender = 'Female',
  postal_code = '11051',
  role = 'user',
  is_active = true
WHERE id = '<RENTER2_UUID>';

-- ============================================
-- 2. INSERT CARS
-- ============================================
INSERT INTO cars (owner_id, brand, model, price_per_day, status, location, postal_code, description) VALUES
  ('<OWNER1_UUID>', 'Toyota', 'Vios 2022', 45000, 'Available', 'Yangon, Hlaing Township', '11051', 'Well-maintained sedan, perfect for city driving. AC, Bluetooth, USB charging.'),
  ('<OWNER1_UUID>', 'Honda', 'Fit 2021', 40000, 'Available', 'Yangon, Kamaryut Township', '11041', 'Compact hatchback, fuel-efficient. Ideal for daily commutes.'),
  ('<OWNER1_UUID>', 'Toyota', 'Hilux 2023', 80000, 'Unavailable', 'Yangon, Insein Township', '11011', 'Pickup truck for heavy-duty trips. 4WD, spacious cargo bed.'),
  ('<OWNER2_UUID>', 'Suzuki', 'Swift 2022', 35000, 'Available', 'Mandalay, Chan Aye Thar Zan', '05011', 'Budget-friendly city car. Great fuel economy.'),
  ('<OWNER2_UUID>', 'Toyota', 'Alphard 2023', 120000, 'Available', 'Mandalay, Maha Aung Myay', '05021', 'Premium 7-seater van. Luxury interior, ideal for family trips.');

-- ============================================
-- 3. INSERT DRIVERS (for Owner 1)
-- ============================================
INSERT INTO drivers (owner_id, name, phone, gender, status) VALUES
  ('<OWNER1_UUID>', 'Min Thu', '09-666-666-666', 'Male', 'available'),
  ('<OWNER1_UUID>', 'Zaw Win', '09-777-777-777', 'Male', 'available');
