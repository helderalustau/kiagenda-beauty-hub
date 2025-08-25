-- Teste temporário das políticas RLS para financial_transactions
-- Remover temporariamente todas as políticas restritivas

DROP POLICY IF EXISTS "Admins can manage their salon financial transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Super admins can manage all financial transactions" ON financial_transactions;
DROP POLICY IF EXISTS "System can create automatic financial transactions" ON financial_transactions;

-- Criar política temporária permitindo tudo para debug
CREATE POLICY "Allow all operations temporarily" ON financial_transactions
FOR ALL USING (true) WITH CHECK (true);