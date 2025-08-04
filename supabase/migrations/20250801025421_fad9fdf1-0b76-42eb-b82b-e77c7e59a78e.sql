
-- Criar tabela para logs de atividades do sistema
CREATE TABLE public.system_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- 'client_registration', 'appointment_created', 'appointment_completed', 'admin_login', etc.
  entity_type TEXT NOT NULL, -- 'client', 'appointment', 'admin', 'salon'
  entity_id UUID, -- ID da entidade relacionada
  user_id UUID, -- ID do usuário que executou a ação
  salon_id UUID, -- ID do salão relacionado (quando aplicável)
  title TEXT NOT NULL, -- Título resumido da atividade
  description TEXT, -- Descrição detalhada
  metadata JSONB, -- Dados adicionais em JSON
  ip_address INET, -- IP do usuário
  user_agent TEXT, -- User agent do navegador
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela
ALTER TABLE public.system_activity_logs ENABLE ROW LEVEL SECURITY;

-- Política para super administradores verem todos os logs
CREATE POLICY "Super admins can view all activity logs" 
  ON public.system_activity_logs 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM admin_auth 
    WHERE admin_auth.id = auth.uid() 
    AND admin_auth.role = 'super_admin'
  ));

-- Política para inserção de logs (sistema pode inserir)
CREATE POLICY "System can insert activity logs" 
  ON public.system_activity_logs 
  FOR INSERT 
  WITH CHECK (true);

-- Habilitar realtime para a tabela
ALTER TABLE public.system_activity_logs REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.system_activity_logs;

-- Criar função para registrar atividade
CREATE OR REPLACE FUNCTION public.log_system_activity(
  p_activity_type TEXT,
  p_entity_type TEXT,
  p_entity_id UUID DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_salon_id UUID DEFAULT NULL,
  p_title TEXT DEFAULT '',
  p_description TEXT DEFAULT '',
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.system_activity_logs (
    activity_type,
    entity_type,
    entity_id,
    user_id,
    salon_id,
    title,
    description,
    metadata
  ) VALUES (
    p_activity_type,
    p_entity_type,
    p_entity_id,
    p_user_id,
    p_salon_id,
    p_title,
    p_description,
    p_metadata
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Criar triggers para registrar automaticamente algumas atividades

-- Trigger para novos cadastros de clientes
CREATE OR REPLACE FUNCTION public.log_client_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.log_system_activity(
    'client_registration',
    'client',
    NEW.id,
    NEW.id,
    NULL,
    'Novo cliente cadastrado: ' || NEW.name,
    'Cliente ' || NEW.name || ' (' || COALESCE(NEW.email, NEW.phone, 'Sem contato') || ') realizou cadastro no sistema',
    jsonb_build_object(
      'client_name', NEW.name,
      'client_email', NEW.email,
      'client_phone', NEW.phone,
      'city', NEW.city,
      'state', NEW.state
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_client_registration
  AFTER INSERT ON public.client_auth
  FOR EACH ROW
  EXECUTE FUNCTION public.log_client_registration();

-- Trigger para novos agendamentos
CREATE OR REPLACE FUNCTION public.log_appointment_created()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  salon_name TEXT;
  client_name TEXT;
  service_name TEXT;
BEGIN
  -- Buscar informações relacionadas
  SELECT s.name INTO salon_name FROM public.salons s WHERE s.id = NEW.salon_id;
  SELECT c.name INTO client_name FROM public.client_auth c WHERE c.id = NEW.client_auth_id;
  SELECT srv.name INTO service_name FROM public.services srv WHERE srv.id = NEW.service_id;
  
  PERFORM public.log_system_activity(
    'appointment_created',
    'appointment',
    NEW.id,
    NEW.client_auth_id,
    NEW.salon_id,
    'Agendamento criado: ' || COALESCE(client_name, 'Cliente') || ' → ' || COALESCE(salon_name, 'Salão'),
    'Cliente ' || COALESCE(client_name, 'Desconhecido') || ' agendou ' || COALESCE(service_name, 'serviço') || ' no estabelecimento ' || COALESCE(salon_name, 'Desconhecido') || ' para ' || NEW.appointment_date || ' às ' || NEW.appointment_time,
    jsonb_build_object(
      'salon_name', salon_name,
      'client_name', client_name,
      'service_name', service_name,
      'appointment_date', NEW.appointment_date,
      'appointment_time', NEW.appointment_time,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_appointment_created
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_appointment_created();

-- Trigger para agendamentos concluídos
CREATE OR REPLACE FUNCTION public.log_appointment_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  salon_name TEXT;
  client_name TEXT;
  service_name TEXT;
BEGIN
  -- Só registrar quando status muda para completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Buscar informações relacionadas
    SELECT s.name INTO salon_name FROM public.salons s WHERE s.id = NEW.salon_id;
    SELECT c.name INTO client_name FROM public.client_auth c WHERE c.id = NEW.client_auth_id;
    SELECT srv.name INTO service_name FROM public.services srv WHERE srv.id = NEW.service_id;
    
    PERFORM public.log_system_activity(
      'appointment_completed',
      'appointment',
      NEW.id,
      NEW.client_auth_id,
      NEW.salon_id,
      'Atendimento concluído: ' || COALESCE(client_name, 'Cliente') || ' no ' || COALESCE(salon_name, 'Salão'),
      'Atendimento de ' || COALESCE(service_name, 'serviço') || ' para o cliente ' || COALESCE(client_name, 'Desconhecido') || ' foi concluído no estabelecimento ' || COALESCE(salon_name, 'Desconhecido'),
      jsonb_build_object(
        'salon_name', salon_name,
        'client_name', client_name,
        'service_name', service_name,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_appointment_completed
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.log_appointment_completed();
