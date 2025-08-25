-- Função para calcular o valor total de um appointment (principal + adicionais)
CREATE OR REPLACE FUNCTION calculate_appointment_total_value(service_price NUMERIC, notes TEXT)
RETURNS NUMERIC AS $$
DECLARE
    total_value NUMERIC := COALESCE(service_price, 0);
    additional_services_text TEXT;
    service_match TEXT;
    price_text TEXT;
    additional_price NUMERIC;
BEGIN
    -- Se não há notes, retorna apenas o preço do serviço principal
    IF notes IS NULL OR notes = '' THEN
        RETURN total_value;
    END IF;
    
    -- Extrair a seção de serviços adicionais
    additional_services_text := substring(notes from 'Serviços Adicionais:\s*(.+?)(?:\n\n|$)');
    
    -- Se não há serviços adicionais, retorna apenas o preço principal
    IF additional_services_text IS NULL THEN
        RETURN total_value;
    END IF;
    
    -- Usar um loop para extrair todos os preços dos serviços adicionais
    FOR service_match IN 
        SELECT unnest(regexp_split_to_array(additional_services_text, '\n'))
    LOOP
        -- Extrair o preço do formato "Nome (Xmin - R$ Y,Z)"
        price_text := substring(service_match from 'R\$\s*([\d,]+(?:\.\d{2})?)');
        
        IF price_text IS NOT NULL THEN
            -- Converter o preço removendo vírgulas
            additional_price := CAST(replace(price_text, ',', '') AS NUMERIC);
            total_value := total_value + additional_price;
            
            -- Log para debug
            RAISE NOTICE 'Serviço adicional encontrado: %, Preço: %', service_match, additional_price;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Valor total calculado: % (Principal: % + Adicionais: %)', 
                 total_value, service_price, (total_value - COALESCE(service_price, 0));
    
    RETURN total_value;
END;
$$ LANGUAGE plpgsql;

-- Função para criar transação financeira quando appointment é concluído
CREATE OR REPLACE FUNCTION create_appointment_financial_transaction()
RETURNS TRIGGER AS $$
DECLARE
    total_amount NUMERIC;
    service_name TEXT;
    client_name TEXT;
    transaction_description TEXT;
BEGIN
    -- Só processar se o status mudou para 'completed'
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        
        -- Buscar dados do serviço
        SELECT s.name, s.price INTO service_name, total_amount
        FROM services s
        WHERE s.id = NEW.service_id;
        
        -- Buscar nome do cliente
        SELECT c.name INTO client_name
        FROM client_auth c
        WHERE c.id = NEW.client_auth_id;
        
        -- Calcular valor total (principal + adicionais)
        total_amount := calculate_appointment_total_value(total_amount, NEW.notes);
        
        -- Criar descrição da transação
        transaction_description := COALESCE(service_name, 'Serviço') || ' - ' || COALESCE(client_name, 'Cliente');
        
        -- Verificar se já existe transação para este appointment
        IF NOT EXISTS (
            SELECT 1 FROM financial_transactions 
            WHERE appointment_id = NEW.id
        ) THEN
            -- Criar nova transação financeira com valor total correto
            INSERT INTO financial_transactions (
                salon_id,
                appointment_id,
                transaction_type,
                amount,
                description,
                category,
                payment_method,
                transaction_date,
                status,
                metadata
            ) VALUES (
                NEW.salon_id,
                NEW.id,
                'income',
                total_amount,
                transaction_description,
                'service',
                'cash',
                NEW.appointment_date,
                'completed',
                jsonb_build_object(
                    'auto_generated', true,
                    'appointment_notes', NEW.notes,
                    'service_price', (SELECT price FROM services WHERE id = NEW.service_id),
                    'total_with_additionals', total_amount
                )
            );
            
            RAISE NOTICE 'Transação financeira criada: % para appointment %', total_amount, NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS appointment_completion_financial_trigger ON appointments;

-- Criar trigger para appointments
CREATE TRIGGER appointment_completion_financial_trigger
    AFTER UPDATE ON appointments
    FOR EACH ROW
    EXECUTE FUNCTION create_appointment_financial_transaction();