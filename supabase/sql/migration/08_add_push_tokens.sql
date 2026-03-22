-- 1. Add the column to the profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 2. Allow all authenticated users to read profiles (so they can fetch the receiver's push token)
-- Assuming you already have a SELECT policy on profiles, you might need to ensure it allows fetching by ID.
-- If not, run:
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles FOR SELECT 
  USING (auth.role() = 'authenticated');
