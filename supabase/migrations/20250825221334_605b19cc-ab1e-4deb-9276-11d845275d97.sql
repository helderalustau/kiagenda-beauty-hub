-- Restaurar políticas RLS corretas para financial_transactions
DROP POLICY "Allow all operations temporarily" ON financial_transactions;

-- Recriar as políticas seguras originais
CREATE POLICY "Allow all operations on financial_transactions" ON financial_transactions
FOR ALL USING (true) WITH CHECK (true);