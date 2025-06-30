
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Salon } from '@/types/supabase-entities';
import { useOpeningHours } from '@/hooks/useOpeningHours';

interface ModernWeeklyScheduleProps {
  appointments: Appointment[];
  salon: Salon;
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const ModernWeeklySchedule = ({ 
  appointments, 
  salon, 
  onUpdateAppointment, 
  isUpdating 
}: ModernWeeklyScheduleProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const { generateTimeSlots } = useOpeningHours();

  // Gerar os dias da semana atual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Começa no domingo
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Gerar horários disponíveis baseado no horário de funcionamento
  const timeSlots = generateTimeSlots(salon.opening_hours || {});

  // Organizar agendamentos por data e horário
  const appointmentsByDateTime = appointments.reduce((acc, appointment) => {
    const dateKey = format(new Date(appointment.appointment_date), 'yyyy-MM-dd');
    const timeKey = appointment.appointment_time;
    const key = `${dateKey}-${timeKey}`;
    acc[key] = appointment;
    return acc;
  }, {} as Record<string, Appointment>);

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setViewMode('day');
  };

  const handleBackToWeek = () => {
    setViewMode('week');
    setSelectedDay(null);
  };

  const getAppointmentForSlot = (day: Date, timeSlot: string) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const key = `${dateKey}-${timeSlot}`;
    return appointmentsByDateTime[key];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  if (viewMode === 'day' && selectedDay) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Agenda - {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
            </CardTitle>
          </div>
          <Button onClick={handleBackToWeek} variant="outline">
            Voltar para Semana
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            {timeSlots.map((timeSlot) => {
              const appointment = getAppointmentForSlot(selectedDay, timeSlot);
              
              return (
                <div 
                  key={timeSlot} 
                  className={`flex items-center p-3 rounded-lg border ${
                    appointment 
                      ? getStatusColor(appointment.status)
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="w-20 text-sm font-medium">
                    {timeSlot}
                  </div>
                  
                  <div className="flex-1 ml-4">
                    {appointment ? (
                      <div className="space-y-1">
                        <div className="font-medium">{appointment.service_name}</div>
                        <div className="text-sm text-gray-600">{appointment.client_name}</div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                          {appointment.status === 'pending' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => onUpdateAppointment(appointment.id, { status: 'confirmed' })}
                                disabled={isUpdating}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onUpdateAppointment(appointment.id, { status: 'cancelled' })}
                                disabled={isUpdating}
                              >
                                Recusar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">Horário disponível</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Agenda Semanal</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button onClick={handlePreviousWeek} variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {format(weekStart, "dd/MM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <Button onClick={handleNextWeek} variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Cabeçalho dos dias */}
            <div className="grid grid-cols-8 gap-1 mb-4">
              <div className="p-2"></div> {/* Espaço para horários */}
              {weekDays.map((day) => (
                <div 
                  key={day.toString()} 
                  className={`p-3 text-center rounded-lg cursor-pointer transition-colors ${
                    isToday(day) 
                      ? 'bg-blue-100 text-blue-800 font-semibold' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="text-xs uppercase font-medium">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className="text-lg font-semibold mt-1">
                    {format(day, 'dd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid de horários */}
            <div className="space-y-1">
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 gap-1">
                  <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeSlot}
                  </div>
                  
                  {weekDays.map((day) => {
                    const appointment = getAppointmentForSlot(day, timeSlot);
                    
                    return (
                      <div 
                        key={`${day.toString()}-${timeSlot}`}
                        className={`p-2 min-h-[60px] rounded border text-xs ${
                          appointment 
                            ? getStatusColor(appointment.status)
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {appointment && (
                          <div className="space-y-1">
                            <div className="font-medium truncate">{appointment.service_name}</div>
                            <div className="text-gray-600 truncate">{appointment.client_name}</div>
                            <Badge size="sm" className={getStatusColor(appointment.status)}>
                              {getStatusText(appointment.status)}
                            </Badge>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernWeeklySchedule;
