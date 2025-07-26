
-- Phase 1: Critical Database Security Fixes

-- 1. Enable RLS on admin_hierarchy table and create proper policies
ALTER TABLE public.admin_hierarchy ENABLE ROW LEVEL SECURITY;

-- Create restrictive policy for admin_hierarchy - only super admins can manage
CREATE POLICY "Super admins can manage admin hierarchy" 
ON public.admin_hierarchy 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.name = current_setting('app.current_user', true) 
    AND admin_auth.role = 'super_admin'
  )
);

-- 2. Remove overly permissive policies and create restrictive ones

-- Drop overly permissive policies on admin_auth
DROP POLICY IF EXISTS "Enable delete for all users" ON public.admin_auth;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.admin_auth;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.admin_auth;
DROP POLICY IF EXISTS "Enable update for all users" ON public.admin_auth;

-- Drop overly permissive policies on client_auth
DROP POLICY IF EXISTS "Enable delete for all users" ON public.client_auth;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.client_auth;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.client_auth;
DROP POLICY IF EXISTS "Enable update for all users" ON public.client_auth;

-- Drop overly permissive policies on other tables
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow all operations on salons" ON public.salons;
DROP POLICY IF EXISTS "Enable all operations for salons" ON public.salons;
DROP POLICY IF EXISTS "Allow all operations on services" ON public.services;
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;

-- 3. Secure database functions by adding search_path protection
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN crypt(password, gen_salt('bf', 12));
END;
$function$;

CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_incomplete_salons()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only allow super admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  DELETE FROM public.salons 
  WHERE setup_completed = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_salons_without_admins()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Only allow super admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;
  
  DELETE FROM public.salons 
  WHERE id NOT IN (
    SELECT DISTINCT salon_id 
    FROM public.admin_auth 
    WHERE salon_id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$function$;

-- 4. Add security audit table for tracking authentication attempts
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  user_type text NOT NULL, -- 'admin', 'client', 'super_admin'
  success boolean NOT NULL,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on auth_attempts
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

-- Only super admins can view auth attempts
CREATE POLICY "Super admins can view auth attempts" 
ON public.auth_attempts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.name = current_setting('app.current_user', true) 
    AND admin_auth.role = 'super_admin'
  )
);

-- 5. Create secure super admin credentials table
CREATE TABLE IF NOT EXISTS public.super_admin_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  authorized_username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on super_admin_config
ALTER TABLE public.super_admin_config ENABLE ROW LEVEL SECURITY;

-- Only super admins can access this table
CREATE POLICY "Super admins only" 
ON public.super_admin_config 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_auth 
    WHERE admin_auth.name = current_setting('app.current_user', true) 
    AND admin_auth.role = 'super_admin'
  )
);

-- Insert the authorized super admin (using hashed password)
INSERT INTO public.super_admin_config (authorized_username, password_hash)
VALUES ('Helder', crypt('Hd@123@@', gen_salt('bf', 12)))
ON CONFLICT (authorized_username) DO UPDATE SET
password_hash = EXCLUDED.password_hash,
updated_at = now();
