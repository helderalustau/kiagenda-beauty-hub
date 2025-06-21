
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from '@/types/supabase-entities';
import { Calendar, Clock, User, Phone, CheckCircle, X, AlertCircle, MapPin, History } from "lucide-react";
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
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 animate-pulse">Pendente</Badge>;
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Confirmado</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
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

  const renderAppointmentCard = (appointment: Appointment, showActions: boolean = true) => (
    <Card 
      key={appointment.id} 
      className={`hover:shadow-md transition-shadow ${
        appointment.status === 'pending' 
          ? 'border-yellow-200 bg-yellow-50/50 shadow-lg' 
          : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-medium">{appointment.appointment_time}</span>
              </div>
              {getStatusBadge(appointment.status)}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center text-gray-700 mb-1">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium">{appointment.client?.name}</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{appointment.client?.phone}</span>
                </div>
              </div>
              
              <div>
                <div className="flex items-center text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="font-medium">{appointment.service?.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">
                    {formatCurrency(appointment.service?.price || 0)}
                  </span>
                  {appointment.service?.duration_minutes && (
                    <span className="text-gray-500 ml-2">
                      ({appointment.service.duration_minutes} min)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Observações:</strong> {appointment.notes}
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
                    className="bg-blue-600 hover:bg-blue-700"
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
                  className="bg-green-600 hover:bg-green-700"
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
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Hoje</p>
                <p className="text-2xl font-bold text-blue-900">{todayAppointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Confirmados</p>
                <p className="text-2xl font-bold text-blue-900">{confirmedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-900">{completedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          Agendamentos de Hoje
          {todayAppointments.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {todayAppointments.length} agendamento{todayAppointments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
        
        {todayAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento para hoje</h3>
              <p className="text-gray-500">Você não tem agendamentos para hoje.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todayAppointments
              .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
              .map(appointment => renderAppointmentCard(appointment, true))}
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Clock className="h-6 w-6 mr-2" />
          Próximos Agendamentos
          {upcomingAppointments.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {upcomingAppointments.length} agendamento{upcomingAppointments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
        
        {upcomingAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento futuro</h3>
              <p className="text-gray-500">Você não tem agendamentos futuros.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments
              .sort((a, b) => {
                if (a.appointment_date === b.appointment_date) {
                  return a.appointment_time.localeCompare(b.appointment_time);
                }
                return a.appointment_date.localeCompare(b.appointment_date);
              })
              .map(appointment => (
                <div key={appointment.id}>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  {renderAppointmentCard(appointment, true)}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Completed Appointments History */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <History className="h-6 w-6 mr-2" />
          Histórico de Agendamentos Concluídos
          {completedAppointments.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {completedAppointments.length} agendamento{completedAppointments.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </h3>
        
        {completedAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento concluído</h3>
              <p className="text-gray-500">O histórico aparecerá aqui conforme os agendamentos forem concluídos.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {completedAppointments
              .sort((a, b) => {
                if (a.appointment_date === b.appointment_date) {
                  return b.appointment_time.localeCompare(a.appointment_time);
                }
                return b.appointment_date.localeCompare(a.appointment_date);
              })
              .map(appointment => (
                <div key={appointment.id}>
                  <div className="text-sm font-medium text-gray-600 mb-2">
                    {format(new Date(appointment.appointment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  {renderAppointmentCard(appointment, false)}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCalendarView;
