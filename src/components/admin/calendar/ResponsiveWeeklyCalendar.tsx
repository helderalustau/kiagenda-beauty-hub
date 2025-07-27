
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, CalendarDays } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isToday, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Salon } from '@/types/supabase-entities';
import CleanAppointmentCard from './CleanAppointmentCard';

interface ResponsiveWeeklyCalendarProps {
  appointments: Appointment[];
  salon: Salon;
  onAppointmentClick: (appointment: Appointment) => void;
}

type ViewMode = 'week' | 'month';

const ResponsiveWeeklyCalendar = ({ 
  appointments, 
  salon, 
  onAppointmentClick 
}: ResponsiveWeeklyCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ✅ PRIORIZAR DIA ATUAL: Inicializar com a semana atual
  useEffect(() => {
    const today = new Date();
    setCurrentDate(today);
  }, []);

  // Filtrar agendamentos visíveis
  const visibleAppointments = appointments.filter(appointment => 
    appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'completed'
  );

  // Gerar dias baseado no modo de visualização
  const getDaysToShow = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    } else {
      // Modo mensal
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    }
  };

  const daysToShow = getDaysToShow();

  // Filtrar agendamentos para o período atual
  const periodAppointments = visibleAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date);
    return daysToShow.some(day => isSameDay(appointmentDate, day));
  });

  // Organizar agendamentos por data
  const appointmentsByDate = periodAppointments.reduce((acc, appointment) => {
    const dateKey = appointment.appointment_date;
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Ordenar agendamentos por horário
  Object.keys(appointmentsByDate).forEach(date => {
    appointmentsByDate[date].sort((a, b) => 
      a.appointment_time.localeCompare(b.appointment_time)
    );
  });

  const handlePrevious = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    }
    setSelectedDate(null);
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    }
    setSelectedDate(null);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(selectedDate && isSameDay(selectedDate, date) ? null : date);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedDate(null);
  };

  // Formatar data para busca
  const formatDateForLookup = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPeriodLabel = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
      return `${format(weekStart, "dd/MM", { locale: ptBR })} - ${format(addDays(weekStart, 6), "dd/MM/yyyy", { locale: ptBR })}`;
    } else {
      return format(currentDate, "MMMM yyyy", { locale: ptBR });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Agenda {viewMode === 'week' ? 'Semanal' : 'Mensal'}</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {/* Botões de Visualização */}
            <div className="flex border rounded-lg">
              <Button
                onClick={() => handleViewModeChange('week')}
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
              >
                Semana
              </Button>
              <Button
                onClick={() => handleViewModeChange('month')}
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
              >
                Mês
              </Button>
            </div>
            
            {/* Navegação */}
            <Button onClick={handlePrevious} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button onClick={handleToday} variant="outline" size="sm">
              Hoje
            </Button>
            <Button onClick={handleNext} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {getPeriodLabel()}
          </span>
          <div className="text-sm text-gray-600">
            {periodAppointments.length > 0 ? (
              <span>{periodAppointments.length} agendamentos no período</span>
            ) : (
              <span>Nenhum agendamento no período</span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Mobile/Tablet: Calendar Grid View */}
        <div className="block md:hidden">
          {viewMode === 'week' ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-4">
                {daysToShow.map((day) => {
                  const dateKey = formatDateForLookup(day);
                  const dayAppointments = appointmentsByDate[dateKey] || [];
                  const isSelected = selectedDate && isSameDay(selectedDate, day);
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`
                        p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all duration-200
                        ${isToday(day) 
                          ? 'bg-blue-100 border-blue-300 font-semibold' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                        }
                        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      <div className="text-center text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      
                      {dayAppointments.length > 0 && (
                        <div className="flex justify-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                      
                      {dayAppointments.length > 1 && (
                        <div className="text-xs text-center text-gray-600 mt-1">
                          +{dayAppointments.length - 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            // Vista mensal mobile
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {/* Preencher dias do mês */}
              {Array.from({ length: Math.ceil(daysToShow.length / 7) * 7 }, (_, index) => {
                const dayIndex = index % 7;
                const weekIndex = Math.floor(index / 7);
                const day = daysToShow[index];
                
                if (!day) return <div key={index} className="p-2 min-h-[60px]"></div>;
                
                const dateKey = formatDateForLookup(day);
                const dayAppointments = appointmentsByDate[dateKey] || [];
                const isSelected = selectedDate && isSameDay(selectedDate, day);
                
                return (
                  <div
                    key={day.toString()}
                    className={`
                      p-2 min-h-[60px] border rounded-lg cursor-pointer transition-all duration-200
                      ${isToday(day) 
                        ? 'bg-blue-100 border-blue-300 font-semibold' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      }
                      ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                    `}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="text-center text-sm font-medium mb-1">
                      {format(day, 'd')}
                    </div>
                    
                    {dayAppointments.length > 0 && (
                      <div className="flex justify-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Day Appointments */}
          {selectedDate && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">
                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </h3>
              
              {(() => {
                const dateKey = formatDateForLookup(selectedDate);
                const dayAppointments = appointmentsByDate[dateKey] || [];
                
                return dayAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {dayAppointments.map((appointment) => (
                      <CleanAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onClick={() => onAppointmentClick(appointment)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum agendamento neste dia</p>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Desktop: List View */}
        <div className="hidden md:block">
          <div className="space-y-4">
            {viewMode === 'week' ? (
              daysToShow.map((day) => {
                const dateKey = formatDateForLookup(day);
                const dayAppointments = appointmentsByDate[dateKey] || [];
                
                return (
                  <div key={day.toString()} className="border rounded-lg p-4">
                    <div className={`flex items-center justify-between mb-3 ${isToday(day) ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                      <h3 className="text-lg font-medium">
                        {format(day, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    {dayAppointments.length > 0 ? (
                      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {dayAppointments.map((appointment) => (
                          <CleanAppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onClick={() => onAppointmentClick(appointment)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <p>Nenhum agendamento neste dia</p>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              // Vista mensal desktop - agrupamento por semana
              <>
                {Array.from({ length: Math.ceil(daysToShow.length / 7) }, (_, weekIndex) => {
                  const weekDays = daysToShow.slice(weekIndex * 7, (weekIndex + 1) * 7);
                  const weekAppointments = weekDays.reduce((acc, day) => {
                    const dateKey = formatDateForLookup(day);
                    return acc + (appointmentsByDate[dateKey] || []).length;
                  }, 0);
                  
                  return (
                    <div key={weekIndex} className="border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-medium">
                          Semana {weekIndex + 1} - {format(weekDays[0], "dd", { locale: ptBR })} a {format(weekDays[6], "dd/MM", { locale: ptBR })}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {weekAppointments} agendamento{weekAppointments !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => {
                          const dateKey = formatDateForLookup(day);
                          const dayAppointments = appointmentsByDate[dateKey] || [];
                          
                          return (
                            <div key={day.toString()} className="text-center">
                              <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                                {format(day, "EEE dd", { locale: ptBR })}
                              </div>
                              <div className="min-h-[80px] space-y-1">
                                {dayAppointments.slice(0, 2).map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className="text-xs bg-blue-100 p-1 rounded cursor-pointer hover:bg-blue-200"
                                    onClick={() => onAppointmentClick(appointment)}
                                  >
                                    {appointment.appointment_time}
                                  </div>
                                ))}
                                {dayAppointments.length > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{dayAppointments.length - 2} mais
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponsiveWeeklyCalendar;
