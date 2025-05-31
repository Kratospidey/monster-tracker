-- Create RLS policies for drinks table
-- Enable RLS on drinks table (if not already enabled)
ALTER TABLE public.drinks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own drinks" ON public.drinks;
DROP POLICY IF EXISTS "Users can insert their own drinks" ON public.drinks;
DROP POLICY IF EXISTS "Users can update their own drinks" ON public.drinks;
DROP POLICY IF EXISTS "Users can delete their own drinks" ON public.drinks;

-- Policy to allow authenticated users to view their own drinks
CREATE POLICY "Users can view their own drinks" ON public.drinks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow authenticated users to insert their own drinks
CREATE POLICY "Users can insert their own drinks" ON public.drinks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow authenticated users to update their own drinks
CREATE POLICY "Users can update their own drinks" ON public.drinks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy to allow authenticated users to delete their own drinks
CREATE POLICY "Users can delete their own drinks" ON public.drinks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id); 