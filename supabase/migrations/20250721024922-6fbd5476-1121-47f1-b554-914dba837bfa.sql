-- Remover a política restritiva e criar uma política mais abrangente para atualizações
DROP POLICY IF EXISTS "Super admins can manage plan configurations" ON public.plan_configurations;

-- Política que permite atualizações a qualquer usuário (sistema interno)
CREATE POLICY "Allow all operations for plan configurations" 
ON public.plan_configurations 
FOR ALL 
USING (true)
WITH CHECK (true);