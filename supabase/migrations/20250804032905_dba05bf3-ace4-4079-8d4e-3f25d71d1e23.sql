-- Criar tabela de transações financeiras para lançamentos automáticos
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id UUID NOT NULL,
  appointment_id UUID,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'service',
  payment_method TEXT DEFAULT 'cash',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Habilitar RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para transações financeiras
CREATE POLICY "Admins can manage their salon financial transactions" 
ON public.financial_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_auth 
    WHERE admin_auth.salon_id = financial_transactions.salon_id 
    AND admin_auth.id = auth.uid()
  )
);

CREATE POLICY "Super admins can manage all financial transactions" 
ON public.financial_transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM admin_auth 
    WHERE admin_auth.id = auth.uid() 
    AND admin_auth.role = 'super_admin'
  )
);

-- Função para gerar transação financeira automaticamente
CREATE OR REPLACE FUNCTION public.generate_financial_transaction()
RETURNS TRIGGER AS $$
DECLARE
  service_price DECIMAL(10,2);
  service_name TEXT;
  client_name TEXT;
  appointment_date DATE;
BEGIN
  -- Só gerar transação quando o status for alterado para 'completed'
  IF NEW.status = 'completed' AND (OLD.status != 'completed' OR OLD.status IS NULL) THEN
    
    -- Buscar informações do serviço e cliente
    SELECT s.price, s.name, c.name, NEW.appointment_date
    INTO service_price, service_name, client_name, appointment_date
    FROM services s
    LEFT JOIN client_auth c ON c.id = NEW.client_auth_id
    WHERE s.id = NEW.service_id;
    
    -- Criar transação financeira
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
    
    RAISE NOTICE 'Transação financeira criada para agendamento %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar transação automaticamente quando agendamento for concluído
CREATE TRIGGER generate_financial_transaction_on_completion
  AFTER UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_financial_transaction();

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_financial_transactions_updated_at();