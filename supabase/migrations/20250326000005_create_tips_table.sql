-- Create tips table
CREATE TABLE public.tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barista_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL CHECK (amount > 0),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  payment_info TEXT,
  message TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy: Baristas can view tips sent to them
CREATE POLICY "Allow baristas to view tips sent to them"
  ON public.tips
  FOR SELECT
  USING (
    barista_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can view tips they've sent
CREATE POLICY "Allow users to view tips they've sent"
  ON public.tips
  FOR SELECT
  USING (sender_id = auth.uid());

-- Policy: Authenticated users can insert their own tips
CREATE POLICY "Allow authenticated users to insert their own tips"
  ON public.tips
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Policy: Senders can update their own tips (limited time window or specific fields might be needed)
CREATE POLICY "Allow senders to update their own tips"
  ON public.tips
  FOR UPDATE
  USING (auth.uid() = sender_id);

-- Trigger to call the function before update
CREATE TRIGGER set_tips_updated_at
BEFORE UPDATE ON public.tips
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
