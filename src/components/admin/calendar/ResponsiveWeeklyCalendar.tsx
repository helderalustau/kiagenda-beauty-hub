
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isToday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Salon } from '@/types/supabase-entities';
import CleanAppointmentCard from './CleanAppointmentCard';

interface ResponsiveWeeklyCalendarProps {
  appointments: Appointment[];
  salon: Salon;
  onAppointmentClick: (appointment: Appointment) => void;
}

const ResponsiveWeeklyCalendar = ({ 
  appointments, 
  salon, 
  onAppointmentClick 
}: ResponsiveWeeklyCalendarProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Filtrar agendamentos visíveis
  const visibleAppointments = appointments.filter(appointment => 
    appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'completed'
  );

  // Gerar os dias da semana
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filtrar agendamentos para a semana atual
  const weekAppointments = visibleAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date);
    return appointmentDate >= weekStart && appointmentDate <= addDays(weekStart, 6);
  });

  // Organizar agendamentos por data
  const appointmentsByDate = weekAppointments.reduce((acc, appointment) => {
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

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
    setSelectedDate(null);
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(selectedDate && isSameDay(selectedDate, date) ? null : date);
  };

  // Formatar data para busca
  const formatDateForLookup = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>Agenda Semanal</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button onClick={handlePreviousWeek} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 min-w-[120px] text-center">
              {format(weekStart, "dd/MM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <Button onClick={handleNextWeek} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mt-2">
          {weekAppointments.length > 0 ? (
            <span>{weekAppointments.length} agendamentos nesta semana</span>
          ) : (
            <span>Nenhum agendamento nesta semana</span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Mobile/Tablet: Calendar Grid View */}
        <div className="block md:hidden">
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map((day) => {
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
            {weekDays.map((day) => {
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
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponsiveWeeklyCalendar;
