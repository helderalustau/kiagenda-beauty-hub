-- Atualizar todos os agendamentos confirmados restantes para concluído
UPDATE public.appointments 
SET 
  status = 'completed',
  updated_at = now()
WHERE 
  salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008' 
  AND status = 'confirmed' 
  AND deleted_at IS NULL;

-- Criar uma transação financeira para o agendamento que foi concluído
INSERT INTO public.financial_transactions (
  salon_id,
  amount,
  transaction_type,
  transaction_date,
  category,
  description,
  payment_method,
  status,
  appointment_id,
  metadata
)
SELECT 
  a.salon_id,
  s.price,
  'income',
  CURRENT_DATE,
  'service',
  CONCAT('Atendimento: ', s.name, ' - Cliente: ', c.name),
  'cash',
  'completed',
  a.id,
  jsonb_build_object(
    'service_name', s.name,
    'client_name', c.name,
    'completion_date', now(),
    'auto_generated', true
  )
FROM public.appointments a
JOIN public.services s ON a.service_id = s.id
JOIN public.client_auth c ON a.client_auth_id = c.id
WHERE 
  a.salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008' 
  AND a.status = 'completed' 
  AND a.id = '11ce0723-aab9-4ddf-a7f9-699743035a61'
  AND NOT EXISTS (
    SELECT 1 FROM public.financial_transactions ft 
    WHERE ft.appointment_id = a.id
  );

-- Verificar quantos registros foram atualizados
SELECT 
  COUNT(*) as appointments_completed,
  COUNT(DISTINCT ft.id) as financial_records_created
FROM public.appointments a
LEFT JOIN public.financial_transactions ft ON a.id = ft.appointment_id
WHERE 
  a.salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008' 
  AND a.status = 'completed' 
  AND a.updated_at > (now() - INTERVAL '5 minutes');