import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialTransaction {
  id: string;
  salon_id: string;
  appointment_id?: string | null;
  transaction_type: string; // Will be 'income' | 'expense' from DB
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  transaction_date: string;
  status: string; // Will be 'pending' | 'completed' | 'cancelled' from DB
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface UseFinancialTransactionsProps {
  salonId: string;
}

export const useFinancialTransactions = ({ salonId }: UseFinancialTransactionsProps) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async () => {
    if (!salonId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar transações financeiras:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados financeiros",
          variant: "destructive"
        });
      } else {
        setTransactions((data || []) as FinancialTransaction[]);
        console.log('💰 Transações financeiras carregadas:', data?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao processar transações:', error);
    } finally {
      setLoading(false);
    }
  }, [salonId, toast]);

  const createTransaction = useCallback(async (transactionData: {
    transaction_type: 'income' | 'expense';
    amount: number;
    description: string;
    category?: string;
    payment_method?: string;
    transaction_date?: string;
    status?: 'pending' | 'completed' | 'cancelled';
    metadata?: any;
    appointment_id?: string;
  }) => {
    if (!salonId) return { success: false, message: 'Salon ID não encontrado' };

    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .insert([{
          salon_id: salonId,
          transaction_type: transactionData.transaction_type,
          amount: transactionData.amount,
          description: transactionData.description,
          category: transactionData.category || 'service',
          payment_method: transactionData.payment_method || 'cash',
          transaction_date: transactionData.transaction_date || new Date().toISOString().split('T')[0],
          status: transactionData.status || 'completed',
          metadata: transactionData.metadata || {},
          appointment_id: transactionData.appointment_id || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar transação:', error);
        return { success: false, message: error.message };
      }

      setTransactions(prev => [data as FinancialTransaction, ...prev]);
      console.log('✅ Transação financeira criada:', data);
      
      toast({
        title: "Sucesso",
        description: "Transação registrada com sucesso",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      return { success: false, message: 'Erro inesperado' };
    }
  }, [salonId, toast]);

  const updateTransaction = useCallback(async (transactionId: string, updates: Partial<FinancialTransaction>) => {
    try {
      const { data, error } = await supabase
        .from('financial_transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar transação:', error);
        return { success: false, message: error.message };
      }

      setTransactions(prev => prev.map(t => t.id === transactionId ? data as FinancialTransaction : t));
      console.log('✅ Transação atualizada:', data);

      return { success: true, data };
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      return { success: false, message: 'Erro inesperado' };
    }
  }, []);

  // Setup realtime subscription for financial transactions
  useEffect(() => {
    if (!salonId) return;

    const channel = supabase
      .channel(`financial-transactions-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'financial_transactions',
          filter: `salon_id=eq.${salonId}`
        },
        (payload) => {
          console.log('💰 Nova transação financeira detectada:', payload);
          const newTransaction = payload.new as FinancialTransaction;
          setTransactions(prev => [newTransaction, ...prev]);
          
          // Mostrar notificação apenas para transações automáticas
          if (newTransaction.metadata?.auto_generated) {
            toast({
              title: "💰 Receita Registrada",
              description: `Nova receita de R$ ${newTransaction.amount.toFixed(2)} foi registrada automaticamente`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [salonId, toast]);

  // Load transactions on mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Calculate financial metrics
  const financialMetrics = {
    totalRevenue: transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    
    totalExpenses: transactions
      .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    
    pendingRevenue: transactions
      .filter(t => t.transaction_type === 'income' && t.status === 'pending')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    
    transactionsCount: transactions.length,
    
    todayRevenue: transactions
      .filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return t.transaction_type === 'income' && 
               t.status === 'completed' && 
               t.transaction_date === today;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0)
  };

  return {
    transactions,
    loading,
    financialMetrics,
    fetchTransactions,
    createTransaction,
    updateTransaction
  };
};