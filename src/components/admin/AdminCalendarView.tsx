
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

  console.log('🗓️ AdminCalendarView - Renderizando:', {
    salonId,
    appointmentsCount: appointments.length,
    loading
  });

  // Carrega os dados quando o componente é montado
  useEffect(() => {
    if (salonId) {
      console.log('📅 Iniciando carregamento de agendamentos para salon:', salonId);
      loadAppointments();
    }
  }, [salonId]);

  const loadAppointments = async () => {
    if (!salonId) {
      console.warn('❌ SalonId não encontrado para carregar agendamentos');
      return;
    }

    setLoading(true);
    try {
      console.log('📅 Fazendo fetch de agendamentos...');
      const result = await fetchAllAppointments(salonId);
      console.log('✅ Agendamentos carregados:', {
        success: result.success,
        count: result.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    console.log('🔄 Atualizando status do agendamento:', { appointmentId, newStatus });
    
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus as AppointmentStatus);
      console.log('📋 Resultado da atualização de status:', result);
      
      if (result.success) {
        console.log('✅ Status atualizado com sucesso - recarregando dados...');
        await loadAppointments();
        onRefresh();
      } else {
        console.error('❌ Falha ao atualizar status:', result.message);
      }
    } catch (error) {
      console.error('❌ Erro na atualização de status:', error);
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
    console.log('📅 Navegando para nova semana:', newDate);
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

  console.log('📅 Dados do calendário:', {
    weekDays: weekDays.length,
    filteredAppointments: filteredAppointments.length,
    currentWeek: currentWeek.toDateString()
  });

  return (
    <div className="space-y-4">
      {/* Header */}
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
              {weekDays[0]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {weekDays[6]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
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

      {/* Grade do Calendário Semanal - SEMPRE RENDERIZADA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          if (!day) return null;
          
          const dayAppointments = filteredAppointments.filter(apt => {
            try {
              const aptDate = new Date(apt.appointment_date);
              return aptDate.toDateString() === day.toDateString();
            } catch (error) {
              console.error('Erro ao processar data do agendamento:', error);
              return false;
            }
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
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : dayAppointments.length === 0 ? (
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

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-600">
              Debug: SalonId={salonId}, Appointments={appointments.length}, Filtered={filteredAppointments.length}, Loading={loading.toString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminCalendarView;
