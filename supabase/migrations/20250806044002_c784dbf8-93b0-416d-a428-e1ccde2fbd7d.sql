-- Create RLS policies for financial transactions (drop existing first)
DROP POLICY IF EXISTS "Admins can manage their salon financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Super admins can manage all financial transactions" ON public.financial_transactions;

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