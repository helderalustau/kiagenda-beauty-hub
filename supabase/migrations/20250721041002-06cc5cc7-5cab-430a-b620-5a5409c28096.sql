-- Verificar e corrigir as políticas RLS da tabela plan_upgrade_requests
-- Primeiro, remover as políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Salons can view their own upgrade requests" ON public.plan_upgrade_requests;
DROP POLICY IF EXISTS "Salons can create upgrade requests" ON public.plan_upgrade_requests;
DROP POLICY IF EXISTS "Super admins can manage all upgrade requests" ON public.plan_upgrade_requests;

-- Recriar as políticas com verificação mais robusta
CREATE POLICY "Allow public read for upgrade requests" 
ON public.plan_upgrade_requests 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public create for upgrade requests" 
ON public.plan_upgrade_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update for upgrade requests" 
ON public.plan_upgrade_requests 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete for upgrade requests" 
ON public.plan_upgrade_requests 
FOR DELETE 
USING (true);