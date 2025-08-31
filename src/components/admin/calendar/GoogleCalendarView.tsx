import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone, MapPin } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentParser } from '@/hooks/useAppointmentParser';
import { useIsMobile } from '@/hooks/use-mobile';
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
  const isMobile = useIsMobile();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'month'>(isMobile ? 'month' : 'week');
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
      case 'pending': return 'bg-amber-500 text-amber-900 border-amber-600';
      case 'confirmed': return 'bg-blue-500 text-blue-900 border-blue-600';
      case 'completed': return 'bg-green-500 text-green-900 border-green-600';
      case 'cancelled': return 'bg-red-500 text-red-900 border-red-600';
      default: return 'bg-gray-400 text-gray-800 border-gray-500';
    }
  };

  const getStatusColorMobile = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-l-amber-500';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-l-blue-500';
      case 'completed': return 'bg-green-100 text-green-800 border-l-green-500';
      case 'cancelled': return 'bg-red-100 text-red-800 border-l-red-500';
      default: return 'bg-gray-100 text-gray-700 border-l-gray-400';
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

      {/* Mobile-first Calendar Grid */}
      <div className={`flex-1 ${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-8 gap-6'}`}>
        {/* Calendar View */}
        <div className={isMobile ? '' : 'lg:col-span-5'}>
          <Card className="h-full">
            <CardContent className="p-0">
              {/* Mobile Month View - Similar to Google Calendar */}
              {viewMode === 'month' ? (
                <div className="p-2 sm:p-4">
                  {/* Days Header */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
                      <div key={index} className="text-center text-xs sm:text-sm font-semibold text-muted-foreground py-1 sm:py-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {weekDays.map(day => {
                      const dayKey = format(day, 'yyyy-MM-dd');
                      const dayAppointments = appointmentsByDate[dayKey] || [];
                      const dayOfMonth = format(day, 'd');
                      const isCurrentMonth = getMonth(day) === getMonth(currentDate);
                      
                      return (
                        <div 
                          key={dayKey} 
                          className={`min-h-[80px] sm:min-h-[100px] p-1 sm:p-2 cursor-pointer transition-all duration-200 hover:bg-muted/50 ${
                            !isCurrentMonth ? 'opacity-30' : ''
                          } ${
                            isToday(day) 
                              ? 'bg-primary/10 rounded-lg' 
                              : selectedDate && isSameDay(day, selectedDate)
                              ? 'bg-accent rounded-lg'
                              : ''
                          }`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isToday(day) ? 'text-primary font-bold' : 
                            !isCurrentMonth ? 'text-muted-foreground' : ''
                          }`}>
                            {dayOfMonth}
                          </div>
                          
                          <div className="space-y-1 overflow-hidden">
                            {dayAppointments.slice(0, 2).map(appointment => (
                              <div
                                key={appointment.id}
                                className={`text-[10px] sm:text-xs px-1 py-0.5 rounded-sm font-medium truncate ${getStatusColor(appointment.status)}`}
                              >
                                {appointment.appointment_time.slice(0, 5)}
                              </div>
                            ))}
                            {dayAppointments.length > 2 && (
                              <div className="text-[9px] text-muted-foreground font-medium truncate">
                                +{dayAppointments.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Week View */
                <>
                  <div className="grid grid-cols-7 border-b">
                    {weekDays.map(day => (
                      <div 
                        key={day.toISOString()} 
                        className={`p-2 sm:p-3 text-center border-r last:border-r-0 cursor-pointer transition-all duration-200 ${
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
                  
                  <div className="grid grid-cols-7 h-[400px] sm:h-[600px] overflow-y-auto">
                    {weekDays.map(day => {
                      const dayKey = format(day, 'yyyy-MM-dd');
                      const dayAppointments = appointmentsByDate[dayKey] || [];
                      
                      return (
                        <div key={dayKey} className="border-r last:border-r-0 p-1 sm:p-2 space-y-1">
                          {dayAppointments.map(appointment => (
                            <div
                              key={appointment.id}
                              className={`text-xs p-1 sm:p-2 rounded-md border-l-4 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] ${getStatusColorMobile(appointment.status)}`}
                              onClick={() => setSelectedDate(day)}
                            >
                              <div className="font-semibold truncate text-xs">
                                {appointment.appointment_time.slice(0, 5)}
                              </div>
                              <div className="truncate text-[10px] sm:text-xs font-medium">
                                {appointment.client?.name || 'Cliente'}
                              </div>
                              <div className="truncate text-[9px] sm:text-[10px] opacity-80">
                                {appointment.service?.name}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detailed View */}
        {selectedDate && (
          <div className={isMobile ? '' : 'lg:col-span-3'}>
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
              
              <CardContent className={`space-y-4 ${isMobile ? 'max-h-[400px]' : 'max-h-[600px]'} overflow-y-auto`}>
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
        )}
      </div>
    </div>
  );
};

export default GoogleCalendarView;