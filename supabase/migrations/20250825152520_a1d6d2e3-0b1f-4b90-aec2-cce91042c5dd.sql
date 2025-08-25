-- Finalizar appointments confirmados antigos (mais de 7 dias atrás)
UPDATE appointments 
SET status = 'completed', 
    updated_at = now()
WHERE salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
AND status = 'confirmed'
AND appointment_date < CURRENT_DATE - INTERVAL '7 days';

-- Criar função para automaticamente completar appointments antigos
CREATE OR REPLACE FUNCTION auto_complete_old_appointments()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
    completed_count INTEGER := 0;
BEGIN
    -- Completar appointments confirmados que passaram há mais de 1 dia
    UPDATE appointments 
    SET status = 'completed', 
        updated_at = now()
    WHERE status = 'confirmed'
    AND appointment_date < CURRENT_DATE - INTERVAL '1 day'
    AND appointment_time < CURRENT_TIME;
    
    GET DIAGNOSTICS completed_count = ROW_COUNT;
    
    RETURN completed_count;
END;
$$;