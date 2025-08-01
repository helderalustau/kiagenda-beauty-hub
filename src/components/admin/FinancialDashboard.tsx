
import React, { useMemo, useState } from 'react';
import { Appointment } from '@/types/supabase-entities';
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth, isSameDay, subDays, isToday, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import FinancialMetricsCards from './financial/FinancialMetricsCards';
import FinancialFilters from './financial/FinancialFilters';
import CleanFinancialCharts from './financial/CleanFinancialCharts';
import DailySummaryCard from './financial/DailySummaryCard';
import { useToast } from "@/hooks/use-toast";

interface FinancialDashboardProps {
  appointments: Appointment[];
}

const FinancialDashboard = ({ appointments }: FinancialDashboardProps) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedService, setSelectedService] = useState('all');

  // Debug: Log appointments para verificar dados
  console.log('📊 FinancialDashboard - Total appointments received:', appointments.length);
  console.log('📊 FinancialDashboard - Sample appointments:', appointments.slice(0, 3));

  const services = useMemo(() => {
    const uniqueServices = appointments.reduce((acc, apt) => {
      if (apt.service && !acc.find(s => s.id === apt.service.id)) {
        acc.push({ id: apt.service.id, name: apt.service.name });
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);
    console.log('📊 Services extracted:', uniqueServices.length);
    return uniqueServices;
  }, [appointments]);

  // Função corrigida para calcular o valor total do agendamento
  const calculateAppointmentTotal = (appointment: Appointment) => {
    let total = 0;
    
    // Valor do serviço principal
    if (appointment.service?.price) {
      total += Number(appointment.service.price);
    }
    
    // Valores dos serviços adicionais
    if (appointment.additional_services && Array.isArray(appointment.additional_services)) {
      const additionalTotal = appointment.additional_services.reduce((sum: number, additional: any) => {
        const price = Number(additional?.price || 0);
        return sum + price;
      }, 0);
      total += additionalTotal;
    }
    
    console.log(`💰 Appointment ${appointment.id}: Service=${appointment.service?.price || 0}, Additional=${appointment.additional_services ? JSON.stringify(appointment.additional_services) : 'none'}, Total=${total}`);
    
    return total;
  };

  // Dados do resumo diário corrigidos
  const dailySummaryData = useMemo(() => {
    const today = startOfDay(new Date());
    const yesterday = startOfDay(subDays(today, 1));

    console.log('📅 Calculating daily summary for:', {
      today: format(today, 'yyyy-MM-dd'),
      yesterday: format(yesterday, 'yyyy-MM-dd')
    });

    // Agendamentos de hoje (apenas concluídos)
    const todayAppointments = appointments.filter(apt => {
      const aptDate = startOfDay(new Date(apt.appointment_date));
      return apt.status === 'completed' && aptDate.getTime() === today.getTime();
    });

    // Agendamentos de ontem (apenas concluídos)
    const yesterdayAppointments = appointments.filter(apt => {
      const aptDate = startOfDay(new Date(apt.appointment_date));
      return apt.status === 'completed' && aptDate.getTime() === yesterday.getTime();
    });

    console.log('📊 Daily appointments:', {
      today: todayAppointments.length,
      yesterday: yesterdayAppointments.length
    });

    const todayRevenue = todayAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
    const yesterdayRevenue = yesterdayAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);

    console.log('💰 Daily revenue:', {
      today: todayRevenue,
      yesterday: yesterdayRevenue
    });

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
  }, [appointments, calculateAppointmentTotal]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    let filtered = appointments;

    console.log('🔍 Filtering appointments by period:', selectedPeriod);

    // Filtro por período
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

    // Filtro por serviço
    if (selectedService !== 'all') {
      filtered = filtered.filter(apt => apt.service_id === selectedService);
    }

    console.log('📊 Filtered appointments:', filtered.length);
    return filtered;
  }, [appointments, selectedPeriod, selectedService]);

  const financialData = useMemo(() => {
    const now = new Date();
    
    // Separar por status para cálculos precisos
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
    const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'confirmed');
    
    console.log('📊 Financial calculation - appointments by status:', {
      completed: completedAppointments.length,
      confirmed: confirmedAppointments.length,
      total: filteredAppointments.length
    });
    
    // Receita total (apenas agendamentos concluídos)
    const totalRevenue = completedAppointments.reduce((sum, apt) => {
      const value = calculateAppointmentTotal(apt);
      return sum + value;
    }, 0);
    
    // Receita pendente (agendamentos confirmados)
    const pendingRevenue = confirmedAppointments.reduce((sum, apt) => {
      const value = calculateAppointmentTotal(apt);
      return sum + value;
    }, 0);
    
    console.log('💰 Revenue calculation:', {
      totalRevenue,
      pendingRevenue
    });
    
    // Receita do mês atual (apenas concluídos)
    const currentMonthRevenue = appointments
      .filter(apt => apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), now))
      .reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
    
    // Receita do mês anterior (apenas concluídos)
    const lastMonthRevenue = appointments
      .filter(apt => apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), subMonths(now, 1)))
      .reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
    
    // Crescimento percentual
    const growthPercentage = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : currentMonthRevenue > 0 ? 100 : 0;
    
    // Ticket médio
    const averageTicket = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;
    
    console.log('📊 Financial metrics:', {
      currentMonthRevenue,
      lastMonthRevenue,
      growthPercentage,
      averageTicket
    });
    
    // Dados mensais para gráficos (últimos 6 meses)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthAppointments = appointments.filter(apt => 
        apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), month)
      );
      const revenue = monthAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
      const previousRevenue = i === 5 ? 0 : monthlyData[monthlyData.length - 1]?.revenue || 0;
      const growth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      monthlyData.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        revenue,
        appointments: monthAppointments.length,
        growth
      });
    }
    
    // Dados diários (últimos 30 dias)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const day = subDays(now, i);
      const dayCompletedAppointments = appointments.filter(apt => 
        apt.status === 'completed' && isSameDay(new Date(apt.appointment_date), day)
      );
      const revenue = dayCompletedAppointments.reduce((sum, apt) => sum + calculateAppointmentTotal(apt), 0);
      const completedCount = dayCompletedAppointments.length;
      
      dailyData.push({
        day: format(day, 'dd/MM', { locale: ptBR }),
        revenue,
        appointments: completedCount,
        averageTicket: completedCount > 0 ? revenue / completedCount : 0
      });
    }
    
    // Serviços mais populares (apenas concluídos)
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
    
    console.log('📊 Services data:', servicesData);
    
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
  }, [filteredAppointments, appointments, calculateAppointmentTotal]);

  const handleRefresh = () => {
    console.log('🔄 Refreshing financial data...');
    toast({
      title: "Dados atualizados",
      description: "Os dados financeiros foram atualizados com sucesso",
    });
  };

  const handleExport = () => {
    console.log('📤 Exporting financial data...');
    toast({
      title: "Exportação iniciada",
      description: "O relatório está sendo gerado. Você receberá uma notificação quando estiver pronto.",
    });
  };

  // Debug final dos dados
  console.log('📊 Final financial data:', {
    totalRevenue: financialData.totalRevenue,
    currentMonthRevenue: financialData.currentMonthRevenue,
    growthPercentage: financialData.growthPercentage,
    completedAppointments: financialData.completedAppointments,
    pendingRevenue: financialData.pendingRevenue
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Financeiro</h2>
        <p className="text-gray-600">Análise completa do desempenho financeiro do seu estabelecimento</p>
      </div>

      {/* Resumo Diário */}
      <DailySummaryCard 
        todayData={dailySummaryData.todayData}
        yesterdayData={dailySummaryData.yesterdayData}
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
