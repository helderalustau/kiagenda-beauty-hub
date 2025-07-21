
import React, { useState, useEffect } from 'react';
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
  History,
  AlertTriangle
} from "lucide-react";
import { format, isToday, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { usePlanLimitsChecker } from '@/hooks/usePlanLimitsChecker';
import PlanLimitReachedModal from '@/components/PlanLimitReachedModal';


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
  const { getPlanLimits, getPlanInfo } = usePlanConfigurations();
  const { getSalonAppointmentStats } = usePlanLimitsChecker();
  const [appointmentStats, setAppointmentStats] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  
  // Buscar estatísticas de agendamentos
  useEffect(() => {
    if (salon?.id) {
      console.log('🔍 Buscando estatísticas para salão:', salon.id, 'Status:', salon.is_open);
      getSalonAppointmentStats(salon.id).then(stats => {
        console.log('📊 Estatísticas recebidas:', stats);
        if (stats.success) {
          setAppointmentStats(stats);
          // Não mostrar modal automaticamente - apenas quando usuário clicar no botão
          // if (stats.limitReached) {
          //   console.log('🚨 Limite atingido! Abrindo modal...');
          //   setShowLimitModal(true);
          // }
        }
      });
    }
  }, [salon?.id, salon?.plan, getSalonAppointmentStats]); // Adicionar salon.plan como dependência
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

  // Configuração do plano dinâmica
  const currentPlan = getPlanLimits(salon.plan);
  const planInfo = getPlanInfo(salon.plan);
  
  const monthlyAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  }).length;

  const planUsagePercentage = Math.min((monthlyAppointments / currentPlan.max_appointments) * 100, 100);

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
    <div className="space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
      </div>


      {/* Alerta de limite atingido */}
      {appointmentStats?.limitReached && (
        <Card className="border-red-500 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Limite de Agendamentos Atingido!</h3>
                <p className="text-sm text-red-700">
                  Você utilizou {appointmentStats.currentAppointments}/{appointmentStats.maxAppointments} agendamentos do plano {salon.plan.toUpperCase()}.
                  {!salon.is_open && ' Seu estabelecimento foi fechado automaticamente.'}
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => setShowLimitModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Plano */}
        <Card className={`relative overflow-hidden ${appointmentStats?.limitReached ? 'border-red-500' : appointmentStats?.nearLimit ? 'border-amber-500' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Plano Atual</p>
                <p className="text-2xl font-bold text-foreground">{currentPlan.name}</p>
                <p className={`text-xs mt-1 ${appointmentStats?.limitReached ? 'text-red-600 font-medium' : appointmentStats?.nearLimit ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {appointmentStats ? `${appointmentStats.currentAppointments} de ${appointmentStats.maxAppointments} agendamentos` : `${monthlyAppointments} de ${currentPlan.max_appointments} usados`}
                </p>
              </div>
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                appointmentStats?.limitReached ? 'bg-red-100' : appointmentStats?.nearLimit ? 'bg-amber-100' : 'bg-primary/10'
              }`}>
                {appointmentStats?.limitReached ? (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                ) : (
                  <Star className={`h-6 w-6 ${appointmentStats?.nearLimit ? 'text-amber-600' : 'text-primary'}`} />
                )}
              </div>
            </div>
            <Progress 
              value={appointmentStats?.percentage || planUsagePercentage} 
              className={`mt-4 h-2 ${appointmentStats?.limitReached ? '[&>div]:bg-red-500' : appointmentStats?.nearLimit ? '[&>div]:bg-amber-500' : ''}`}
            />
            {appointmentStats?.limitReached && (
              <p className="text-xs text-red-600 font-medium mt-2">
                Limite atingido! Faça upgrade para continuar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Agendamentos Hoje */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-foreground">{todayAppointments.length}</p>
                <p className="text-xs text-muted-foreground mt-1">agendamentos</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{pendingAppointments.length}</p>
                <p className="text-xs text-muted-foreground mt-1">aguardando confirmação</p>
              </div>
              <div className="h-12 w-12 bg-secondary rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmados */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-foreground">{confirmedAppointments.length}</p>
                <p className="text-xs text-muted-foreground mt-1">agendamentos confirmados</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receita */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(monthlyRevenue)}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-primary mr-1" />
                    <p className="text-xs text-muted-foreground">{completedThisMonth.length} concluídos</p>
                  </div>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda de Hoje */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              Agenda de Hoje
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
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Próximos Agendamentos
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
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">
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
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Histórico de Atendimentos
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
                  <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-secondary rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-foreground">
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
                      <div className="text-xs text-primary font-medium">
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

      {/* Modal de limite atingido */}
      <PlanLimitReachedModal
        isOpen={showLimitModal}
        onClose={() => {
          setShowLimitModal(false);
          // Atualizar stats após fechar o modal (caso tenha havido upgrade)
          if (salon?.id) {
            getSalonAppointmentStats(salon.id).then(stats => {
              if (stats.success) {
                setAppointmentStats(stats);
              }
            });
          }
        }}
        currentPlan={salon.plan}
        currentAppointments={appointmentStats?.currentAppointments || 0}
        maxAppointments={appointmentStats?.maxAppointments || 0}
        salonId={salon.id}
        salonName={salon.name}
      />
    </div>
  );
};

export default CleanDashboardOverview;
