
-- Criar tabela para configurações de planos editáveis
CREATE TABLE public.plan_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type TEXT NOT NULL UNIQUE CHECK (plan_type IN ('bronze', 'prata', 'gold')),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão dos planos
INSERT INTO public.plan_configurations (plan_type, name, price, description) VALUES
('bronze', 'Bronze', 29.90, 'Plano básico com funcionalidades essenciais'),
('prata', 'Prata', 59.90, 'Plano intermediário com recursos avançados'),
('gold', 'Gold', 99.90, 'Plano premium com todas as funcionalidades');

-- Adicionar coluna deleted_at para soft delete nos agendamentos
ALTER TABLE public.appointments ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE NULL;

-- Criar índice para melhorar performance nas consultas de agendamentos não deletados
CREATE INDEX idx_appointments_not_deleted ON public.appointments (salon_id, deleted_at) WHERE deleted_at IS NULL;

-- Criar índice para agendamentos deletados
CREATE INDEX idx_appointments_deleted ON public.appointments (salon_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- Função para excluir estabelecimentos sem administradores vinculados
CREATE OR REPLACE FUNCTION public.cleanup_salons_without_admins()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deletar estabelecimentos que não têm administradores vinculados
  DELETE FROM public.salons 
  WHERE id NOT IN (
    SELECT DISTINCT salon_id 
    FROM public.admin_auth 
    WHERE salon_id IS NOT NULL
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
