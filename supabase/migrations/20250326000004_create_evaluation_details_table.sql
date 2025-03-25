-- Create evaluation_details table
CREATE TABLE public.evaluation_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID NOT NULL REFERENCES public.evaluations(id) ON DELETE CASCADE,
  evaluation_item_id UUID NOT NULL REFERENCES public.evaluation_items(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(evaluation_id, evaluation_item_id)
);

-- Set up Row Level Security
ALTER TABLE public.evaluation_details ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy: Anyone can view all evaluation details
CREATE POLICY "Allow anyone to view all evaluation details"
  ON public.evaluation_details
  FOR SELECT
  USING (true);

-- Policy: Users can insert evaluation details for their own evaluations
CREATE POLICY "Allow users to insert evaluation details for their own evaluations"
  ON public.evaluation_details
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT evaluator_id FROM public.evaluations WHERE id = evaluation_id
    )
  );

-- Policy: Users can update evaluation details for their own evaluations
CREATE POLICY "Allow users to update evaluation details for their own evaluations"
  ON public.evaluation_details
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT evaluator_id FROM public.evaluations WHERE id = evaluation_id
    )
  );

-- Policy: Users can delete evaluation details for their own evaluations
CREATE POLICY "Allow users to delete evaluation details for their own evaluations"
  ON public.evaluation_details
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT evaluator_id FROM public.evaluations WHERE id = evaluation_id
    )
  );
