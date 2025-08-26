-- Função para limpar todos os atendimentos de um estabelecimento
CREATE OR REPLACE FUNCTION public.clear_salon_appointments_history(p_salon_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
    deleted_count INTEGER := 0;
    result_json jsonb;
BEGIN
    -- Deletar todos os agendamentos do estabelecimento
    DELETE FROM public.appointments 
    WHERE salon_id = p_salon_id;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Retornar resultado
    result_json := jsonb_build_object(
        'success', true,
        'deleted_appointments', deleted_count,
        'message', CONCAT(deleted_count, ' atendimentos foram removidos do histórico do estabelecimento.')
    );
    
    RETURN result_json;
END;
$function$;