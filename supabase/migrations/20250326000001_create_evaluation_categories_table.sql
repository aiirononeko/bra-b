-- Create evaluation_categories table
CREATE TABLE public.evaluation_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.evaluation_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Policy: Anyone can view active evaluation categories
CREATE POLICY "Allow anyone to view active evaluation categories"
  ON public.evaluation_categories
  FOR SELECT
  USING (is_active = true);

-- Policy: Only admins can insert/update/delete (will need to be customized based on your admin system)
-- For now, we'll create a placeholder policy
CREATE POLICY "Admin can manage evaluation categories"
  ON public.evaluation_categories
  USING (true);

-- Trigger to call the function before update
CREATE TRIGGER set_evaluation_categories_updated_at
BEFORE UPDATE ON public.evaluation_categories
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
