import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, Users, Activity, Timer, DollarSign, Star, CalendarDays, FileText, BarChart3, History, AlertTriangle } from "lucide-react";
import { format, isToday, isAfter, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Service, Salon, AdminUser } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { usePlanLimitsChecker } from '@/hooks/usePlanLimitsChecker';
import PlanLimitReachedModal from '@/components/PlanLimitReachedModal';
import LoadingSpinner from '@/components/ui/loading-spinner';
import AppointmentDetailsModal from '@/components/admin/AppointmentDetailsModal';
interface CleanDashboardOverviewProps {
  appointments: Appointment[];
  services: Service[];
  salon: Salon;
  adminUsers: AdminUser[];
  onUpdateStatus: (id: string, status: 'confirmed' | 'completed' | 'cancelled') => Promise<void>;
}
const CleanDashboardOverview = ({
  appointments,
  services,
  salon,
  adminUsers,
  onUpdateStatus
}: CleanDashboardOverviewProps) => {
  const {
    getPlanLimits,
    getPlanInfo
  } = usePlanConfigurations();
  const {
    getSalonAppointmentStats
  } = usePlanLimitsChecker();
  const [appointmentStats, setAppointmentStats] = useState<any>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);

  // Sincronizar appointments locais com props
  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  // Função para atualizar status otimisticamente
  const updateLocalAppointmentStatus = (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    setLocalAppointments(prev => 
      prev.map(appointment => 
        appointment.id === appointmentId 
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );
  };

  // Função para refresh das estatísticas
  const refreshStats = async () => {
    if (salon?.id) {
      setIsLoadingStats(true);
      try {
        console.log('🔄 Refreshing estatísticas para salão:', salon.id);
        const stats = await getSalonAppointmentStats(salon.id);
        console.log('📊 Estatísticas atualizadas:', stats);
        if (stats.success) {
          setAppointmentStats(stats);
        }
      } catch (error) {
        console.error('Erro ao atualizar estatísticas:', error);
      } finally {
        setIsLoadingStats(false);
      }
    }
  };

  // Buscar estatísticas de agendamentos com delay
  useEffect(() => {
    if (salon?.id) {
      setIsLoadingStats(true);

      // Adicionar um pequeno delay para evitar problema visual
      const timer = setTimeout(() => {
        console.log('🔍 Buscando estatísticas para salão:', salon.id, 'Status:', salon.is_open);
        getSalonAppointmentStats(salon.id).then(stats => {
          console.log('📊 Estatísticas recebidas:', stats);
          if (stats.success) {
            setAppointmentStats(stats);
          }
          setIsLoadingStats(false);
        }).catch(error => {
          console.error('Erro ao buscar estatísticas:', error);
          setIsLoadingStats(false);
        });
      }, 800); // 800ms delay para melhor UX

      return () => clearTimeout(timer);
    }
  }, [salon?.id, salon?.plan, getSalonAppointmentStats]);
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
      return format(localDate, "dd/MM", {
        locale: ptBR
      });
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
  const planUsagePercentage = Math.min(monthlyAppointments / currentPlan.max_appointments * 100, 100);

  // Agendamentos do dia (usando estado local para atualizações imediatas)
  const todayAppointments = localAppointments.filter(apt => {
    const appointmentDate = new Date(apt.appointment_date + 'T00:00:00');
    return isToday(appointmentDate);
  });

  // Agendamentos confirmados de hoje
  const todayConfirmedAppointments = todayAppointments.filter(apt => apt.status === 'confirmed');

  // Próximos agendamentos (usando estado local para atualizações imediatas)
  const upcomingAppointments = localAppointments.filter(apt => {
    const aptDateTime = new Date(apt.appointment_date + 'T' + apt.appointment_time);
    return isAfter(aptDateTime, new Date()) && (apt.status === 'pending' || apt.status === 'confirmed');
  }).sort((a, b) => {
    const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
    const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
    return dateA.getTime() - dateB.getTime();
  }).slice(0, 5);

  // Histórico de atendimentos (últimos 10 concluídos)
  const completedAppointments = appointments.filter(apt => apt.status === 'completed').sort((a, b) => {
    const dateA = new Date(a.appointment_date + 'T' + a.appointment_time);
    const dateB = new Date(b.appointment_date + 'T' + b.appointment_time);
    return dateB.getTime() - dateA.getTime(); // Mais recentes primeiro
  }).slice(0, 10);

  // Estatísticas gerais
  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedThisMonth = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date);
    const now = new Date();
    return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear() && apt.status === 'completed';
  });

  // Estado para transações financeiras
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyTransactionsCount, setMonthlyTransactionsCount] = useState(0);

  // Buscar transações financeiras do mês - MESMA LÓGICA DO DASHBOARD FINANCEIRO
  useEffect(() => {
    const fetchFinancialData = async () => {
      if (!salon?.id) {
        console.log('⚠️ CleanDashboard - Salon ID não encontrado');
        return;
      }
      console.log('🔍 CleanDashboard - Buscando dados financeiros para:', salon.id);
      try {
        // USAR EXATAMENTE A MESMA QUERY DO SimpleFinancialDashboard
        const {
          data: transactions,
          error
        } = await supabase.from('financial_transactions').select('*').eq('salon_id', salon.id).eq('transaction_type', 'income');
        if (error) {
          console.error('❌ CleanDashboard - Erro na query:', error);
          return;
        }
        console.log('💰 CleanDashboard - Transações encontradas:', transactions?.length || 0);
        if (transactions && transactions.length > 0) {
          const currentMonth = format(new Date(), 'yyyy-MM');

          // Transações do mês - MESMA LÓGICA
          const monthTransactions = transactions.filter(t => t.transaction_date.startsWith(currentMonth));
          const monthTotal = monthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
          setMonthlyRevenue(monthTotal);
          setMonthlyTransactionsCount(monthTransactions.length);
          console.log('📊 CleanDashboard - Dados calculados:', {
            totalTransactions: transactions.length,
            monthTransactions: monthTransactions.length,
            monthTotal: monthTotal,
            formattedRevenue: formatCurrency(monthTotal),
            currentMonth,
            salonId: salon.id
          });
        } else {
          console.log('⚠️ CleanDashboard - Nenhuma transação encontrada');
          setMonthlyRevenue(0);
          setMonthlyTransactionsCount(0);
        }
      } catch (error) {
        console.error('❌ CleanDashboard - Erro ao buscar dados financeiros:', error);
      }
    };
    fetchFinancialData();
  }, [salon?.id, appointments]);
  return <div className="space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
          })}
          </p>
        </div>
      </div>


      {/* Alerta de limite atingido */}
      {!isLoadingStats && appointmentStats?.limitReached && <Card className="border-red-500 bg-red-50">
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
              <Button size="sm" onClick={() => setShowLimitModal(true)} className="bg-red-600 hover:bg-red-700 text-white">
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>}

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
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${appointmentStats?.limitReached ? 'bg-red-100' : appointmentStats?.nearLimit ? 'bg-amber-100' : 'bg-primary/10'}`}>
                {appointmentStats?.limitReached ? <AlertTriangle className="h-6 w-6 text-red-600" /> : <Star className={`h-6 w-6 ${appointmentStats?.nearLimit ? 'text-amber-600' : 'text-primary'}`} />}
              </div>
            </div>
            <Progress value={appointmentStats?.percentage || planUsagePercentage} className={`mt-4 h-2 ${appointmentStats?.limitReached ? '[&>div]:bg-red-500' : appointmentStats?.nearLimit ? '[&>div]:bg-amber-500' : ''}`} />
            {appointmentStats?.limitReached && <p className="text-xs text-red-600 font-medium mt-2">
                Limite atingido! Faça upgrade para continuar.
              </p>}
          </CardContent>
        </Card>

        {/* Agendamentos Hoje */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-foreground">{todayConfirmedAppointments.length}</p>
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
                    <p className="text-xs text-muted-foreground">{monthlyTransactionsCount} transações</p>
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
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Agenda de Hoje
              </div>
              {todayConfirmedAppointments.length > 0 && <Button size="sm" onClick={() => {
              // Concluir todos os agendamentos confirmados de hoje
              todayConfirmedAppointments.forEach(apt => {
                if (apt.status === 'confirmed') {
                  onUpdateStatus(apt.id, 'completed');
                }
              });
            }} className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 text-xs font-bold">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Concluir Todos
                </Button>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAppointments.length === 0 ? <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum agendamento para hoje</p>
              </div> : <div className="space-y-3">
                {todayAppointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time)).map(appointment => <div key={appointment.id} onClick={() => setSelectedAppointment(appointment)} className="flex items-center justify-between p-2 border bg-card hover:bg-accent/50 transition-colors cursor-pointer rounded-sm">
                     <div className="flex items-center gap-2">
                       <div className="h-8 w-8 bg-primary/10 flex items-center justify-center rounded-sm">
                         <span className="font-medium text-primary text-xs">
                           {appointment.appointment_time.substring(0, 5)}
                         </span>
                       </div>
                       <div>
                         <p className="font-medium text-sm">{getClientName(appointment)}</p>
                         <p className="text-muted-foreground text-sm">{getServiceName(appointment)}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                       {getStatusBadge(appointment.status)}
                       {appointment.status === 'pending' && <Button size="sm" onClick={e => {
                  e.stopPropagation();
                  onUpdateStatus(appointment.id, 'confirmed');
                }} className="h-7 px-2 text-xs">
                           Confirmar
                         </Button>}
                         {appointment.status === 'confirmed' && <Button size="sm" onClick={async (e) => {
                  e.stopPropagation();
                  console.log('🔥 CleanDashboard CONCLUIR CLICADO!', {
                    appointmentId: appointment.id,
                    status: appointment.status,
                    timestamp: new Date().toISOString()
                  });
                  
                  // Atualização otimista (visual imediata)
                  updateLocalAppointmentStatus(appointment.id, 'completed');
                  
                  try {
                    console.log('🔄 Iniciando atualização via onUpdateStatus...');
                    await onUpdateStatus(appointment.id, 'completed');
                    console.log('✅ onUpdateStatus concluído com sucesso');
                    
                    // Refresh das estatísticas após conclusão
                    setTimeout(() => {
                      console.log('🔄 Atualizando estatísticas...');
                      refreshStats();
                    }, 500);
                  } catch (error) {
                    console.error('❌ Erro ao atualizar status:', error);
                    // Reverter otimistic update em caso de erro
                    updateLocalAppointmentStatus(appointment.id, 'confirmed');
                  }
                }} className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg active:animate-success-pulse">
                           <CheckCircle className="h-3 w-3 mr-1" />
                           Concluir
                         </Button>}
                     </div>
                   </div>)}
              </div>}
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
            {upcomingAppointments.length === 0 ? <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum agendamento próximo</p>
              </div> : <div className="space-y-3">
                 {upcomingAppointments.map(appointment => <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setSelectedAppointment(appointment)}>
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
                       {appointment.status === 'pending' && <Button size="sm" onClick={e => {
                  e.stopPropagation();
                  onUpdateStatus(appointment.id, 'confirmed');
                }} className="h-7 px-2 text-xs">
                           Confirmar
                         </Button>}
                         {appointment.status === 'confirmed' && <Button size="sm" variant="outline" onClick={async (e) => {
                  e.stopPropagation();
                  console.log('🔥 CleanDashboard PRÓXIMOS CONCLUIR CLICADO!', {
                    appointmentId: appointment.id,
                    status: appointment.status,
                    timestamp: new Date().toISOString()
                  });
                  
                  // Atualização otimista (visual imediata)
                  updateLocalAppointmentStatus(appointment.id, 'completed');
                  
                  try {
                    console.log('🔄 Iniciando atualização via onUpdateStatus (próximos)...');
                    await onUpdateStatus(appointment.id, 'completed');
                    console.log('✅ onUpdateStatus (próximos) concluído com sucesso');
                    
                    // Refresh das estatísticas após conclusão
                    setTimeout(() => {
                      console.log('🔄 Atualizando estatísticas (próximos)...');
                      refreshStats();
                    }, 500);
                  } catch (error) {
                    console.error('❌ Erro ao atualizar status (próximos):', error);
                    // Reverter otimistic update em caso de erro
                    updateLocalAppointmentStatus(appointment.id, 'confirmed');
                  }
                }} className="h-7 px-2 text-xs transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg active:animate-success-pulse border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                           <CheckCircle className="h-3 w-3 mr-1" />
                           Concluir
                         </Button>}
                     </div>
                   </div>)}
              </div>}
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
            {completedAppointments.length === 0 ? <div className="text-center py-8">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <History className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Nenhum atendimento concluído</p>
              </div> : <div className="space-y-3">
                 {completedAppointments.map(appointment => <div key={appointment.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setSelectedAppointment(appointment)}>
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
                   </div>)}
              </div>}
          </CardContent>
        </Card>
      </div>

      {/* Modal de limite atingido */}
      <PlanLimitReachedModal isOpen={showLimitModal} onClose={() => {
      setShowLimitModal(false);
      // Atualizar stats após fechar o modal (caso tenha havido upgrade)
      if (salon?.id) {
        getSalonAppointmentStats(salon.id).then(stats => {
          if (stats.success) {
            setAppointmentStats(stats);
          }
        });
      }
    }} currentPlan={salon.plan} currentAppointments={appointmentStats?.currentAppointments || 0} maxAppointments={appointmentStats?.maxAppointments || 0} salonId={salon.id} salonName={salon.name} />

      {/* Modal de detalhes do agendamento */}
      <AppointmentDetailsModal appointment={selectedAppointment} isOpen={!!selectedAppointment} onClose={() => setSelectedAppointment(null)} onStatusUpdate={() => {
      // Fechar modal e atualizar dados
      setSelectedAppointment(null);
      // Trigger refresh se necessário
    }} />
    </div>;
};
export default CleanDashboardOverview;