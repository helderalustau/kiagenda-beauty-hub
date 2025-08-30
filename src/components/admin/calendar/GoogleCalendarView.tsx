import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, MapPin } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentParser } from '@/hooks/useAppointmentParser';
import EnhancedAppointmentCard from './EnhancedAppointmentCard';

interface GoogleCalendarViewProps {
  appointments: Appointment[];
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => Promise<boolean>;
  isUpdating: boolean;
}

const GoogleCalendarView = ({ 
  appointments, 
  onUpdateAppointment, 
  isUpdating 
}: GoogleCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const { formatCurrency } = useAppointmentParser();

  const weekDays = useMemo(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    appointments.forEach(appointment => {
      const date = appointment.appointment_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });
    
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    });
    
    return grouped;
  }, [appointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 border-l-warning text-warning-foreground';
      case 'confirmed': return 'bg-primary/20 border-l-primary text-primary-foreground';
      case 'completed': return 'bg-success/20 border-l-success text-success-foreground';
      case 'cancelled': return 'bg-destructive/20 border-l-destructive text-destructive-foreground';
      default: return 'bg-muted/20 border-l-muted text-muted-foreground';
    }
  };

  const selectedDayAppointments = selectedDate 
    ? appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center text-xl font-semibold">
              <Calendar className="h-6 w-6 mr-3" />
              Agenda de Atendimentos
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Controles de Navegação */}
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (viewMode === 'week') {
                      setCurrentDate(subWeeks(currentDate, 1));
                    } else {
                      setCurrentDate(subMonths(currentDate, 1));
                    }
                  }}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="font-medium text-sm whitespace-nowrap px-4 min-w-[200px] text-center">
                  {viewMode === 'week' 
                    ? `${format(weekDays[0], 'dd MMM', { locale: ptBR })} - ${format(weekDays[weekDays.length - 1], 'dd MMM yyyy', { locale: ptBR })}`
                    : format(currentDate, 'MMMM yyyy', { locale: ptBR })
                  }
                </span>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (viewMode === 'week') {
                      setCurrentDate(addWeeks(currentDate, 1));
                    } else {
                      setCurrentDate(addMonths(currentDate, 1));
                    }
                  }}
                  className="h-9 w-9 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center space-x-2">
                <div className="flex bg-muted/50 rounded-lg p-1">
                  <Button 
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="h-8 px-3 text-xs"
                  >
                    Semana
                  </Button>
                  <Button 
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="h-8 px-3 text-xs"
                  >
                    Mês
                  </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="text-xs"
                >
                  Hoje
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-8 gap-6">
        {/* Week View */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardContent className="p-0">
              {/* Calendar Header */}
              {viewMode === 'week' ? (
                <div className="grid grid-cols-7 border-b">
                  {weekDays.map(day => (
                    <div 
                      key={day.toISOString()} 
                      className={`p-3 text-center border-r last:border-r-0 cursor-pointer transition-all duration-200 ${
                        isToday(day) 
                          ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                          : selectedDate && isSameDay(day, selectedDate)
                          ? 'bg-accent shadow-sm'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={`text-lg mt-1 ${isToday(day) ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      {appointmentsByDate[format(day, 'yyyy-MM-dd')] && (
                        <Badge variant="secondary" className="text-xs mt-1 h-5 animate-fade-in">
                          {appointmentsByDate[format(day, 'yyyy-MM-dd')].length}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border-b">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Calendar Body */}
              {viewMode === 'week' ? (
                <div className="grid grid-cols-7 h-[600px] overflow-y-auto">
                  {weekDays.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayAppointments = appointmentsByDate[dayKey] || [];
                    
                    return (
                      <div key={dayKey} className="border-r last:border-r-0 p-2 space-y-1">
                        {dayAppointments.map(appointment => (
                          <div
                            key={appointment.id}
                            className={`text-xs p-2 rounded-md border-l-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${getStatusColor(appointment.status)}`}
                            onClick={() => setSelectedDate(day)}
                          >
                            <div className="font-medium truncate">
                              {appointment.appointment_time}
                            </div>
                            <div className="truncate opacity-90">
                              {appointment.client?.name || 'Cliente'}
                            </div>
                            <div className="truncate text-[10px] opacity-75">
                              {appointment.service?.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4">
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => {
                      const dayKey = format(day, 'yyyy-MM-dd');
                      const dayAppointments = appointmentsByDate[dayKey] || [];
                      const dayOfMonth = format(day, 'd');
                      
                      return (
                        <div 
                          key={dayKey} 
                          className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isToday(day) 
                              ? 'bg-primary/5 border-primary/30 shadow-sm' 
                              : selectedDate && isSameDay(day, selectedDate)
                              ? 'bg-accent border-accent-foreground/30'
                              : 'hover:bg-muted/30'
                          }`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`text-sm font-medium mb-2 ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                            {dayOfMonth}
                          </div>
                          <div className="space-y-1">
                            {dayAppointments.slice(0, 3).map(appointment => (
                              <div
                                key={appointment.id}
                                className={`text-[10px] p-1 rounded border-l-2 truncate ${getStatusColor(appointment.status)}`}
                              >
                                {appointment.appointment_time} - {appointment.client?.name || 'Cliente'}
                              </div>
                            ))}
                            {dayAppointments.length > 3 && (
                              <div className="text-[10px] text-muted-foreground font-medium">
                                +{dayAppointments.length - 3} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? (
                  <>
                    {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
                    {isToday(selectedDate) && (
                      <Badge variant="outline" className="ml-2">Hoje</Badge>
                    )}
                  </>
                ) : (
                  'Selecione um dia'
                )}
              </CardTitle>
              {selectedDayAppointments.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {selectedDayAppointments.length} agendamento{selectedDayAppointments.length > 1 ? 's' : ''}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
              {selectedDate ? (
                selectedDayAppointments.length > 0 ? (
                  selectedDayAppointments.map(appointment => (
                    <EnhancedAppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      onUpdateAppointment={onUpdateAppointment}
                      isUpdating={isUpdating}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento para este dia</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Clique em um dia para ver os agendamentos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleCalendarView;