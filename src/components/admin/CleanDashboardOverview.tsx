import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Crown,
  Target,
  ArrowRight,
  Star
} from "lucide-react";
import { format, isToday, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';

interface CleanDashboardOverviewProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: AdminUser[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => void;
}

const CleanDashboardOverview = ({ 
  appointments, 
  services, 
  salon, 
  adminUsers,
  onUpdateStatus 
}: CleanDashboardOverviewProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Cancelado</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  const getClientName = (appointment: Appointment) => {
    if (appointment.client?.name) return appointment.client.name;
    if (appointment.client?.username) return appointment.client.username;
    return 'Cliente';
  };

  const getServiceName = (appointment: Appointment) => {
    if ((appointment as any).service?.name) return (appointment as any).service.name;
    return 'Serviço';
  };

  const formatAppointmentDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);
      return format(localDate, "dd/MM", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Configuração do plano
  const planLimits = {
    bronze: { appointments: 100, name: "Bronze" },
    silver: { appointments: 300, name: "Prata" },
    gold: { appointments: 1000, name: "Ouro" },
    platinum: { appointments: 99999, name: "Platinum" }
  };

  const currentPlan = planLimits[salon.plan as keyof typeof planLimits] || planLimits.bronze;
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  }).length;

  const planUsagePercentage = (monthlyAppointments / currentPlan.appointments) * 100;

  // Agendamentos do dia
  const todayAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointment_date + 'T00:00:00');
    return isToday(appointmentDate);
  });

  // Próximos agendamentos
  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDateTime = new Date(apt.appointment_date + 'T' + apt.appointment_time);
      return isAfter(aptDateTime, new Date()) && (apt.status === 'pending' || apt.status === 'confirmed');
    })
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
      const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  // Estatísticas gerais
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const completedThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && 
           aptDate.getFullYear() === now.getFullYear() && 
           apt.status === 'completed';
  });

  const monthlyRevenue = completedThisMonth.reduce((total, apt) => {
    return total + ((apt as any).service?.price || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Barra de Status do Plano */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Plano {currentPlan.name}</h3>
                <p className="text-sm text-gray-600">Limite mensal de agendamentos</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {monthlyAppointments}/{currentPlan.appointments}
              </div>
              <div className="text-sm text-gray-500">agendamentos</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Uso do plano</span>
              <span className="font-medium">{planUsagePercentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={planUsagePercentage} 
              className="h-2"
            />
            {planUsagePercentage > 80 && (
              <p className="text-xs text-orange-600 font-medium">
                ⚠️ Você está próximo do limite do seu plano
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Hoje</p>
                <p className="text-2xl font-bold text-blue-900">{todayAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingAppointments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Este Mês</p>
                <p className="text-2xl font-bold text-green-900">{completedThisMonth.length}</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Receita</p>
                <p className="text-xl font-bold text-purple-900">{formatCurrency(monthlyRevenue)}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos de Hoje */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Agendamentos de Hoje
            </div>
            <Badge variant="secondary">{todayAppointments.length} agendamentos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-blue-600">
                      {appointment.appointment_time}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getClientName(appointment)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getServiceName(appointment)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                          className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                          className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(appointment.id, 'completed')}
                        className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700"
                      >
                        Concluir
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Próximos Agendamentos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-green-600" />
              Próximos Agendamentos
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-6">
              <Activity className="h-10 w-10 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">Nenhum agendamento próximo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getClientName(appointment)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {getServiceName(appointment)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatAppointmentDate(appointment.appointment_date)} às {appointment.appointment_time}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                          className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                          className="h-7 w-7 p-0 bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CleanDashboardOverview;