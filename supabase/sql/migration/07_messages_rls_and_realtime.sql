-- 1. READ: Users can only see messages they sent or received
CREATE POLICY "Users can read their messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 2. WRITE: Users can only send messages as themselves
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 3. UPDATE: Only the receiver can mark messages as read
CREATE POLICY "Receiver can mark as read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);
