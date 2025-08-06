-- Ensure financial_transactions table exists with all necessary fields
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salon_id UUID NOT NULL,
  appointment_id UUID,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'service',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for financial transactions
CREATE POLICY IF NOT EXISTS "Admins can manage their salon financial transactions"
ON public.financial_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_auth 
    WHERE admin_auth.salon_id = financial_transactions.salon_id 
    AND admin_auth.id = auth.uid()
  )
);

CREATE POLICY IF NOT EXISTS "Super admins can manage all financial transactions"
ON public.financial_transactions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_auth 
    WHERE admin_auth.id = auth.uid() 
    AND admin_auth.role = 'super_admin'
  )
);

-- Create trigger function to automatically generate financial transactions when appointments are completed
CREATE OR REPLACE FUNCTION public.generate_financial_transaction()
RETURNS TRIGGER AS $$
DECLARE
  service_price DECIMAL(10,2);
  service_name TEXT;
  client_name TEXT;
  appointment_date DATE;
BEGIN
  -- Only generate transaction when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    
    -- Get service and client information
    SELECT s.price, s.name, c.name, NEW.appointment_date
    INTO service_price, service_name, client_name, appointment_date
    FROM services s
    LEFT JOIN client_auth c ON c.id = NEW.client_auth_id
    WHERE s.id = NEW.service_id;
    
    -- Create financial transaction
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
        'auto_generated', true
      )
    );
    
    RAISE NOTICE 'Financial transaction created for appointment %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_generate_financial_transaction ON public.appointments;
CREATE TRIGGER trigger_generate_financial_transaction
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_financial_transaction();

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating updated_at
DROP TRIGGER IF EXISTS trigger_update_financial_transactions_updated_at ON public.financial_transactions;
CREATE TRIGGER trigger_update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_financial_transactions_updated_at();