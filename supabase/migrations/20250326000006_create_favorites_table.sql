-- Create favorites table
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  barista_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, barista_profile_id)
);

-- Set up Row Level Security
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy: Users can view their own favorites
CREATE POLICY "Allow users to view their own favorites"
  ON public.favorites
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Baristas can see who has favorited them
CREATE POLICY "Allow baristas to see who has favorited them"
  ON public.favorites
  FOR SELECT
  USING (
    barista_profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Policy: Authenticated users can add their own favorites
CREATE POLICY "Allow authenticated users to add their own favorites"
  ON public.favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Allow users to delete their own favorites"
  ON public.favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to call the function before update
CREATE TRIGGER set_favorites_updated_at
BEFORE UPDATE ON public.favorites
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
