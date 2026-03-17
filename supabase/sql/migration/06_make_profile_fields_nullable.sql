-- 1. Make fields nullable
ALTER TABLE public.profiles 
  ALTER COLUMN nrc DROP NOT NULL,
  ALTER COLUMN gender DROP NOT NULL,
  ALTER COLUMN postal_code DROP NOT NULL;

-- 2. Update the trigger to handle missing metadata safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, nrc, gender, postal_code)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Google User'), 
    'user', 
    new.raw_user_meta_data->>'nrc', -- Will be NULL for Google users
    new.raw_user_meta_data->>'gender',
    new.raw_user_meta_data->>'postal_code'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
