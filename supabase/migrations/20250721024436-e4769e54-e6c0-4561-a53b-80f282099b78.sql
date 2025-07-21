-- Corrigir políticas RLS para plan_configurations funcionar com sistema de auth customizado
DROP POLICY IF EXISTS "Super admins can manage plan configurations" ON public.plan_configurations;

-- Criar nova política que funciona com o sistema de auth customizado
CREATE POLICY "Super admins can manage plan configurations" 
ON public.plan_configurations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_auth 
    WHERE admin_auth.role = 'super_admin'
    AND admin_auth.name = current_setting('app.current_user', true)
  )
);

-- Política para permitir leitura geral (necessário para o super admin dashboard)
CREATE POLICY "Allow public read for plan configurations" 
ON public.plan_configurations 
FOR SELECT 
USING (true);