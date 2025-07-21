-- Adicionar campos que faltam na tabela plan_configurations
ALTER TABLE public.plan_configurations 
ADD COLUMN IF NOT EXISTS max_appointments INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS max_attendants INTEGER DEFAULT 1;

-- Atualizar valores padrão baseados no tipo de plano
UPDATE public.plan_configurations 
SET 
  max_appointments = CASE 
    WHEN plan_type = 'bronze' THEN 50
    WHEN plan_type = 'prata' THEN 150
    WHEN plan_type = 'gold' THEN 500
    ELSE 100
  END,
  max_attendants = CASE 
    WHEN plan_type = 'bronze' THEN 1
    WHEN plan_type = 'prata' THEN 3
    WHEN plan_type = 'gold' THEN 10
    ELSE 1
  END
WHERE max_appointments IS NULL OR max_attendants IS NULL;