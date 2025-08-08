-- Update trigger function to also generate transactions for additional services listed in appointment notes
CREATE OR REPLACE FUNCTION public.generate_financial_transaction()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  service_price DECIMAL(10,2);
  service_name TEXT;
  client_name TEXT;
  appointment_date DATE;
  pos INTEGER;
  services_part TEXT;
  m TEXT[];
  price_text TEXT;
  price_num NUMERIC;
  add_name TEXT;
BEGIN
  -- Only generate transactions when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    -- Fetch service and client info for the main service
    SELECT s.price, s.name, c.name, NEW.appointment_date
    INTO service_price, service_name, client_name, appointment_date
    FROM services s
    LEFT JOIN client_auth c ON c.id = NEW.client_auth_id
    WHERE s.id = NEW.service_id;

    -- Create transaction for the main service
    INSERT INTO public.financial_transactions (
      salon_id,
      appointment_id,
      transaction_type,
      amount,
      description,
      category,
      transaction_date,
      metadata
    ) VALUES (
      NEW.salon_id,
      NEW.id,
      'income',
      COALESCE(service_price, 0),
      CONCAT('Serviço: ', COALESCE(service_name, 'Serviço'), ' - Cliente: ', COALESCE(client_name, 'Cliente')),
      'service',
      appointment_date,
      jsonb_build_object(
        'service_name', service_name,
        'client_name', client_name,
        'appointment_id', NEW.id,
        'appointment_date', appointment_date,
        'auto_generated', true,
        'additional', false
      )
    );

    -- Parse and create transactions for additional services from NEW.notes
    IF NEW.notes IS NOT NULL THEN
      pos := strpos(NEW.notes, 'Serviços Adicionais:');
      IF pos > 0 THEN
        services_part := substring(NEW.notes from pos + char_length('Serviços Adicionais:'));
        FOR m IN
          SELECT regexp_matches(services_part, '([^(]+)\s*\((\d+)min\s*-\s*R\$\s*([0-9\.,]+)\)', 'g')
        LOOP
          add_name := trim(m[1]);
          price_text := m[3];
          -- Normalize Brazilian currency formats to numeric
          price_text := replace(price_text, '.', '');
          price_text := replace(price_text, ',', '.');
          price_num := NULLIF(price_text, '')::numeric;
          IF price_num IS NULL THEN
            price_num := 0;
          END IF;

          INSERT INTO public.financial_transactions (
            salon_id,
            appointment_id,
            transaction_type,
            amount,
            description,
            category,
            transaction_date,
            metadata
          ) VALUES (
            NEW.salon_id,
            NEW.id,
            'income',
            price_num,
            CONCAT('Serviço adicional: ', COALESCE(add_name, 'Serviço'), ' - Cliente: ', COALESCE(client_name, 'Cliente')),
            'service',
            appointment_date,
            jsonb_build_object(
              'service_name', add_name,
              'client_name', client_name,
              'appointment_id', NEW.id,
              'appointment_date', appointment_date,
              'auto_generated', true,
              'additional', true
            )
          );
        END LOOP;
      END IF;
    END IF;

    RAISE NOTICE 'Transações financeiras criadas para agendamento %', NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;