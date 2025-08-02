import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Search, Filter, RefreshCw } from "lucide-react";
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { Appointment } from '@/types/supabase-entities';

interface AdminCalendarViewProps {
  salonId: string;
  onRefresh: () => void;
}

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const AdminCalendarView = ({ salonId, onRefresh }: AdminCalendarViewProps) => {
  const { appointments, fetchAllAppointments, updateAppointmentStatus } = useAppointmentData();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (salonId) {
      console.log('📅 AdminCalendarView carregando para salon:', salonId);
      loadAppointments();
    }
  }, [salonId, currentWeek]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      console.log('📅 Carregando agendamentos...');
      await fetchAllAppointments(salonId);
      console.log('✅ Agendamentos carregados:', appointments.length);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      console.log('🔄 Atualizando status no calendar:', { appointmentId, newStatus });
      await updateAppointmentStatus(appointmentId, newStatus);
      console.log('✅ Status atualizado, recarregando...');
      await loadAppointments();
      onRefresh();
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
    }
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchTerm || 
      apt.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  console.log('📅 Renderizando calendar com:', { 
    appointmentsCount: appointments.length, 
    filteredCount: filteredAppointments.length,
    loading 
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Controls */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              Agenda Semanal
            </CardTitle>
            <Button onClick={onRefresh} size="sm" variant="outline" className="text-xs sm:text-sm">
              <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button onClick={() => navigateWeek('prev')} variant="outline" size="sm" className="text-xs sm:text-sm">
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h3 className="font-semibold text-sm sm:text-lg text-center">
              {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h3>
            <Button onClick={() => navigateWeek('next')} variant="outline" size="sm" className="text-xs sm:text-sm">
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs sm:text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-4">
        {weekDays.map((day, index) => {
          const dayAppointments = filteredAppointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.toDateString() === day.toDateString();
          });

          return (
            <Card key={day.toISOString()} className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{dayNames[index]}</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900">{day.getDate()}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                {dayAppointments.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-400 text-center py-2 sm:py-4">Nenhum agendamento</p>
                ) : (
                  dayAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs sm:text-sm font-medium">{appointment.appointment_time}</span>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} text-xs`} variant="secondary">
                          {appointment.status === 'pending' && 'Pendente'}
                          {appointment.status === 'confirmed' && 'Confirmado'}
                          {appointment.status === 'completed' && 'Concluído'}
                          {appointment.status === 'cancelled' && 'Cancelado'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-0.5 sm:space-y-1">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <User className="h-3 w-3 text-gray-500" />
                          <span className="text-xs sm:text-sm font-medium truncate">{appointment.client?.name}</span>
                        </div>
                        {appointment.client?.phone && (
                          <div className="flex items-center gap-1 sm:gap-2">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{appointment.client.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-1 sm:pt-2 border-t border-gray-200">
                        <p className="text-xs sm:text-sm font-medium truncate">{appointment.service?.name}</p>
                        <p className="text-xs text-gray-600">{appointment.service?.duration_minutes}min</p>
                        <p className="text-xs sm:text-sm font-bold text-green-600">
                          {formatCurrency(appointment.service?.price || 0)}
                        </p>
                      </div>

                      {appointment.status === 'pending' && (
                        <div className="flex gap-1 sm:gap-2 pt-1 sm:pt-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-6 sm:h-8"
                          >
                            Confirmar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-6 sm:h-8"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}

                      {appointment.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="w-full bg-green-600 hover:bg-green-700 text-xs h-6 sm:h-8"
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-4 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2 sm:mb-4"></div>
          <p className="text-gray-600 text-xs sm:text-sm">Carregando agendamentos...</p>
        </div>
      )}
    </div>
  );
};

export default AdminCalendarView;
