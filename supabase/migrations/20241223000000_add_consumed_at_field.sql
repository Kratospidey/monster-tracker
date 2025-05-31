-- Add consumed_at field to drinks table to track when the drink was actually consumed
-- This is separate from created_at which tracks when the record was created

ALTER TABLE public.drinks 
ADD COLUMN consumed_at timestamp with time zone;

-- Set default value for existing records to use created_at
UPDATE public.drinks 
SET consumed_at = created_at 
WHERE consumed_at IS NULL;

-- Make the field required for future records
ALTER TABLE public.drinks 
ALTER COLUMN consumed_at SET NOT NULL;

-- Set default for new records to current timestamp
ALTER TABLE public.drinks 
ALTER COLUMN consumed_at SET DEFAULT now(); 