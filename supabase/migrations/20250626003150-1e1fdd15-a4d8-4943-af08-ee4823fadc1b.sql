
-- Atualizar a função para considerar a duração do serviço
DROP FUNCTION IF EXISTS get_available_time_slots(UUID, DATE);

CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_salon_id UUID,
  p_date DATE,
  p_service_id UUID DEFAULT NULL
) RETURNS TABLE(time_slot TIME) AS $$
DECLARE
  salon_schedule JSONB;
  day_name TEXT;
  open_time TIME;
  close_time TIME;
  current_slot TIME;
  service_duration INTEGER := 30; -- padrão 30 minutos
  slot_interval INTERVAL;
BEGIN
  -- Obter o nome do dia da semana
  day_name := CASE EXTRACT(DOW FROM p_date)
    WHEN 0 THEN 'sunday'
    WHEN 1 THEN 'monday'
    WHEN 2 THEN 'tuesday'
    WHEN 3 THEN 'wednesday'
    WHEN 4 THEN 'thursday'
    WHEN 5 THEN 'friday'
    WHEN 6 THEN 'saturday'
  END;
  
  -- Buscar horário de funcionamento do salão
  SELECT opening_hours INTO salon_schedule
  FROM salons 
  WHERE id = p_salon_id AND is_open = true;
  
  -- Verificar se o salão existe e está aberto
  IF salon_schedule IS NULL THEN
    RETURN;
  END IF;
  
  -- Extrair horários de abertura e fechamento para o dia
  open_time := (salon_schedule->day_name->>'open')::TIME;
  close_time := (salon_schedule->day_name->>'close')::TIME;
  
  -- Verificar se o salão está fechado neste dia
  IF (salon_schedule->day_name->>'closed')::BOOLEAN = true OR 
     open_time IS NULL OR close_time IS NULL THEN
    RETURN;
  END IF;
  
  -- Buscar duração do serviço se fornecido
  IF p_service_id IS NOT NULL THEN
    SELECT duration_minutes INTO service_duration
    FROM services 
    WHERE id = p_service_id AND salon_id = p_salon_id AND active = true;
    
    -- Se serviço não encontrado, usar duração padrão
    IF service_duration IS NULL THEN
      service_duration := 30;
    END IF;
  END IF;
  
  -- Definir intervalo baseado na duração do serviço
  slot_interval := (service_duration || ' minutes')::INTERVAL;
  
  -- Gerar slots baseados na duração do serviço
  current_slot := open_time;
  WHILE (current_slot + slot_interval) <= close_time LOOP
    -- Verificar se há conflito com agendamentos existentes
    IF NOT EXISTS (
      SELECT 1 FROM appointments a
      JOIN services s ON a.service_id = s.id
      WHERE a.salon_id = p_salon_id 
        AND a.appointment_date = p_date 
        AND a.status IN ('pending', 'confirmed')
        AND (
          -- Novo agendamento começaria durante um existente
          (current_slot >= a.appointment_time AND 
           current_slot < (a.appointment_time + (s.duration_minutes || ' minutes')::INTERVAL))
          OR
          -- Novo agendamento terminaria durante um existente
          ((current_slot + slot_interval) > a.appointment_time AND 
           (current_slot + slot_interval) <= (a.appointment_time + (s.duration_minutes || ' minutes')::INTERVAL))
          OR
          -- Novo agendamento englobaria um existente
          (current_slot <= a.appointment_time AND 
           (current_slot + slot_interval) >= (a.appointment_time + (s.duration_minutes || ' minutes')::INTERVAL))
        )
    ) THEN
      -- Se é hoje, verificar se o horário não passou (com margem de 1 hora)
      IF p_date = CURRENT_DATE THEN
        IF current_slot >= (CURRENT_TIME + INTERVAL '1 hour') THEN
          time_slot := current_slot;
          RETURN NEXT;
        END IF;
      ELSE
        time_slot := current_slot;
        RETURN NEXT;
      END IF;
    END IF;
    
    -- Avançar para próximo slot (sempre 30 minutos para dar flexibilidade)
    current_slot := current_slot + INTERVAL '30 minutes';
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;
