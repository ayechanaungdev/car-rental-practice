-- Allow users to update their own profile (necessary for saving the push token)
-- Users can only update their own row (id = auth.uid())
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
