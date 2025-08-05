import React, { useState, useMemo } from 'react';
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

  console.log('🗓️ SimpleCalendarView: Rendering with', {
    salonId,
    appointmentsCount: appointments.length,
    loading,
    updating
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
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === targetDate;
    });
  };

  const handleRefreshClick = async () => {
    await fetchAppointments();
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const success = await updateAppointmentStatus(appointmentId, newStatus);
    if (success && onRefresh) {
      onRefresh();
    }
    return success;
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
            <Button onClick={handleRefreshClick} size="sm" variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week Navigation */}
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

          {/* Filters */}
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

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <Card 
              key={day.toISOString()} 
              className={`bg-white shadow-sm min-h-[200px] ${isToday ? 'ring-2 ring-blue-500' : ''}`}
            >
              <CardHeader className="pb-2 pt-3">
                <div className="text-center">
                  <p className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                    {dayNames[index]}
                  </p>
                  <p className={`text-lg font-bold ${isToday ? 'text-blue-800' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </p>
                  {dayAppointments.length > 0 && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      isToday 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {dayAppointments.length}
                    </span>
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
                  dayAppointments
                    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                    .map((appointment) => (
                      <SimpleAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdateStatus={handleStatusUpdate}
                        isUpdating={updating === appointment.id}
                        compact={true}
                      />
                    ))
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