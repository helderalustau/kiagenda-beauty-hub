
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
  Activity,
  Timer,
  DollarSign,
  Star,
  CalendarDays,
  FileText,
  BarChart3,
  History
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
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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

  // Histórico de atendimentos (últimos 10 concluídos)
  const completedAppointments = appointments
    .filter(apt => apt.status === 'completed')
    .sort((a, b) => {
      const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
      const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
      return dateB.getTime() - dateA.getTime(); // Mais recentes primeiro
    })
    .slice(0, 10);

  // Estatísticas gerais
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
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
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header limpo e moderno */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">
            Visão Geral
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center">
          <BarChart3 className="h-7 w-7 text-primary" />
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Plano */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Plano</p>
                <p className="text-lg font-semibold">{currentPlan.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agendamentos Hoje */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-lg font-semibold">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-lg font-semibold">{pendingAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmados */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-lg font-semibold">{confirmedAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receita */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Receita Mensal</p>
                <p className="text-lg font-semibold">{formatCurrency(monthlyRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda de Hoje */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-foreground font-semibold">
                Agenda de Hoje
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments
                  .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                  .map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {appointment.appointment_time.substring(0, 5)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getClientName(appointment)}</p>
                        <p className="text-xs text-muted-foreground">{getServiceName(appointment)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(appointment.status)}
                      {appointment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                          className="h-7 px-2 text-xs"
                        >
                          Confirmar
                        </Button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(appointment.id, 'completed')}
                          className="h-7 px-2 text-xs"
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
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent rounded-lg"></div>
          <CardHeader className="pb-4 relative">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="h-8 w-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent font-semibold">
                Próximos Agendamentos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-card to-card/50 hover:from-accent/20 hover:to-accent/10 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {formatAppointmentDate(appointment.appointment_date)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getClientName(appointment)}</p>
                        <p className="text-xs text-muted-foreground">
                          {getServiceName(appointment)} • {appointment.appointment_time.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(appointment.status)}
                      {appointment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                          className="h-7 px-2 text-xs"
                        >
                          Confirmar
                        </Button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(appointment.id, 'completed')}
                          className="h-7 px-2 text-xs"
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

        {/* Histórico de Atendimentos */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card/95 to-card/90 hover:shadow-2xl transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent rounded-lg"></div>
          <CardHeader className="pb-4 relative">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <History className="h-4 w-4 text-white" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent font-semibold">
                Histórico de Atendimentos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {completedAppointments.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum atendimento concluído</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-xl border bg-gradient-to-r from-card to-card/50 hover:from-accent/20 hover:to-accent/10 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">
                          {formatAppointmentDate(appointment.appointment_date)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{getClientName(appointment)}</p>
                        <p className="text-xs text-muted-foreground">
                          {getServiceName(appointment)} • {appointment.appointment_time.substring(0, 5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(appointment.status)}
                      <div className="text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                        {formatCurrency((appointment as any).service?.price || 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CleanDashboardOverview;
