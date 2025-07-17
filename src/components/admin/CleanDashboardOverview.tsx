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
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  Timer,
  DollarSign
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
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">Confirmado</Badge>;
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
    bronze: { appointments: 100, name: "Bronze", color: "from-orange-400 to-orange-600" },
    silver: { appointments: 300, name: "Prata", color: "from-gray-400 to-gray-600" },
    gold: { appointments: 1000, name: "Ouro", color: "from-yellow-400 to-yellow-600" },
    platinum: { appointments: 99999, name: "Platinum", color: "from-purple-400 to-purple-600" }
  };

  const currentPlan = planLimits[salon.plan as keyof typeof planLimits] || planLimits.bronze;
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  }).length;

  const planUsagePercentage = Math.min((monthlyAppointments / currentPlan.appointments) * 100, 100);

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
    <div className="space-y-8">
      {/* Header com Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card do Plano */}
        <Card className={`bg-gradient-to-br ${currentPlan.color} text-white shadow-lg`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Plano {currentPlan.name}</h3>
                <p className="text-white/80 text-sm">Limite mensal</p>
              </div>
              <Sparkles className="h-8 w-8 text-white/80" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-3xl font-bold">{monthlyAppointments}</span>
                <span className="text-white/80">de {currentPlan.appointments}</span>
              </div>
              
              <Progress 
                value={planUsagePercentage} 
                className="h-3 bg-white/20"
              />
              
              <p className="text-xs text-white/90">
                {planUsagePercentage.toFixed(1)}% utilizado este mês
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos Hoje */}
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hoje</h3>
                <p className="text-sm text-gray-600">Agendamentos</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
            
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-gray-900">{todayAppointments.length}</span>
              <span className="text-sm text-gray-500 mb-1">agendamentos</span>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <div className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                {todayAppointments.filter(apt => apt.status === 'confirmed').length} confirmados
              </div>
              <div className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                {todayAppointments.filter(apt => apt.status === 'pending').length} pendentes
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receita Mensal */}
        <Card className="shadow-lg border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Receita</h3>
                <p className="text-sm text-gray-600">Este mês</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <span className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyRevenue)}</span>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                {completedThisMonth.length} serviços concluídos
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos de Hoje - Redesenhado */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-blue-600" />
              <span className="text-xl font-semibold">Agenda de Hoje</span>
            </div>
            <Badge variant="outline" className="text-sm">
              {format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {todayAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento hoje</h3>
              <p className="text-gray-500">Aproveite para organizar ou divulgar seus serviços!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map((appointment) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {appointment.appointment_time.substring(0, 5)}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {getClientName(appointment)}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {getServiceName(appointment)}
                      </p>
                      <div className="mt-1">
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    )}
                    
                    {appointment.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => onUpdateStatus(appointment.id, 'completed')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
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

      {/* Próximos Agendamentos - Redesenhado */}
      <Card className="shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <span className="text-xl font-semibold">Próximos Agendamentos</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento próximo</h3>
              <p className="text-gray-500">Que tal promover seus serviços nas redes sociais?</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment, index) => (
                <div 
                  key={appointment.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {getClientName(appointment)}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {getServiceName(appointment)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAppointmentDate(appointment.appointment_date)} às {appointment.appointment_time.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(appointment.status)}
                    
                    {appointment.status === 'pending' && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                          className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700"
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