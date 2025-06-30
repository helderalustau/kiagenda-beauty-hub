
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Clock, Download } from "lucide-react";
import { Appointment } from '@/hooks/useSupabaseData';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FinancialDashboardProps {
  appointments: Appointment[];
}

const FinancialDashboard = ({ appointments }: FinancialDashboardProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Filtrar apenas agendamentos concluídos
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');

  const getDateRange = () => {
    switch (selectedPeriod) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        };
      case 'week':
        return {
          start: startOfWeek(selectedDate, { weekStartsOn: 0 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 0 })
        };
      case 'month':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        };
    }
  };

  const getFilteredAppointments = () => {
    const { start, end } = getDateRange();
    
    return completedAppointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return aptDate >= start && aptDate <= end;
    });
  };

  const calculateRevenue = () => {
    const filtered = getFilteredAppointments();
    return filtered.reduce((total, apt) => {
      return total + (apt.service?.price ? Number(apt.service.price) : 0);
    }, 0);
  };

  const getServiceStats = () => {
    const filtered = getFilteredAppointments();
    const serviceMap = new Map();
    
    filtered.forEach(apt => {
      if (apt.service) {
        const serviceName = apt.service.name;
        const servicePrice = Number(apt.service.price) || 0;
        
        if (serviceMap.has(serviceName)) {
          const existing = serviceMap.get(serviceName);
          serviceMap.set(serviceName, {
            ...existing,
            count: existing.count + 1,
            revenue: existing.revenue + servicePrice
          });
        } else {
          serviceMap.set(serviceName, {
            name: serviceName,
            count: 1,
            revenue: servicePrice
          });
        }
      }
    });
    
    return Array.from(serviceMap.values()).sort((a, b) => b.revenue - a.revenue);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'day':
        return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
        return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(weekEnd, "dd/MM/yyyy", { locale: ptBR })}`;
      case 'month':
        return format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  const revenue = calculateRevenue();
  const serviceStats = getServiceStats();
  const appointmentCount = getFilteredAppointments().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Relatório Financeiro</h2>
          <p className="text-gray-600">Acompanhe a receita do seu estabelecimento</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Exportar</span>
        </Button>
      </div>

      {/* Filtros de Período */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Período de Análise</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              {(['day', 'week', 'month'] as const).map(period => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period === 'day' ? 'Dia' : period === 'week' ? 'Semana' : 'Mês'}
                </Button>
              ))}
            </div>
            <div className="text-sm font-medium text-gray-700">
              {getPeriodLabel()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Receita Total</span>
              <DollarSign className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(revenue)}</div>
            <p className="text-green-100 text-sm mt-1">
              {appointmentCount} atendimento{appointmentCount !== 1 ? 's' : ''} concluído{appointmentCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Ticket Médio</span>
              <TrendingUp className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(appointmentCount > 0 ? revenue / appointmentCount : 0)}
            </div>
            <p className="text-blue-100 text-sm mt-1">
              Por atendimento
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Atendimentos</span>
              <Clock className="h-6 w-6" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointmentCount}</div>
            <p className="text-purple-100 text-sm mt-1">
              Serviços concluídos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Serviços */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Serviços Mais Lucrativos</CardTitle>
        </CardHeader>
        <CardContent>
          {serviceStats.length > 0 ? (
            <div className="space-y-4">
              {serviceStats.slice(0, 5).map((service, index) => (
                <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.count} atendimento{service.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(service.revenue)}</div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(service.revenue / service.count)} médio
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum serviço concluído no período selecionado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
