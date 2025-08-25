import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, startOfMonth, endOfMonth, subMonths, isSameDay, subDays } from 'date-fns';

interface FinancialTransaction {
  id: string;
  salon_id: string;
  appointment_id?: string | null;
  transaction_type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  payment_method: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: string;
  salon_id: string;
  status: string;
  appointment_date: string;
  appointment_time: string;
  service?: {
    name: string;
    price: number;
  };
  client?: {
    name: string;
  };
}

interface FinancialMetrics {
  // Receitas
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  pendingRevenue: number;
  
  // Despesas
  totalExpenses: number;
  monthExpenses: number;
  
  // Lucro
  netProfit: number;
  monthNetProfit: number;
  
  // Contadores
  totalTransactions: number;
  completedAppointments: number;
  pendingAppointments: number;
  
  // Médias
  averageTicket: number;
  dailyAverageRevenue: number;
  
  // Crescimento
  monthlyGrowth: number;
}

export const useFinancialData = (salonId: string) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Buscar transações financeiras
  const fetchTransactions = async () => {
    if (!salonId) {
      console.log('🔴 FinancialData - SalonId não fornecido');
      return;
    }

    try {
      console.log('💰 FinancialData - Buscando transações para salon:', salonId);
      
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .eq('salon_id', salonId)
        .order('transaction_date', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar transações:', error);
        throw error;
      }

      const transactionsData = (data || []) as FinancialTransaction[];
      setTransactions(transactionsData);
      
      console.log('✅ Transações carregadas:', {
        total: transactionsData.length,
        income: transactionsData.filter(t => t.transaction_type === 'income').length,
        expense: transactionsData.filter(t => t.transaction_type === 'expense').length,
        completed: transactionsData.filter(t => t.status === 'completed').length
      });

    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros",
        variant: "destructive"
      });
    }
  };

  // Buscar appointments para verificação
  const fetchAppointments = async () => {
    if (!salonId) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          salon_id,
          status,
          appointment_date,
          appointment_time,
          service:services(name, price),
          client:client_auth(name)
        `)
        .eq('salon_id', salonId)
        .in('status', ['pending', 'confirmed', 'completed']);

      if (error) {
        console.error('❌ Erro ao buscar appointments:', error);
        return;
      }

      const appointmentsData = (data || []) as Appointment[];
      setAppointments(appointmentsData);
      
      console.log('✅ Appointments carregados:', {
        total: appointmentsData.length,
        completed: appointmentsData.filter(a => a.status === 'completed').length,
        confirmed: appointmentsData.filter(a => a.status === 'confirmed').length,
        pending: appointmentsData.filter(a => a.status === 'pending').length
      });

    } catch (error) {
      console.error('❌ Erro ao carregar appointments:', error);
    }
  };

  // Calcular métricas financeiras precisas
  const metrics: FinancialMetrics = useMemo(() => {
    const now = new Date();
    const today = format(now, 'yyyy-MM-dd');
    const currentMonth = startOfMonth(now);
    const lastMonth = subMonths(currentMonth, 1);

    console.log('🧮 Calculando métricas financeiras...', {
      totalTransactions: transactions.length,
      totalAppointments: appointments.length,
      today,
      currentMonth: format(currentMonth, 'yyyy-MM-dd'),
      lastMonth: format(lastMonth, 'yyyy-MM-dd')
    });

    // Filtrar transações concluídas
    const completedTransactions = transactions.filter(t => t.status === 'completed');
    const incomeTransactions = completedTransactions.filter(t => t.transaction_type === 'income');
    const expenseTransactions = completedTransactions.filter(t => t.transaction_type === 'expense');

    // Receitas
    const totalRevenue = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const todayRevenue = incomeTransactions
      .filter(t => t.transaction_date === today)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const monthRevenue = incomeTransactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= currentMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const lastMonthRevenue = incomeTransactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= lastMonth && transactionDate < currentMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Receita pendente (appointments confirmados sem transação)
    const confirmedAppointments = appointments.filter(a => a.status === 'confirmed');
    const pendingRevenue = confirmedAppointments
      .filter(a => !transactions.some(t => t.appointment_id === a.id))
      .reduce((sum, a) => sum + Number(a.service?.price || 0), 0);

    // Despesas
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const monthExpenses = expenseTransactions
      .filter(t => {
        const transactionDate = new Date(t.transaction_date);
        return transactionDate >= currentMonth;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Lucro
    const netProfit = totalRevenue - totalExpenses;
    const monthNetProfit = monthRevenue - monthExpenses;

    // Contadores
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    const pendingAppointments = appointments.filter(a => a.status === 'pending').length;

    // Médias
    const averageTicket = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;
    const daysInOperation = Math.max(1, Math.ceil((now.getTime() - currentMonth.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyAverageRevenue = monthRevenue / daysInOperation;

    // Crescimento mensal
    const monthlyGrowth = lastMonthRevenue > 0 
      ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : monthRevenue > 0 ? 100 : 0;

    const calculatedMetrics = {
      totalRevenue,
      todayRevenue,
      monthRevenue,
      pendingRevenue,
      totalExpenses,
      monthExpenses,
      netProfit,
      monthNetProfit,
      totalTransactions: transactions.length,
      completedAppointments,
      pendingAppointments,
      averageTicket,
      dailyAverageRevenue,
      monthlyGrowth
    };

    console.log('✅ Métricas calculadas:', calculatedMetrics);
    return calculatedMetrics;
  }, [transactions, appointments]);

  // Sincronizar dados quando necessário
  const syncData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTransactions(),
        fetchAppointments()
      ]);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  // Configurar atualização em tempo real
  useEffect(() => {
    if (!salonId) return;

    // Carregar dados iniciais
    syncData();

    // Configurar canal de tempo real para transações
    const transactionsChannel = supabase
      .channel(`financial-transactions-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'financial_transactions',
          filter: `salon_id=eq.${salonId}`
        },
        (payload) => {
          console.log('🔄 Transação atualizada em tempo real:', payload);
          fetchTransactions();
        }
      )
      .subscribe();

    // Configurar canal de tempo real para appointments
    const appointmentsChannel = supabase
      .channel(`appointments-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        (payload) => {
          console.log('🔄 Appointment atualizado em tempo real:', payload);
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(appointmentsChannel);
    };
  }, [salonId]);

  return {
    transactions,
    appointments,
    metrics,
    loading,
    lastUpdate,
    syncData,
    fetchTransactions,
    fetchAppointments
  };
};