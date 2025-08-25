-- Limpar transações duplicadas para o mesmo appointment
DELETE FROM financial_transactions 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY appointment_id, amount ORDER BY created_at DESC) as rn
    FROM financial_transactions 
    WHERE salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
    AND appointment_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Atualizar receitas consolidadas
UPDATE financial_transactions 
SET metadata = jsonb_set(
  metadata, 
  '{consolidated}', 
  'true'
)
WHERE salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
AND appointment_id IS NOT NULL;