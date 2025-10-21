-- Função para criar organização e usuário admin
CREATE OR REPLACE FUNCTION public.create_org_and_user(
  p_user_id uuid,
  p_org_name text,
  p_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
BEGIN
  -- Criar organização
  INSERT INTO public.companies (name)
  VALUES (p_org_name)
  RETURNING id INTO v_org_id;
  
  -- Criar usuário admin
  INSERT INTO public.users (id, company_id, email, role, status)
  VALUES (p_user_id, v_org_id, p_email, 'admin', 'active');
  
  RETURN v_org_id;
END;
$$;