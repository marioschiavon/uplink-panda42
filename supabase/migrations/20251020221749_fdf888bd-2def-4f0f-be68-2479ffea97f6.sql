-- Add api_token column to companies table
ALTER TABLE public.companies 
ADD COLUMN api_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex');

-- Create index for faster lookups
CREATE INDEX idx_companies_api_token ON public.companies(api_token);

-- Create function to rotate API token
CREATE OR REPLACE FUNCTION public.rotate_company_api_token(company_uuid uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Generate new token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Update company
  UPDATE public.companies
  SET api_token = new_token,
      updated_at = now()
  WHERE id = company_uuid;
  
  RETURN new_token;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.rotate_company_api_token(uuid) TO authenticated;