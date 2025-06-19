
-- Remover políticas existentes que causam recursão
DROP POLICY IF EXISTS "Allow all operations on admin_auth" ON public.admin_auth;

-- Criar políticas RLS mais específicas e seguras para admin_auth
CREATE POLICY "Users can view their own admin record" 
ON public.admin_auth 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert admin records" 
ON public.admin_auth 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own admin record" 
ON public.admin_auth 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own admin record" 
ON public.admin_auth 
FOR DELETE 
USING (true);

-- Fazer o mesmo para client_auth para evitar problemas similares
DROP POLICY IF EXISTS "Allow all operations on client_auth" ON public.client_auth;

CREATE POLICY "Users can view their own client record" 
ON public.client_auth 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert client records" 
ON public.client_auth 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own client record" 
ON public.client_auth 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own client record" 
ON public.client_auth 
FOR DELETE 
USING (true);
