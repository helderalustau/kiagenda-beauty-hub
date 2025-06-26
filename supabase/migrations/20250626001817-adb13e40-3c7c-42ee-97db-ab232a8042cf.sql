
-- Função para calcular horários disponíveis de um salão em uma data específica
CREATE OR REPLACE FUNCTION get_available_time_slots(
  p_salon_id UUID,
  p_date DATE
) RETURNS TABLE(time_slot TIME) AS $$
DECLARE
  salon_schedule JSONB;
  day_name TEXT;
  open_time TIME;
  close_time TIME;
  current_slot TIME;
  slot_interval INTERVAL := '30 minutes';
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
  
  -- Gerar todos os slots possíveis
  current_slot := open_time;
  WHILE current_slot < close_time LOOP
    -- Verificar se o slot não está ocupado
    IF NOT EXISTS (
      SELECT 1 FROM appointments 
      WHERE salon_id = p_salon_id 
        AND appointment_date = p_date 
        AND appointment_time = current_slot
        AND status IN ('pending', 'confirmed')
    ) THEN
      -- Se é hoje, verificar se o horário não passou (com margem de 1 hora)
      IF p_date = CURRENT_DATE THEN
        IF current_slot > (CURRENT_TIME + INTERVAL '1 hour') THEN
          time_slot := current_slot;
          RETURN NEXT;
        END IF;
      ELSE
        time_slot := current_slot;
        RETURN NEXT;
      END IF;
    END IF;
    
    current_slot := current_slot + slot_interval;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_appointments_salon_date_time 
ON appointments (salon_id, appointment_date, appointment_time);
