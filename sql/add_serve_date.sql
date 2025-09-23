-- Add a date column to store the selected date for Lunch submissions
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS serve_date date;

-- (Optional) Backfill missing dates from created_at (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'submissions' AND column_name = 'created_at'
  ) THEN
    UPDATE public.submissions
    SET serve_date = (created_at)::date
    WHERE form_slug = 'lunch' AND serve_date IS NULL;
  END IF;
END $$;

-- Helpful index for grouping by serve_date
CREATE INDEX IF NOT EXISTS submissions_form_date_idx
ON public.submissions (form_slug, serve_date);
