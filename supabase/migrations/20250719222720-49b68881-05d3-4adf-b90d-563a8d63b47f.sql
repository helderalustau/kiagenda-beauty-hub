-- Criar função para facilitar inserção de solicitações de upgrade
CREATE OR REPLACE FUNCTION public.create_plan_upgrade_request(
  p_salon_id UUID,
  p_salon_name TEXT,
  p_current_plan TEXT,
  p_requested_plan TEXT,
  p_justification TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_id UUID;
BEGIN
  INSERT INTO public.plan_upgrade_requests (
    salon_id,
    salon_name,
    current_plan,
    requested_plan,
    justification,
    status
  ) VALUES (
    p_salon_id,
    p_salon_name,
    p_current_plan,
    p_requested_plan,
    p_justification,
    'pending'
  ) RETURNING id INTO request_id;
  
  RETURN request_id;
END;
$$;