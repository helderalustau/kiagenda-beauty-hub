-- Criar função para limpar dados financeiros de um estabelecimento
CREATE OR REPLACE FUNCTION public.clear_salon_financial_data(p_salon_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    deleted_count INTEGER := 0;
    result_json jsonb;
BEGIN
    -- Deletar todas as transações financeiras do estabelecimento
    DELETE FROM public.financial_transactions 
    WHERE salon_id = p_salon_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Retornar resultado
    result_json := jsonb_build_object(
        'success', true,
        'deleted_transactions', deleted_count,
        'message', CONCAT(deleted_count, ' transações financeiras foram removidas do estabelecimento.')
    );
    
    RETURN result_json;
END;
$function$;