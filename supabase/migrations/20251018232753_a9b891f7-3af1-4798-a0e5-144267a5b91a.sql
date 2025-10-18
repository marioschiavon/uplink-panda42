-- Create ENUMs for routing and ticket status
CREATE TYPE public.routing_mode AS ENUM ('manual', 'auto', 'hybrid');
CREATE TYPE public.ticket_status AS ENUM ('waiting', 'in_progress', 'closed');
CREATE TYPE public.user_role AS ENUM ('admin', 'agent');
CREATE TYPE public.user_status AS ENUM ('active', 'inactive');

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  routing_mode public.routing_mode NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users table (profiles)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role public.user_role NOT NULL DEFAULT 'agent',
  status public.user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_number TEXT NOT NULL,
  last_message TEXT,
  status public.ticket_status NOT NULL DEFAULT 'waiting',
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_tickets_company_id ON public.tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON public.tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_number ON public.tickets(customer_number);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = user_id;
$$;

-- Security definer function to get user company
CREATE OR REPLACE FUNCTION public.get_user_company(user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.users WHERE id = user_id;
$$;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (id = public.get_user_company(auth.uid()));

CREATE POLICY "Admins can update their company"
  ON public.companies FOR UPDATE
  USING (
    id = public.get_user_company(auth.uid()) 
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can insert companies"
  ON public.companies FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- RLS Policies for users
CREATE POLICY "Users can view users from their company"
  ON public.users FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their company"
  ON public.users FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company(auth.uid())
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update users in their company"
  ON public.users FOR UPDATE
  USING (
    company_id = public.get_user_company(auth.uid())
    AND public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid());

-- RLS Policies for tickets
CREATE POLICY "Users can view tickets from their company"
  ON public.tickets FOR SELECT
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can insert tickets in their company"
  ON public.tickets FOR INSERT
  WITH CHECK (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Users can update tickets from their company"
  ON public.tickets FOR UPDATE
  USING (company_id = public.get_user_company(auth.uid()));

CREATE POLICY "Agents can update assigned tickets"
  ON public.tickets FOR UPDATE
  USING (assigned_to = auth.uid());