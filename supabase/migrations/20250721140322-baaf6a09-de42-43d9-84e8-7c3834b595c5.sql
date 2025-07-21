
-- Criar função para deletar estabelecimentos sem setup completo
CREATE OR REPLACE FUNCTION public.cleanup_incomplete_salons()
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deletar estabelecimentos que não completaram o setup
  DELETE FROM public.salons 
  WHERE setup_completed = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
