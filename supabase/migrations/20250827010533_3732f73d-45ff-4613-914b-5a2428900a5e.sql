-- Remover qualquer trigger restante que possa estar criando transações financeiras duplicadas

-- Primeiro verificar se existe o trigger generate_financial_transaction_on_completion
DROP TRIGGER IF EXISTS generate_financial_transaction_on_completion ON public.appointments;

-- Verificar se existe o trigger que foi atualizado
DROP TRIGGER IF EXISTS update_financial_transactions_trigger ON public.appointments;

-- Verificar se existe qualquer outro trigger relacionado a financial
DROP TRIGGER IF EXISTS financial_transaction_trigger ON public.appointments;

-- Verificar se existe a função generate_financial_transaction e removê-la se ainda existir
DROP FUNCTION IF EXISTS public.generate_financial_transaction() CASCADE;