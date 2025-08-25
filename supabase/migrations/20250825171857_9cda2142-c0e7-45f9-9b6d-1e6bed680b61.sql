-- Limpar transações duplicadas (manter apenas a mais recente de cada grupo)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY appointment_id, amount, description, metadata->>'service_name'
      ORDER BY created_at DESC
    ) as rn
  FROM financial_transactions 
  WHERE salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
    AND metadata->>'auto_generated' = 'true'
)
DELETE FROM financial_transactions 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);