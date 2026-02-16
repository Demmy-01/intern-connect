-- Migration: Add external internship fields
-- Description: Adds support for external internship links

ALTER TABLE public.internships
ADD COLUMN is_external boolean DEFAULT false,
ADD COLUMN external_link text;

-- Add constraint to ensure external_link is provided if is_external is true
ALTER TABLE public.internships
ADD CONSTRAINT external_link_required_check 
  CHECK (NOT is_external OR (is_external AND external_link IS NOT NULL AND external_link != ''));

-- Add comment to explain the fields
COMMENT ON COLUMN public.internships.is_external IS 'Indicates if this is an external internship link (true) or platform internship (false)';
COMMENT ON COLUMN public.internships.external_link IS 'URL to the external internship application page';
