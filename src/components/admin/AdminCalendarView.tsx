
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import { useAppointmentData } from '@/hooks/useAppointmentData';
import MicroAppointmentCard from './MicroAppointmentCard';
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

  console.log('🗓️ AdminCalendarView - Estado atual:', {
    salonId,
    appointmentsCount: appointments.length,
    isInitialized,
    loading,
    appointments: appointments.slice(0, 3)
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered:', { salonId, isInitialized });
    if (salonId && !isInitialized) {
      console.log('📅 Inicializando calendar para salon:', salonId);
      loadAppointments();
    }
  }, [salonId, isInitialized]);

  const loadAppointments = async () => {
    if (!salonId) {
      console.warn('❌ SalonId não encontrado');
      return;
    }

    setLoading(true);
    try {
      console.log('📅 Carregando agendamentos...');
      await fetchAllAppointments(salonId);
      setIsInitialized(true);
      console.log('✅ Agendamentos carregados:', appointments.length);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    console.log('🔄 Calendar: Iniciando mudança de status:', { appointmentId, newStatus });
    
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus as AppointmentStatus);
      console.log('📋 Resultado da atualização:', result);
      
      if (result.success) {
        console.log('✅ Status atualizado - recarregando dados...');
        await loadAppointments();
        onRefresh();
      } else {
        console.error('❌ Falha ao atualizar:', result.message);
      }
    } catch (error) {
      console.error('❌ Erro na atualização:', error);
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
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchTerm || 
      apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  console.log('📊 Dados para render:', {
    weekDays: weekDays.length,
    filteredAppointments: filteredAppointments.length,
    loading,
    isInitialized
  });

  if (!isInitialized && loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando calendário...</p>
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
              Calendário Semanal ({filteredAppointments.length} agendamentos)
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

      {/* Grade do Calendário Semanal - SEMPRE VISÍVEL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayAppointments = filteredAppointments.filter(apt => {
            const aptDate = new Date(apt.appointment_date);
            return aptDate.toDateString() === day.toDateString();
          });

          console.log(`📅 Dia ${day.toDateString()}:`, dayAppointments.length, 'agendamentos');

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
                    <MicroAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateStatus={handleStatusChange}
                      showActions={true}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Debug Info - Temporário para verificação */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <p className="text-xs text-blue-800">
            <strong>🔧 Debug:</strong> SalonId: {salonId} | Total: {appointments.length} | 
            Filtrados: {filteredAppointments.length} | Inicializado: {isInitialized ? '✅' : '❌'} |
            Carregando: {loading ? '⏳' : '✅'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCalendarView;
