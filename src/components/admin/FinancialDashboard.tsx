
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Appointment } from '@/types/supabase-entities';
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth, isSameDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import FinancialMetricsCards from './financial/FinancialMetricsCards';
import FinancialFilters from './financial/FinancialFilters';
import CleanFinancialCharts from './financial/CleanFinancialCharts';
import DailySummaryCard from './financial/DailySummaryCard';
import { useToast } from "@/hooks/use-toast";
import { useFinancialTransactions } from '@/hooks/useFinancialTransactions';

interface FinancialDashboardProps {
  appointments: Appointment[];
}

const FinancialDashboard = ({ appointments }: FinancialDashboardProps) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedService, setSelectedService] = useState('all');

  // Get salon ID for financial transactions
  const getSalonId = () => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth) {
      try {
        const admin = JSON.parse(adminAuth);
        return admin.salon_id;
      } catch (error) {
        console.error('Error parsing adminAuth:', error);
      }
    }
    return '';
  };

  const salonId = getSalonId();
  const { transactions, financialMetrics, loading: transactionsLoading } = useFinancialTransactions({ salonId });

  console.log('💰 FinancialDashboard - Dados:', {
    appointments: appointments.length,
    transactions: transactions.length,
    metrics: financialMetrics
  });

  const services = useMemo(() => {
    const uniqueServices = appointments.reduce((acc, apt) => {
      if (apt.service && !acc.find(s => s.id === apt.service.id)) {
        acc.push({ id: apt.service.id, name: apt.service.name });
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);
    return uniqueServices;
  }, [appointments]);

  const calculateAppointmentTotal = (appointment: Appointment) => {
    let total = 0;
    
    if (appointment.service?.price) {
      total += Number(appointment.service.price);
    }
    
    if (appointment.additional_services && Array.isArray(appointment.additional_services)) {
      const additionalTotal = appointment.additional_services.reduce((sum: number, additional: any) => {
        return sum + (Number(additional?.price || 0));
      }, 0);
      total += additionalTotal;
    }
    
    return total;
  };

  // Criar transação financeira automaticamente quando appointment for concluído
  const createFinancialTransaction = useCallback(async (appointment: Appointment) => {
    if (appointment.status === 'completed' && salonId) {
      const total = calculateAppointmentTotal(appointment);
      
      try {
        await fetch('/api/supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create_financial_transaction',
            data: {
              salon_id: salonId,
              appointment_id: appointment.id,
              transaction_type: 'income',
              amount: total,
              description: `Serviço: ${appointment.service?.name || 'Serviço'} - Cliente: ${appointment.client?.name || 'Cliente'}`,
              category: 'service',
              payment_method: 'cash',
              transaction_date: appointment.appointment_date,
              status: 'completed',
              metadata: {
                auto_generated: true,
                appointment_id: appointment.id,
                service_name: appointment.service?.name,
                client_name: appointment.client?.name
              }
            }
          })
        });
        console.log('💰 Transação financeira criada para appointment:', appointment.id);
      } catch (error) {
        console.error('Erro ao criar transação financeira:', error);
      }
    }
  }, [salonId]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    let filtered = appointments;

    switch (selectedPeriod) {
      case 'current-month':
        filtered = filtered.filter(apt => isSameMonth(new Date(apt.appointment_date), now));
        break;
      case 'last-month':
        filtered = filtered.filter(apt => isSameMonth(new Date(apt.appointment_date), subMonths(now, 1)));
        break;
      case 'last-3-months':
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= subMonths(now, 3);
        });
        break;
      case 'last-6-months':
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.appointment_date);
          return aptDate >= subMonths(now, 6);
        });
        break;
      case 'year':
        filtered = filtered.filter(apt => new Date(apt.appointment_date).getFullYear() === now.getFullYear());
        break;
    }

    if (selectedService !== 'all') {
      filtered = filtered.filter(apt => apt.service_id === selectedService);
    }

    console.log('🔍 Filtered appointments for financial:', filtered.length);
    return filtered;
  }, [appointments, selectedPeriod, selectedService]);

  const dailySummaryData = useMemo(() => {
    const today = new Date();
    const yesterday = subDays(today, 1);

    const todayAppointments = appointments.filter(apt => 
      apt.status === 'completed' && isSameDay(new Date(apt.appointment_date), today)
    );

    const yesterdayAppointments = appointments.filter(apt => 
      apt.status === 'completed' && isSameDay(new Date(apt.appointment_date), yesterday)
    );

    const todayRevenue = todayAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
    const yesterdayRevenue = yesterdayAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);

    const todayData = {
      date: format(today, 'yyyy-MM-dd'),
      revenue: todayRevenue,
      appointments: todayAppointments.length,
      averageTicket: todayAppointments.length > 0 ? todayRevenue / todayAppointments.length : 0,
      growth: yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    };

    const yesterdayData = {
      date: format(yesterday, 'yyyy-MM-dd'),
      revenue: yesterdayRevenue,
      appointments: yesterdayAppointments.length,
      averageTicket: yesterdayAppointments.length > 0 ? yesterdayRevenue / yesterdayAppointments.length : 0,
      growth: 0
    };

    return { todayData, yesterdayData };
  }, [appointments]);

  const financialData = useMemo(() => {
    const now = new Date();
    
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
    const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'confirmed');
    
    console.log('💰 Financial calculation - Status breakdown:', {
      completed: completedAppointments.length,
      confirmed: confirmedAppointments.length,
      transactions: transactions.length
    });
    
    // Calcular receita total prioritizando transações financeiras se existirem
    const totalRevenue = transactions.length > 0 
      ? transactions
          .filter(t => t.transaction_type === 'income' && t.status === 'completed')
          .reduce((sum, t) => sum + Number(t.amount), 0)
      : completedAppointments.reduce((sum, apt) => {
          return sum + calculateAppointmentTotal(apt);
        }, 0);
    
    const pendingRevenue = confirmedAppointments.reduce((sum, apt) => {
      return sum + calculateAppointmentTotal(apt);
    }, 0);
    
    const currentMonthRevenue = appointments
      .filter(apt => apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), now))
      .reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
    
    const lastMonthRevenue = appointments
      .filter(apt => apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), subMonths(now, 1)))
      .reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
    
    const growthPercentage = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;
    
    const averageTicket = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthAppointments = appointments.filter(apt => 
        apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), month)
      );
      const revenue = monthAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
      
      monthlyData.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        revenue,
        appointments: monthAppointments.length,
        growth: 0
      });
    }
    
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const day = subDays(now, i);
      const dayAppointments = appointments.filter(apt => 
        apt.status === 'completed' && isSameDay(new Date(apt.appointment_date), day)
      );
      const revenue = dayAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
      
      dailyData.push({
        day: format(day, 'dd/MM', { locale: ptBR }),
        revenue,
        appointments: dayAppointments.length,
        averageTicket: dayAppointments.length > 0 ? revenue / dayAppointments.length : 0
      });
    }
    
    const serviceStats = completedAppointments.reduce((acc, apt) => {
      const serviceName = apt.service?.name || 'Serviço não identificado';
      const appointmentTotal = calculateAppointmentTotal(apt);
      
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 };
      }
      acc[serviceName].count++;
      acc[serviceName].revenue += appointmentTotal;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);
    
    const servicesData = Object.entries(serviceStats)
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        count: stats.count,
        percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    console.log('💰 Final financial data:', {
      totalRevenue,
      currentMonthRevenue,
      growthPercentage,
      averageTicket,
      completedCount: completedAppointments.length
    });
    
    return {
      totalRevenue,
      currentMonthRevenue,
      growthPercentage,
      averageTicket,
      completedAppointments: completedAppointments.length,
      pendingRevenue,
      monthlyData,
      dailyData,
      servicesData
    };
  }, [filteredAppointments, appointments, transactions]);

  const handleRefresh = () => {
    console.log('🔄 Atualizando dados financeiros...');
    toast({
      title: "Dados atualizados",
      description: "Os dados financeiros foram atualizados com sucesso",
    });
  };

  const handleExport = () => {
    console.log('📤 Exportando dados financeiros...');
    toast({
      title: "Exportação iniciada",
      description: "O relatório está sendo gerado...",
    });
  };

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-3 border border-border/50">
        <h2 className="text-lg font-bold text-foreground mb-0.5">💰 Dashboard Financeiro</h2>
        <p className="text-muted-foreground text-xs">Análise detalhada do desempenho financeiro</p>
      </div>

      <DailySummaryCard 
        todayData={dailySummaryData.todayData}
        yesterdayData={dailySummaryData.yesterdayData}
        financialTransactions={transactions}
      />

      <FinancialFilters
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        selectedService={selectedService}
        onServiceChange={setSelectedService}
        services={services}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      <FinancialMetricsCards
        totalRevenue={financialData.totalRevenue}
        currentMonthRevenue={financialData.currentMonthRevenue}
        growthPercentage={financialData.growthPercentage}
        averageTicket={financialData.averageTicket}
        completedAppointments={financialData.completedAppointments}
        pendingRevenue={financialData.pendingRevenue}
      />

      <CleanFinancialCharts
        revenueData={financialData.monthlyData}
        servicesData={financialData.servicesData}
        dailyData={financialData.dailyData}
      />
    </div>
  );
};

export default FinancialDashboard;
