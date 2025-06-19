
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  DollarSign, 
  Scissors, 
  TrendingUp,
  Crown
} from "lucide-react";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import { isSameDay, isThisWeek } from 'date-fns';

interface DashboardStatsProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon | null;
  adminUsers: AdminUser[];
}

const DashboardStats = ({ appointments, services, salon, adminUsers }: DashboardStatsProps) => {
  const today = new Date();
  
  // Calcular estatísticas
  const todayAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.appointment_date), today)
  );
  
  const thisWeekAppointments = appointments.filter(apt => 
    isThisWeek(new Date(apt.appointment_date))
  );
  
  const completedThisWeek = thisWeekAppointments.filter(apt => 
    apt.status === 'completed'
  );
  
  const weeklyRevenue = completedThisWeek.reduce((total, apt) => 
    total + (apt.services?.price || 0), 0
  );

  // Calcular uso mensal (simulado)
  const monthlyUsage = appointments.length;
  const planLimits = {
    bronze: 50,
    prata: 300,
    gold: Infinity
  };
  
  const currentLimit = planLimits[salon?.plan as keyof typeof planLimits] || 50;
  const usagePercentage = salon?.plan === 'gold' ? 0 : Math.min((monthlyUsage / currentLimit) * 100, 100);

  // Top 5 serviços mais pedidos
  const serviceStats = services.map(service => {
    const count = appointments.filter(apt => apt.service_id === service.id).length;
    const revenue = appointments
      .filter(apt => apt.service_id === service.id && apt.status === 'completed')
      .reduce((total, apt) => total + service.price, 0);
    
    return { ...service, count, revenue };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Barra de Uso do Plano */}
      {salon?.plan !== 'gold' && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">
                  Uso Mensal - Plano {salon?.plan?.charAt(0).toUpperCase()}{salon?.plan?.slice(1)}
                </span>
              </div>
              <span className="text-sm text-amber-700">
                {monthlyUsage} de {currentLimit} atendimentos
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
            {usagePercentage > 80 && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Próximo do limite mensal
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{todayAppointments.length}</p>
                <p className="text-xs text-gray-500">agendamentos</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Receita Semanal</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {weeklyRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{completedThisWeek.length} concluídos</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Serviços Ativos</p>
                <p className="text-2xl font-bold text-purple-600">{services.length}</p>
                <p className="text-xs text-gray-500">cadastrados</p>
              </div>
              <Scissors className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-pink-600">{monthlyUsage}</p>
                <p className="text-xs text-gray-500">atendimentos</p>
              </div>
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 Serviços */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 5 Serviços Mais Pedidos</h3>
          <div className="space-y-3">
            {serviceStats.map((service, index) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-600">R$ {service.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{service.count} pedidos</p>
                  <p className="text-sm text-green-600">R$ {service.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
