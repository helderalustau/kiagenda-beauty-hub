
-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admin_auth;
DROP POLICY IF EXISTS "Users can insert admin records" ON public.admin_auth;
DROP POLICY IF EXISTS "Users can update their own admin record" ON public.admin_auth;
DROP POLICY IF EXISTS "Users can delete their own admin record" ON public.admin_auth;

DROP POLICY IF EXISTS "Users can view their own client record" ON public.client_auth;
DROP POLICY IF EXISTS "Users can insert client records" ON public.client_auth;
DROP POLICY IF EXISTS "Users can update their own client record" ON public.client_auth;
DROP POLICY IF EXISTS "Users can delete their own client record" ON public.client_auth;

-- Criar políticas simples para admin_auth usando apenas dados da linha
CREATE POLICY "Allow all admin_auth operations" 
ON public.admin_auth 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Criar políticas simples para client_auth usando apenas dados da linha
CREATE POLICY "Allow all client_auth operations" 
ON public.client_auth 
FOR ALL 
USING (true)
WITH CHECK (true);
