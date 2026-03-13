-- 1. `car-images` (Public Read, Authenticated Upload)
CREATE POLICY "Public Access to Car Images" ON storage.objects FOR SELECT USING (bucket_id = 'car-images');
CREATE POLICY "Authenticated users can upload car images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'car-images' AND auth.role() = 'authenticated');

-- 2. `profiles` (Public Read, Authenticated Upload)
CREATE POLICY "Public Access to Profiles" ON storage.objects FOR SELECT USING (bucket_id = 'profiles');
CREATE POLICY "Authenticated users can upload profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- 3. `licenses` (Private Read/Write to self only)
CREATE POLICY "Users can see their own licenses" ON storage.objects FOR SELECT USING (bucket_id = 'licenses' AND auth.uid() = owner);
CREATE POLICY "Users can upload their own licenses" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'licenses' AND auth.role() = 'authenticated');