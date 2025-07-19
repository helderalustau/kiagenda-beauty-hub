-- Criar tabela para solicitações de upgrade de plano
CREATE TABLE public.plan_upgrade_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  salon_name TEXT NOT NULL,
  current_plan TEXT NOT NULL,
  requested_plan TEXT NOT NULL,
  justification TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.plan_upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Política para salões verem suas próprias solicitações
CREATE POLICY "Salons can view their own upgrade requests" 
ON public.plan_upgrade_requests 
FOR SELECT 
USING (
  salon_id IN (
    SELECT salon_id 
    FROM admin_auth 
    WHERE name = current_setting('app.current_user', true)
  )
);

-- Política para salões criarem solicitações
CREATE POLICY "Salons can create upgrade requests" 
ON public.plan_upgrade_requests 
FOR INSERT 
WITH CHECK (
  salon_id IN (
    SELECT salon_id 
    FROM admin_auth 
    WHERE name = current_setting('app.current_user', true)
  )
);

-- Política para super admins gerenciarem todas as solicitações
CREATE POLICY "Super admins can manage all upgrade requests" 
ON public.plan_upgrade_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 
    FROM admin_auth 
    WHERE name = current_setting('app.current_user', true) 
    AND role = 'super_admin'
  )
);

-- Criar índices para performance
CREATE INDEX idx_plan_upgrade_requests_salon_id ON public.plan_upgrade_requests(salon_id);
CREATE INDEX idx_plan_upgrade_requests_status ON public.plan_upgrade_requests(status);
CREATE INDEX idx_plan_upgrade_requests_requested_at ON public.plan_upgrade_requests(requested_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_plan_upgrade_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_upgrade_requests_updated_at
  BEFORE UPDATE ON public.plan_upgrade_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_plan_upgrade_requests_updated_at();