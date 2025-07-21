-- Atualizar valores padrão corretos para cada plano
UPDATE public.plan_configurations 
SET 
  max_appointments = CASE 
    WHEN plan_type = 'bronze' THEN 50
    WHEN plan_type = 'prata' THEN 150
    WHEN plan_type = 'gold' THEN 500
    ELSE max_appointments
  END,
  max_attendants = CASE 
    WHEN plan_type = 'bronze' THEN 1
    WHEN plan_type = 'prata' THEN 3
    WHEN plan_type = 'gold' THEN 10
    ELSE max_attendants
  END;