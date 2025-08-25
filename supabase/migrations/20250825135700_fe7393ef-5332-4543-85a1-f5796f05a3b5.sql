-- Check if trigger exists for financial transactions on appointment completion
SELECT EXISTS (
  SELECT 1 FROM pg_trigger 
  WHERE tgname = 'trg_generate_financial_transaction'
);

-- Create the trigger for generating financial transactions when appointment is completed
CREATE OR REPLACE TRIGGER trg_generate_financial_transaction
    AFTER UPDATE ON public.appointments
    FOR EACH ROW
    EXECUTE FUNCTION generate_financial_transaction();