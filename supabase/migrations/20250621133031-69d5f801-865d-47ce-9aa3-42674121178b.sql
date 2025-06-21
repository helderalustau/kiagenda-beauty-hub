
-- Step 1: Add password hashing support and fix RLS policies

-- First, enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add password_hash columns to auth tables
ALTER TABLE public.admin_auth ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.client_auth ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create function to hash passwords
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Migrate existing passwords to hashed format
UPDATE public.admin_auth 
SET password_hash = public.hash_password(password)
WHERE password_hash IS NULL AND password IS NOT NULL;

UPDATE public.client_auth 
SET password_hash = public.hash_password(password)
WHERE password_hash IS NULL AND password IS NOT NULL;

-- Remove overly permissive RLS policies
DROP POLICY IF EXISTS "Allow all admin_auth operations" ON public.admin_auth;
DROP POLICY IF EXISTS "Allow all client_auth operations" ON public.client_auth;

-- Create secure RLS policies for admin_auth
CREATE POLICY "Admins can view their own record and salon admins"
ON public.admin_auth
FOR SELECT
USING (
  id = (SELECT id FROM public.admin_auth WHERE name = current_setting('app.current_user', true))
  OR salon_id = (SELECT salon_id FROM public.admin_auth WHERE name = current_setting('app.current_user', true))
);

CREATE POLICY "Allow admin authentication"
ON public.admin_auth
FOR SELECT
USING (true);

CREATE POLICY "Allow admin creation"
ON public.admin_auth
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update their own record"
ON public.admin_auth
FOR UPDATE
USING (id = (SELECT id FROM public.admin_auth WHERE name = current_setting('app.current_user', true)));

CREATE POLICY "Super admin can delete admins"
ON public.admin_auth
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  )
);

-- Create secure RLS policies for client_auth
CREATE POLICY "Clients can view their own record"
ON public.client_auth
FOR SELECT
USING (name = current_setting('app.current_user', true));

CREATE POLICY "Allow client authentication"
ON public.client_auth
FOR SELECT
USING (true);

CREATE POLICY "Allow client registration"
ON public.client_auth
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Clients can update their own record"
ON public.client_auth
FOR UPDATE
USING (name = current_setting('app.current_user', true));

-- Create secure RLS policies for salons
ALTER TABLE public.salons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their salon"
ON public.salons
FOR SELECT
USING (
  id = (SELECT salon_id FROM public.admin_auth WHERE name = current_setting('app.current_user', true))
  OR EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Allow public salon viewing for booking"
ON public.salons
FOR SELECT
USING (is_open = true AND setup_completed = true);

CREATE POLICY "Admins can update their salon"
ON public.salons
FOR UPDATE
USING (
  id = (SELECT salon_id FROM public.admin_auth WHERE name = current_setting('app.current_user', true))
  OR EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  )
);

CREATE POLICY "Super admin can create salons"
ON public.salons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  )
);

-- Add audit logging table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can view all audit logs"
ON public.audit_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  )
);
