
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, Search, Filter, CheckCircle, XCircle, Eye, Edit } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/hooks/use-toast";
import { Appointment } from '@/types/supabase-entities';

interface OptimizedAdminCalendarViewProps {
  onRefresh: () => Promise<void>;
  salonId: string;
}

const OptimizedAdminCalendarView = ({ onRefresh, salonId }: OptimizedAdminCalendarViewProps) => {
  const { appointments, fetchAllAppointments, updateAppointmentStatus, loading } = useAppointmentData();
  const { toast } = useToast();
  
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');

  useEffect(() => {
    if (salonId) {
      fetchAllAppointments(salonId, false);
    }
  }, [salonId, fetchAllAppointments]);

  // Filtrar agendamentos
  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    const matchesSearch = !searchTerm || 
      appointment.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.client?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (viewMode === 'week') {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
      const appointmentDate = new Date(appointment.appointment_date);
      return appointmentDate >= currentWeekStart && appointmentDate <= weekEnd && matchesStatus && matchesSearch;
    } else {
      return isSameDay(new Date(appointment.appointment_date), selectedDate) && matchesStatus && matchesSearch;
    }
  });

  // Organizar por data e hora
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const dateA = new Date(`${a.appointment_date} ${a.appointment_time}`);
    const dateB = new Date(`${b.appointment_date} ${b.appointment_time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      
      if (result.success) {
        toast({
          title: "Status atualizado com sucesso!",
          description: `Agendamento ${getStatusLabel(newStatus).toLowerCase()}.`,
        });
        await onRefresh();
      } else {
        toast({
          title: "Erro ao atualizar status",
          description: result.message || "Erro ao atualizar agendamento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar agendamento",
        variant: "destructive"
      });
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeekStart(prev => addDays(prev, direction === 'next' ? 7 : -7));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header da Agenda */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <CardTitle className="text-2xl font-bold flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-blue-600" />
              Agenda de Atendimentos
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtros */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>

              {/* Modo de Visualização */}
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'week' | 'day')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="day">Dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Busca */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Navegação de Semana */}
            {viewMode === 'week' && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  ←
                </Button>
                <span className="text-sm font-medium whitespace-nowrap">
                  {format(currentWeekStart, "dd/MM", { locale: ptBR })} - {format(endOfWeek(currentWeekStart, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  →
                </Button>
              </div>
            )}

            {/* Seletor de Data para Modo Dia */}
            {viewMode === 'day' && (
              <Input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-40"
              />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Visualização da Agenda */}
      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayAppointments = sortedAppointments.filter(apt => 
              isSameDay(new Date(apt.appointment_date), day)
            );

            return (
              <Card key={day.toISOString()} className="min-h-[400px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-center">
                    {format(day, "EEE dd/MM", { locale: ptBR })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayAppointments.length > 0 ? (
                    dayAppointments.map((appointment) => (
                      <div key={appointment.id} className="bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
                          <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {appointment.appointment_time}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            {appointment.client?.name || appointment.client?.username}
                          </p>
                          <p className="text-xs text-gray-600">
                            {appointment.service?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatCurrency(appointment.service?.price || 0)}
                          </p>
                        </div>

                        {appointment.status === 'pending' && (
                          <div className="flex space-x-1 mt-2">
                            <Button 
                              size="sm" 
                              className="h-6 text-xs flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 text-xs flex-1 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Recusar
                            </Button>
                          </div>
                        )}

                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            className="w-full h-6 text-xs mt-2 bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Finalizar
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-8">
                      Nenhum agendamento
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Visualização por Dia
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedAppointments.length > 0 ? (
              <div className="space-y-4">
                {sortedAppointments.map((appointment) => (
                  <Card key={appointment.id} className="border-l-4 border-blue-400">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {appointment.appointment_time}
                            </p>
                            <p className="text-sm text-gray-600">
                              {appointment.service?.name} - {appointment.service?.duration_minutes}min
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            Cliente
                          </h4>
                          <p className="text-sm text-gray-700">
                            {appointment.client?.name || appointment.client?.username}
                          </p>
                          {appointment.client?.phone && (
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {appointment.client.phone}
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Serviço</h4>
                          <p className="text-sm text-gray-700">{appointment.service?.name}</p>
                          <p className="text-sm text-green-600 font-medium">
                            {formatCurrency(appointment.service?.price || 0)}
                          </p>
                        </div>
                      </div>

                      {appointment.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <p className="text-sm text-gray-700">
                            <strong>Observações:</strong> {appointment.notes}
                          </p>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex space-x-2 mt-4">
                        {appointment.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Recusar
                            </Button>
                          </>
                        )}

                        {appointment.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Finalizar Atendimento
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum agendamento para este dia</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Resumo */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-600">
                {filteredAppointments.filter(apt => apt.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pendentes</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {filteredAppointments.filter(apt => apt.status === 'confirmed').length}
              </p>
              <p className="text-sm text-gray-600">Confirmados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {filteredAppointments.filter(apt => apt.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Concluídos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">
                {filteredAppointments.filter(apt => apt.status === 'cancelled').length}
              </p>
              <p className="text-sm text-gray-600">Cancelados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedAdminCalendarView;
