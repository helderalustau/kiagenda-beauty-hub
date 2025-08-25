-- Função para sincronizar appointments concluídos com transações financeiras
CREATE OR REPLACE FUNCTION sync_missing_financial_transactions(p_salon_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    missing_count INTEGER := 0;
    appointment_record RECORD;
    transaction_amount DECIMAL(10,2);
    result_json jsonb;
BEGIN
    -- Buscar appointments concluídos sem transações financeiras
    FOR appointment_record IN 
        SELECT a.id, a.appointment_date, a.appointment_time, a.salon_id, a.client_auth_id, a.service_id, a.notes,
               s.price, s.name as service_name, c.name as client_name
        FROM appointments a
        LEFT JOIN financial_transactions ft ON a.id = ft.appointment_id
        LEFT JOIN services s ON a.service_id = s.id  
        LEFT JOIN client_auth c ON a.client_auth_id = c.id
        WHERE a.salon_id = p_salon_id 
        AND a.status = 'completed'
        AND ft.id IS NULL
    LOOP
        transaction_amount := COALESCE(appointment_record.price, 0);
        
        -- Criar transação financeira para o serviço principal
        INSERT INTO public.financial_transactions (
            salon_id, appointment_id, transaction_type, amount, description, category, transaction_date, metadata
        ) VALUES (
            appointment_record.salon_id, 
            appointment_record.id, 
            'income', 
            transaction_amount,
            CONCAT('Serviço: ', COALESCE(appointment_record.service_name, 'Serviço'), ' - Cliente: ', COALESCE(appointment_record.client_name, 'Cliente')),
            'service', 
            appointment_record.appointment_date,
            jsonb_build_object(
                'service_name', appointment_record.service_name, 
                'client_name', appointment_record.client_name, 
                'appointment_id', appointment_record.id, 
                'appointment_date', appointment_record.appointment_date, 
                'auto_generated', true, 
                'sync_generated', true,
                'additional', false
            )
        );
        
        missing_count := missing_count + 1;
        
        -- Processar serviços adicionais se existirem nas notes
        IF appointment_record.notes IS NOT NULL AND position('Serviços Adicionais:' in appointment_record.notes) > 0 THEN
            DECLARE
                services_part TEXT;
                service_matches TEXT[];
                add_name TEXT;
                price_text TEXT;
                price_num NUMERIC;
                pos INTEGER;
            BEGIN
                pos := position('Serviços Adicionais:' in appointment_record.notes);
                services_part := substring(appointment_record.notes from pos + char_length('Serviços Adicionais:'));
                
                -- Extrair serviços adicionais usando regex
                FOR service_matches IN 
                    SELECT regexp_matches(services_part, '([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([0-9\.,]+)\)', 'g')
                LOOP
                    add_name := trim(service_matches[1]);
                    price_text := service_matches[3];
                    price_text := replace(price_text, '.', '');
                    price_text := replace(price_text, ',', '.');
                    price_num := NULLIF(price_text, '')::numeric;
                    
                    IF price_num IS NULL THEN 
                        price_num := 0; 
                    END IF;

                    INSERT INTO public.financial_transactions (
                        salon_id, appointment_id, transaction_type, amount, description, category, transaction_date, metadata
                    ) VALUES (
                        appointment_record.salon_id, 
                        appointment_record.id, 
                        'income', 
                        price_num,
                        CONCAT('Serviço adicional: ', COALESCE(add_name, 'Serviço'), ' - Cliente: ', COALESCE(appointment_record.client_name, 'Cliente')),
                        'service', 
                        appointment_record.appointment_date,
                        jsonb_build_object(
                            'service_name', add_name, 
                            'client_name', appointment_record.client_name, 
                            'appointment_id', appointment_record.id, 
                            'appointment_date', appointment_record.appointment_date, 
                            'auto_generated', true, 
                            'sync_generated', true,
                            'additional', true
                        )
                    );
                    
                    missing_count := missing_count + 1;
                END LOOP;
            END;
        END IF;
    END LOOP;
    
    result_json := jsonb_build_object(
        'success', true,
        'transactions_created', missing_count,
        'message', CONCAT(missing_count, ' transações financeiras foram criadas para sincronizar com appointments concluídos.')
    );
    
    RETURN result_json;
END;
$$;