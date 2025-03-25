-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barista_profile_id UUID NOT NULL REFERENCES public.profiles(id),
  evaluator_id UUID NOT NULL REFERENCES auth.users(id),
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy: Anyone can view all evaluations
CREATE POLICY "Allow anyone to view all evaluations"
  ON public.evaluations
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own evaluations
CREATE POLICY "Allow authenticated users to insert their own evaluations"
  ON public.evaluations
  FOR INSERT
  WITH CHECK (auth.uid() = evaluator_id);

-- Policy: Users can only update their own evaluations
CREATE POLICY "Allow users to update their own evaluations"
  ON public.evaluations
  FOR UPDATE
  USING (auth.uid() = evaluator_id);

-- Policy: Users can only delete their own evaluations
CREATE POLICY "Allow users to delete their own evaluations"
  ON public.evaluations
  FOR DELETE
  USING (auth.uid() = evaluator_id);
