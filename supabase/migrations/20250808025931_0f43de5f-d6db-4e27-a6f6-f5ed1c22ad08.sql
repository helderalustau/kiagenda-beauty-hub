-- Debug: Verificar e testar update de agendamento específico
DO $$
DECLARE
    appointment_record RECORD;
    update_result RECORD;
BEGIN
    -- Verificar o agendamento atual
    SELECT id, status, appointment_date, appointment_time, salon_id, client_auth_id
    INTO appointment_record
    FROM public.appointments 
    WHERE id = 'e5312808-5203-4ce1-bc29-58c88e221730';
    
    RAISE NOTICE 'Agendamento encontrado: ID=%, Status=%, Data=%, Hora=%', 
        appointment_record.id, appointment_record.status, 
        appointment_record.appointment_date, appointment_record.appointment_time;
    
    -- Tentar atualizar o status
    UPDATE public.appointments 
    SET 
        status = 'completed',
        updated_at = now()
    WHERE 
        id = 'e5312808-5203-4ce1-bc29-58c88e221730'
        AND salon_id = '155169d2-cf64-4a26-bae3-280cf5a60008'
    RETURNING id, status, updated_at INTO update_result;
    
    IF update_result.id IS NOT NULL THEN
        RAISE NOTICE 'Agendamento atualizado com sucesso: ID=%, Novo Status=%, Updated_at=%',
            update_result.id, update_result.status, update_result.updated_at;
    ELSE
        RAISE NOTICE 'FALHA: Nenhum registro foi atualizado';
    END IF;
    
    -- Verificar a transação financeira
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
        CONCAT('TESTE - Atendimento: ', s.name, ' - Cliente: ', c.name),
        'cash',
        'completed',
        a.id,
        jsonb_build_object(
            'service_name', s.name,
            'client_name', c.name,
            'completion_date', now(),
            'test_transaction', true
        )
    FROM public.appointments a
    JOIN public.services s ON a.service_id = s.id
    JOIN public.client_auth c ON a.client_auth_id = c.id
    WHERE 
        a.id = 'e5312808-5203-4ce1-bc29-58c88e221730'
        AND NOT EXISTS (
            SELECT 1 FROM public.financial_transactions ft 
            WHERE ft.appointment_id = a.id
        );
        
    RAISE NOTICE 'Processo de teste concluído';
END $$;