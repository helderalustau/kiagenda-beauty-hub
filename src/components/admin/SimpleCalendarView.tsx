import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import { useSimpleAppointmentManager } from '@/hooks/useSimpleAppointmentManager';
import SimpleAppointmentCard from './SimpleAppointmentCard';

interface SimpleCalendarViewProps {
  salonId: string;
  onRefresh?: () => void;
}

const SimpleCalendarView = ({ salonId, onRefresh }: SimpleCalendarViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    appointments,
    loading,
    updating,
    updateAppointmentStatus,
    fetchAppointments,
    totalAppointments
  } = useSimpleAppointmentManager({ salonId });

  // Setup realtime subscription for immediate updates
  useEffect(() => {
    if (!salonId) return;

    console.log('🔔 SimpleCalendarView: Configurando subscription realtime para salon:', salonId);
    
    const channel = supabase
      .channel(`calendar-updates-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        (payload) => {
          console.log('📝 SimpleCalendarView: Agendamento atualizado via realtime:', payload);
          // Refresh data to get latest state
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 SimpleCalendarView: Removendo subscription realtime');
      supabase.removeChannel(channel);
    };
  }, [salonId, fetchAppointments]);

  console.log('🗓️ SimpleCalendarView: Rendering with', {
    salonId,
    appointmentsCount: appointments.length,
    loading,
    updating,
    sampleAppointments: appointments.slice(0, 3).map(a => ({
      id: a.id,
      date: a.appointment_date,
      time: a.appointment_time,
      status: a.status,
      clientName: a.client?.name || a.client?.username
    }))
  });

  // Calendar navigation
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

  const weekDays = useMemo(() => getWeekDays(currentWeek), [currentWeek]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = !searchTerm || 
        apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.client?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Get appointments for a specific day
  const getAppointmentsForDay = (day: Date) => {
    const targetDate = day.toISOString().split('T')[0];
    const dayAppointments = filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === targetDate;
    });
    
    console.log(`📅 Appointments for ${targetDate}:`, {
      total: dayAppointments.length,
      appointments: dayAppointments.map(a => ({
        id: a.id,
        time: a.appointment_time,
        status: a.status,
        client: a.client?.name || a.client?.username
      }))
    });
    
    return dayAppointments;
  };

  const handleRefreshClick = async () => {
    await fetchAppointments();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    console.log('🔄 SimpleCalendarView: Atualizando status:', { appointmentId, newStatus });
    const success = await updateAppointmentStatus(appointmentId, newStatus);
    
    if (success) {
      console.log('✅ SimpleCalendarView: Status atualizado - sistema realtime sincronizará automaticamente');
    } else {
      console.error('❌ SimpleCalendarView: Falha ao atualizar status');
    }
    
    return success;
  };

  const handleUpdateAppointment = async (appointmentId: string, updates: { status: string; notes?: string }) => {
    console.log('🔄 SimpleCalendarView: Atualizando agendamento:', { appointmentId, updates });
    return await handleStatusUpdate(appointmentId, updates.status as any);
  };

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              Calendário Semanal ({totalAppointments} agendamentos)
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleRefreshClick} size="sm" variant="outline" disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button 
                onClick={() => {
                  console.log('🔍 DEBUG: Full appointments data:', appointments);
                  console.log('🔍 DEBUG: Filtered appointments:', filteredAppointments);
                  console.log('🔍 DEBUG: Current week days:', weekDays.map(d => d.toISOString().split('T')[0]));
                }} 
                size="sm" 
                variant="secondary"
              >
                Debug
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button onClick={() => navigateWeek('prev')} variant="outline" size="default" className="h-10">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h3 className="font-bold text-lg text-center px-4">
              {weekDays[0]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {weekDays[6]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h3>
            <Button onClick={() => navigateWeek('next')} variant="outline" size="default" className="h-10">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-10 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 h-10">
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

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Card 
              key={day.toISOString()} 
              className={`bg-white shadow-sm min-h-[280px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="pb-3 pt-4">
                <div className="text-center">
                  <p className={`text-base font-semibold ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                    {dayNames[index]}
                  </p>
                  <p className={`text-2xl font-bold ${isToday ? 'text-blue-800' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </p>
                  {dayAppointments.length > 0 && (
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                      isToday 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dayAppointments.length} agendamento{dayAppointments.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 p-4 pt-0">
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : dayAppointments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6 font-medium">Sem agendamentos</p>
                ) : (
                  dayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => {
                      console.log('🎯 Rendering appointment card:', {
                        id: appointment.id,
                        status: appointment.status,
                        time: appointment.appointment_time,
                        client: appointment.client?.name,
                        isUpdatingThis: updating === appointment.id
                      });
                      
                      return (
                        <SimpleAppointmentCard
                          key={appointment.id}
                          appointment={appointment}
                          onUpdateStatus={handleStatusUpdate}
                          isUpdating={updating === appointment.id}
                          compact={true}
                        />
                      );
                    })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Debug Info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs text-gray-600">
              Debug: SalonId={salonId}, Total={totalAppointments}, Filtered={filteredAppointments.length}, Loading={loading.toString()}, Updating={updating || 'none'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleCalendarView;