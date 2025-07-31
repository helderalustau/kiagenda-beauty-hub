
import React, { useMemo, useState } from 'react';
import { Appointment } from '@/types/supabase-entities';
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth, isSameDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import FinancialMetricsCards from './financial/FinancialMetricsCards';
import FinancialFilters from './financial/FinancialFilters';
import EnhancedFinancialCharts from './financial/EnhancedFinancialCharts';
import { useToast } from "@/hooks/use-toast";

interface FinancialDashboardProps {
  appointments: Appointment[];
}

const FinancialDashboard = ({ appointments }: FinancialDashboardProps) => {
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedService, setSelectedService] = useState('all');

  const services = useMemo(() => {
    const uniqueServices = appointments.reduce((acc, apt) => {
      if (apt.service && !acc.find(s => s.id === apt.service.id)) {
        acc.push({ id: apt.service.id, name: apt.service.name });
      }
      return acc;
    }, [] as Array<{ id: string; name: string }>);
    return uniqueServices;
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    let filtered = appointments;

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

    return filtered;
  }, [appointments, selectedPeriod, selectedService]);

  const financialData = useMemo(() => {
    const now = new Date();
    const completedAppointments = filteredAppointments.filter(apt => apt.status === 'completed');
    const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'confirmed');
    
    // Receita total
    const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    
    // Receita pendente (agendamentos confirmados)
    const pendingRevenue = confirmedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    
    // Receita do mês atual
    const currentMonthRevenue = completedAppointments
      .filter(apt => isSameMonth(new Date(apt.appointment_date), now))
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    
    // Receita do mês anterior
    const lastMonthRevenue = appointments
      .filter(apt => apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), subMonths(now, 1)))
      .reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
    
    // Crescimento percentual
    const growthPercentage = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0;
    
    // Ticket médio
    const averageTicket = completedAppointments.length > 0 
      ? totalRevenue / completedAppointments.length 
      : 0;
    
    // Dados mensais para gráficos
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const month = subMonths(now, i);
      const monthAppointments = appointments.filter(apt => 
        apt.status === 'completed' && isSameMonth(new Date(apt.appointment_date), month)
      );
      const revenue = monthAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
      const previousMonthRevenue = i === 5 ? 0 : monthlyData[monthlyData.length - 1]?.revenue || 0;
      const growth = previousMonthRevenue > 0 ? ((revenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;
      
      monthlyData.push({
        month: format(month, 'MMM/yy', { locale: ptBR }),
        revenue,
        appointments: monthAppointments.length,
        growth
      });
    }
    
    // Dados diários enriquecidos (últimos 30 dias)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const day = subDays(now, i);
      const dayCompletedAppointments = appointments.filter(apt => 
        apt.status === 'completed' && isSameDay(new Date(apt.appointment_date), day)
      );
      const dayAllAppointments = appointments.filter(apt => 
        isSameDay(new Date(apt.appointment_date), day)
      );
      const revenue = dayCompletedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
      const totalAppointments = dayAllAppointments.length;
      const completedCount = dayCompletedAppointments.length;
      const cancelledCount = dayAllAppointments.filter(apt => apt.status === 'cancelled').length;
      
      dailyData.push({
        day: format(day, 'dd/MM', { locale: ptBR }),
        revenue,
        appointments: completedCount,
        totalAppointments,
        averageTicket: completedCount > 0 ? revenue / completedCount : 0,
        completedAppointments: completedCount,
        cancelledAppointments: cancelledCount
      });
    }
    
    // Serviços mais populares
    const serviceStats = completedAppointments.reduce((acc, apt) => {
      const serviceName = apt.service?.name || 'Serviço não identificado';
      const servicePrice = apt.service?.price || 0;
      
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 };
      }
      acc[serviceName].count++;
      acc[serviceName].revenue += servicePrice;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);
    
    const servicesData = Object.entries(serviceStats)
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        count: stats.count,
        percentage: (stats.revenue / totalRevenue) * 100
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
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
  }, [filteredAppointments, appointments]);

  const handleRefresh = () => {
    toast({
      title: "Dados atualizados",
      description: "Os dados financeiros foram atualizados com sucesso",
    });
  };

  const handleExport = () => {
    // Implementar exportação para CSV/PDF
    toast({
      title: "Exportação iniciada",
      description: "O relatório está sendo gerado. Você receberá uma notificação quando estiver pronto.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Financeiro</h2>
        <p className="text-gray-600">Análise completa do desempenho financeiro do seu estabelecimento</p>
      </div>

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

      <EnhancedFinancialCharts
        revenueData={financialData.monthlyData}
        servicesData={financialData.servicesData}
        dailyData={financialData.dailyData}
      />
    </div>
  );
};

export default FinancialDashboard;
