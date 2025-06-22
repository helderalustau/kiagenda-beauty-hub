
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Appointment } from '@/types/supabase-entities';
import { Calendar, Clock, User, Phone, CheckCircle, X, AlertCircle, MapPin, TrendingUp, CalendarDays, Eye, Filter } from "lucide-react";
import { format, isToday, isThisWeek, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/hooks/use-toast";

interface AdminCalendarViewProps {
  appointments: Appointment[];
  onRefresh: () => void;
  salonId: string;
}

const AdminCalendarView = ({ appointments, onRefresh, salonId }: AdminCalendarViewProps) => {
  const { updateAppointmentStatus } = useAppointmentData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('today');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 border-amber-300 animate-pulse shadow-sm">⏳ Aguardando</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300 shadow-sm">✅ Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm">🎉 Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="shadow-sm">❌ Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.success) {
        const statusText = newStatus === 'confirmed' ? 'confirmado' : newStatus === 'completed' ? 'concluído' : 'cancelado';
        toast({
          title: "✅ Status atualizado!",
          description: `Agendamento marcado como ${statusText}.`,
        });
        onRefresh();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar status do agendamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do agendamento",
        variant: "destructive"
      });
    }
  };

  // Filtrar agendamentos
  const today = new Date();
  const todayAppointments = appointments.filter(apt => {
    const appointmentDate = parseISO(apt.appointment_date);
    return isToday(appointmentDate) && apt.status !== 'cancelled';
  });

  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = parseISO(apt.appointment_date);
    return appointmentDate > today && apt.status !== 'cancelled';
  });

  const thisWeekAppointments = appointments.filter(apt => {
    const appointmentDate = parseISO(apt.appointment_date);
    return isThisWeek(appointmentDate) && apt.status !== 'cancelled';
  });

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card 
      key={appointment.id} 
      className={`transition-all duration-300 hover:shadow-xl border-l-4 ${
        appointment.status === 'pending' 
          ? 'border-l-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 shadow-lg ring-1 ring-amber-200 hover:ring-amber-300' 
          : appointment.status === 'confirmed'
          ? 'border-l-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50 hover:shadow-lg'
          : appointment.status === 'completed'
          ? 'border-l-emerald-400 bg-gradient-to-r from-emerald-50 to-green-50'
          : 'border-l-gray-300 bg-gray-50'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            {/* Header com horário e status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white rounded-xl px-4 py-2 shadow-md border-2 border-gray-100">
                  <div className="flex items-center text-gray-800">
                    <Clock className="h-5 w-5 mr-2 text-blue-600" />
                    <span className="font-bold text-xl">{appointment.appointment_time.substring(0, 5)}</span>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
              <div className="text-sm text-gray-500 font-medium">
                {format(parseISO(appointment.appointment_date), "EEE, dd/MM", { locale: ptBR })}
              </div>
            </div>
            
            {/* Informações principais */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center text-gray-800 mb-2">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{appointment.client?.name}</p>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Phone className="h-3 w-3 mr-1" />
                      <span>{appointment.client?.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Serviço */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center text-gray-800 mb-2">
                  <div className="bg-purple-500 rounded-full p-2 mr-3">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{appointment.service?.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-600 text-lg">
                        {formatCurrency(appointment.service?.price || 0)}
                      </span>
                      <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                        {appointment.service?.duration_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            {appointment.notes && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                <div className="flex items-start">
                  <div className="bg-blue-400 rounded-full p-1 mr-2 mt-0.5">
                    <Eye className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Observações:</p>
                    <p className="text-blue-700">{appointment.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões de ação */}
          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <div className="flex flex-col space-y-3 ml-6">
              {appointment.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Recusar
                  </Button>
                </>
              )}
              
              {appointment.status === 'confirmed' && (
                <Button
                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Concluir
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wide">Hoje</p>
                <p className="text-4xl font-bold mt-1">{todayAppointments.length}</p>
                <p className="text-blue-200 text-xs mt-1">agendamentos</p>
              </div>
              <div className="bg-blue-500 rounded-full p-3">
                <CalendarDays className="h-8 w-8 text-blue-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium uppercase tracking-wide">Pendentes</p>
                <p className="text-4xl font-bold mt-1">{pendingAppointments.length}</p>
                <p className="text-amber-200 text-xs mt-1">aguardando</p>
              </div>
              <div className="bg-amber-400 rounded-full p-3">
                <AlertCircle className="h-8 w-8 text-amber-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">Concluídos</p>
                <p className="text-4xl font-bold mt-1">{completedAppointments.length}</p>
                <p className="text-emerald-200 text-xs mt-1">finalizados</p>
              </div>
              <div className="bg-emerald-400 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-emerald-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-200 transform hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium uppercase tracking-wide">Receita</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
                <p className="text-purple-200 text-xs mt-1">total</p>
              </div>
              <div className="bg-purple-400 rounded-full p-3">
                <TrendingUp className="h-8 w-8 text-purple-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agenda com Tabs */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-8 w-8 mr-3 text-blue-600" />
            Agenda de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-xl">
              <TabsTrigger 
                value="today" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                Hoje ({todayAppointments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="week"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Esta Semana ({thisWeekAppointments.length})
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200"
              >
                <Clock className="h-4 w-4 mr-2" />
                Próximos ({upcomingAppointments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-4">
              {todayAppointments.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-16 text-center">
                    <CalendarDays className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-medium text-gray-600 mb-3">Nenhum agendamento hoje</h3>
                    <p className="text-gray-500 text-lg">Você está livre hoje! 🎉</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {todayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map(renderAppointmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="week" className="space-y-4">
              {thisWeekAppointments.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-16 text-center">
                    <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-medium text-gray-600 mb-3">Nenhum agendamento esta semana</h3>
                    <p className="text-gray-500 text-lg">Semana tranquila!</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {thisWeekAppointments
                    .sort((a, b) => {
                      if (a.appointment_date === b.appointment_date) {
                        return a.appointment_time.localeCompare(b.appointment_time);
                      }
                      return a.appointment_date.localeCompare(b.appointment_date);
                    })
                    .map(renderAppointmentCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <Card className="border-2 border-dashed border-gray-200 bg-gray-50">
                  <CardContent className="p-16 text-center">
                    <Clock className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-medium text-gray-600 mb-3">Nenhum agendamento futuro</h3>
                    <p className="text-gray-500 text-lg">Aguardando novos agendamentos.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {upcomingAppointments
                    .sort((a, b) => {
                      if (a.appointment_date === b.appointment_date) {
                        return a.appointment_time.localeCompare(b.appointment_time);
                      }
                      return a.appointment_date.localeCompare(b.appointment_date);
                    })
                    .slice(0, 10)
                    .map(renderAppointmentCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCalendarView;
