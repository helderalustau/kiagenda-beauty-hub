
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Appointment } from '@/types/supabase-entities';
import { Calendar, Clock, User, Phone, CheckCircle, X, AlertCircle, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/components/ui/use-toast";

interface AdminCalendarViewProps {
  appointments: Appointment[];
  onRefresh: () => void;
  salonId: string;
}

const AdminCalendarView = ({ appointments, onRefresh, salonId }: AdminCalendarViewProps) => {
  const { updateAppointmentStatus } = useAppointmentData();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Filter appointments by status and date
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const appointmentDate = new Date(appointment.appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    return matchesStatus && appointmentDate >= today;
  });

  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce((acc, appointment) => {
    const date = appointment.appointment_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Sort appointments by time within each date
  Object.keys(appointmentsByDate).forEach(date => {
    appointmentsByDate[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  });

  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today;
  });

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;
  const completedCount = appointments.filter(apt => apt.status === 'completed').length;

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

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="confirmed">Confirmados</SelectItem>
            <SelectItem value="completed">Concluídos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments List */}
      <div className="space-y-6">
        {Object.keys(appointmentsByDate).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-500">Não há agendamentos para os filtros selecionados.</p>
            </CardContent>
          </Card>
        ) : (
          Object.keys(appointmentsByDate)
            .sort()
            .map(date => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  <Badge variant="outline" className="ml-2">
                    {appointmentsByDate[date].length} agendamento{appointmentsByDate[date].length !== 1 ? 's' : ''}
                  </Badge>
                </h3>
                
                <div className="space-y-3">
                  {appointmentsByDate[date].map((appointment) => (
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
                          {appointment.status !== 'cancelled' && (
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
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default AdminCalendarView;
