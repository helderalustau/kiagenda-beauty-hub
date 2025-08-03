
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Search, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
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
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🗓️ AdminCalendarView - Renderizando com:', {
    salonId,
    appointmentsCount: appointments.length,
    isInitialized,
    loading
  });

  useEffect(() => {
    if (salonId && !isInitialized) {
      console.log('📅 Inicializando calendario para salon:', salonId);
      loadAppointments();
    }
  }, [salonId, isInitialized]);

  const loadAppointments = async () => {
    if (!salonId) {
      console.warn('❌ SalonId não encontrado para carregar agendamentos');
      return;
    }

    setLoading(true);
    try {
      console.log('📅 Carregando agendamentos para salon:', salonId);
      await fetchAllAppointments(salonId);
      setIsInitialized(true);
      console.log('✅ Agendamentos carregados:', appointments.length);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      console.log('🔄 Atualizando status:', { appointmentId, newStatus });
      const result = await updateAppointmentStatus(appointmentId, newStatus);
      if (result.success) {
        console.log('✅ Status atualizado com sucesso');
        await loadAppointments();
        onRefresh();
      } else {
        console.error('❌ Falha ao atualizar status:', result.message);
      }
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
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      week.push(dayDate);
    }
    return week;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
    console.log('📅 Navegando para semana:', newDate);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchTerm || 
      apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  console.log('🔍 Agendamentos filtrados:', {
    total: appointments.length,
    filtered: filteredAppointments.length,
    searchTerm,
    statusFilter
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

  // Se não inicializou ainda, mostra loading
  if (!isInitialized && loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando calendario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              Calendário de Agendamentos ({filteredAppointments.length} agendamentos)
            </CardTitle>
            <Button onClick={loadAppointments} size="sm" variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navegação da Semana */}
          <div className="flex items-center justify-between">
            <Button onClick={() => navigateWeek('prev')} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-center">
              {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h3>
            <Button onClick={() => navigateWeek('next')} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grade do Calendário Semanal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayAppointments = filteredAppointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.toDateString() === day.toDateString();
          });

          return (
            <Card key={day.toISOString()} className="bg-white shadow-sm min-h-[200px]">
              <CardHeader className="pb-2 pt-3">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">{dayNames[index]}</p>
                  <p className="text-lg font-bold text-gray-900">{day.getDate()}</p>
                  {dayAppointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 p-3 pt-0">
                {dayAppointments.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">Sem agendamentos</p>
                ) : (
                  dayAppointments.map((appointment) => (
                    <div key={appointment.id} className="bg-gray-50 rounded-md p-2 space-y-1 text-xs border">
                      {/* Header compacto */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5 text-gray-500" />
                          <span className="font-semibold text-xs">{appointment.appointment_time}</span>
                        </div>
                        <Badge className={`${getStatusColor(appointment.status)} text-xs px-1 py-0`}>
                          {appointment.status === 'pending' && 'Pend'}
                          {appointment.status === 'confirmed' && 'Conf'}
                          {appointment.status === 'completed' && 'Concl'}
                          {appointment.status === 'cancelled' && 'Canc'}
                        </Badge>
                      </div>
                      
                      {/* Cliente */}
                      <div className="flex items-center gap-1">
                        <User className="h-2.5 w-2.5 text-gray-500" />
                        <span className="font-medium truncate text-xs">{appointment.client?.name}</span>
                      </div>

                      {/* Serviço e preço */}
                      <div className="pt-1 border-t border-gray-200">
                        <p className="font-medium truncate text-xs">{appointment.service?.name}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-600 font-bold text-xs">
                            {formatCurrency(appointment.service?.price || 0)}
                          </span>
                          <span className="text-gray-500 text-xs">
                            ({appointment.service?.duration_minutes}min)
                          </span>
                        </div>
                      </div>

                      {/* Botões de ação compactos */}
                      {appointment.status === 'pending' && (
                        <div className="flex gap-1 pt-1">
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-xs h-5 px-1"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            OK
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-5 px-1"
                          >
                            <XCircle className="h-2.5 w-2.5 mr-0.5" />
                            X
                          </Button>
                        </div>
                      )}

                      {appointment.status === 'confirmed' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleStatusChange(appointment.id, 'completed')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-xs h-5 font-bold"
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                          CONCLUIR
                        </Button>
                      )}

                      {appointment.status === 'completed' && (
                        <div className="text-center py-1">
                          <span className="text-xs text-green-600 font-bold">✅ CONCLUÍDO</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <p className="text-xs text-blue-800">
            <strong>Debug:</strong> SalonId: {salonId} | Agendamentos: {appointments.length} | 
            Filtrados: {filteredAppointments.length} | Inicializado: {isInitialized ? 'Sim' : 'Não'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCalendarView;
