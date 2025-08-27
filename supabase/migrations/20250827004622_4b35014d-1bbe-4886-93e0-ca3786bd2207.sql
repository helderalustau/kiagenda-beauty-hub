-- Remover trigger que duplica transações financeiras
DROP TRIGGER IF EXISTS generate_financial_transaction_trigger ON appointments;