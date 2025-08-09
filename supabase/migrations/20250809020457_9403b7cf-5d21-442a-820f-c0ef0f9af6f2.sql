-- Create trigger to generate financial transactions when appointments are completed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_generate_financial_transaction'
  ) THEN
    CREATE TRIGGER trg_generate_financial_transaction
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.generate_financial_transaction();
  END IF;
END $$;