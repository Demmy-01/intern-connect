-- Migration: Add external company name field
-- Description: Adds support for storing the external company name in external internship links

ALTER TABLE public.internships
ADD COLUMN external_company_name text;

-- Add comment to explain the field
COMMENT ON COLUMN public.internships.external_company_name IS 'Name of the external company offering the internship';
