
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from '@/types/supabase-entities';
import { Calendar, Clock, User, Phone, CheckCircle, X, AlertCircle, MapPin, History, TrendingUp } from "lucide-react";
import { format } from "date-fns";
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
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 animate-pulse border-yellow-300">⏳ Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">✅ Confirmado</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">🎉 Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">❌ Cancelado</Badge>;
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
        toast({
          title: "Status atualizado!",
          description: `Agendamento marcado como ${newStatus === 'confirmed' ? 'confirmado' : newStatus === 'completed' ? 'concluído' : 'cancelado'}.`,
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

  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Filter appointments
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = apt.appointment_date;
    return appointmentDate > today && apt.status !== 'cancelled';
  });
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  
  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
  const completedCount = completedAppointments.length;
  const totalRevenue = completedAppointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);

  const renderAppointmentCard = (appointment: Appointment, showActions: boolean = true) => (
    <Card 
      key={appointment.id} 
      className={`transition-all duration-200 hover:shadow-lg ${
        appointment.status === 'pending' 
          ? 'border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-md ring-1 ring-yellow-200' 
          : appointment.status === 'confirmed'
          ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-cyan-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Horário e Status */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="bg-white rounded-lg px-3 py-1 shadow-sm border">
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-bold text-lg">{appointment.appointment_time}</span>
                  </div>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
            </div>
            
            {/* Informações do Cliente e Serviço */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div className="bg-white/70 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center text-gray-800 mb-1">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-semibold">{appointment.client?.name}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="h-3 w-3 mr-2" />
                  <span>{appointment.client?.phone}</span>
                </div>
              </div>
              
              <div className="bg-white/70 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center text-gray-800 mb-1">
                  <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="font-semibold">{appointment.service?.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-green-600">
                    {formatCurrency(appointment.service?.price || 0)}
                  </span>
                  {appointment.service?.duration_minutes && (
                    <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {appointment.service.duration_minutes} min
                    </span>
                  )}
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r-lg mb-3">
                <p className="text-sm text-blue-800">
                  <strong>💭 Observações:</strong> {appointment.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && appointment.status !== 'cancelled' && (
            <div className="flex flex-col space-y-2 ml-4">
              {appointment.status === 'pending' && (
                <>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 shadow-md"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Recusar
                  </Button>
                </>
              )}
              
              {appointment.status === 'confirmed' && (
                <Button
                  onClick={() => handleStatusChange(appointment.id, 'completed')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 shadow-md"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Hoje</p>
                <p className="text-3xl font-bold">{todayAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pendentes</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Concluídos</p>
                <p className="text-3xl font-bold">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Receita</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calendar className="h-7 w-7 mr-3 text-blue-600" />
            Agendamentos de Hoje
          </h3>
          {todayAppointments.length > 0 && (
            <Badge variant="outline" className="text-base px-3 py-1">
              {todayAppointments.length} agendamento{todayAppointments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        
        {todayAppointments.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200">
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">Nenhum agendamento para hoje</h3>
              <p className="text-gray-500">Você está livre hoje! 🎉</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayAppointments
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
              .map(appointment => renderAppointmentCard(appointment, true))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Clock className="h-6 w-6 mr-2 text-green-600" />
          Próximos Agendamentos
          {upcomingAppointments.length > 0 && (
            <Badge variant="outline" className="ml-3">
              {upcomingAppointments.length}
            </Badge>
          )}
        </h3>
        
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum agendamento futuro</h3>
              <p className="text-gray-500">Aguardando novos agendamentos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments
              .sort((a, b) => {
                if (a.appointment_date === b.appointment_date) {
                  return a.appointment_time.localeCompare(b.appointment_time);
                }
                return a.appointment_date.localeCompare(b.appointment_date);
              })
              .slice(0, 5)
              .map(appointment => (
                <div key={appointment.id}>
                  <div className="text-sm font-medium text-gray-600 mb-2 ml-2">
                    📅 {format(new Date(appointment.appointment_date), "dd 'de' MMMM", { locale: ptBR })}
                  </div>
                  {renderAppointmentCard(appointment, true)}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalendarView;
