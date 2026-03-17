-- Update the existing trigger function to extract all required fields from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, nrc, gender, postal_code)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    'user', -- Role is 'user'
    new.raw_user_meta_data->>'nrc',
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'postal_code'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Second, the Event (Trigger)
-- We drop it first to avoid "already exists" errors, then create it clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
