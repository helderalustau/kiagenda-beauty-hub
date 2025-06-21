
-- Habilitar realtime para a tabela appointments
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Adicionar a tabela appointments à publicação realtime
ALTER publication supabase_realtime ADD TABLE public.appointments;

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_appointments_salon_date_status 
ON public.appointments (salon_id, appointment_date, status);

CREATE INDEX IF NOT EXISTS idx_appointments_client_status 
ON public.appointments (client_id, status);

CREATE INDEX IF NOT EXISTS idx_appointments_status_created 
ON public.appointments (status, created_at);
