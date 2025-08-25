-- Remover trigger antigo que estava causando duplicações
DROP TRIGGER IF EXISTS appointment_completion_financial_trigger ON appointments;

-- Remover função do trigger antigo
DROP FUNCTION IF EXISTS create_appointment_financial_transaction();

-- Limpar transações duplicadas/zeradas existentes
DELETE FROM financial_transactions 
WHERE salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
AND (amount = 0 OR amount IS NULL);

-- Remover transações duplicadas para o mesmo appointment
DELETE FROM financial_transactions 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY appointment_id ORDER BY created_at DESC) as rn
    FROM financial_transactions 
    WHERE salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
    AND appointment_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);