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

  console.log('ModernWeeklySchedule - Rendering with:', {
    appointmentsCount: appointments.length,
    salonName: salon.name,
    openingHours: salon.opening_hours
  });

  // Filter appointments to show confirmed and pending ones for admin view
  const visibleAppointments = appointments.filter(appointment => 
    ['confirmed', 'pending'].includes(appointment.status)
  );

  console.log('ModernWeeklySchedule - Filtered appointments:', {
    total: appointments.length,
    visible: visibleAppointments.length,
    statuses: appointments.map(a => a.status)
  });

  // Gerar os dias da semana atual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Começa no domingo
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Gerar horários disponíveis baseado no horário de funcionamento
  const timeSlots = generateTimeSlots(salon.opening_hours || {});
  console.log('ModernWeeklySchedule - Generated time slots:', timeSlots);

  // Organizar agendamentos por data e horário
  const appointmentsByDateTime = visibleAppointments.reduce((acc, appointment) => {
    try {
      const dateKey = format(new Date(appointment.appointment_date), 'yyyy-MM-dd');
      const timeKey = appointment.appointment_time;
      const key = `${dateKey}-${timeKey}`;
      acc[key] = appointment;
    } catch (error) {
      console.error('Error processing appointment:', appointment, error);
    }
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

  // Helper function to safely get service name from appointment
  const getServiceName = (appointment: Appointment) => {
    // Try different possible paths for service name
    if ((appointment as any).service?.name) {
      return (appointment as any).service.name;
    }
    if ((appointment as any).services?.name) {
      return (appointment as any).services.name;
    }
    if ((appointment as any).service_name) {
      return (appointment as any).service_name;
    }
    return 'Serviço';
  };

  // Helper function to safely get client name from appointment
  const getClientName = (appointment: Appointment) => {
    // Try different possible paths for client name
    if ((appointment as any).client?.name) {
      return (appointment as any).client.name;
    }
    if ((appointment as any).client_auth?.name) {
      return (appointment as any).client_auth.name;
    }
    if ((appointment as any).client_name) {
      return (appointment as any).client_name;
    }
    return 'Cliente';
  };

  // Verificar se temos horários válidos
  if (timeSlots.length === 0) {
    console.warn('ModernWeeklySchedule - No time slots generated');
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Nenhum horário de funcionamento configurado.</p>
            <p className="text-gray-500 text-sm mt-2">Configure os horários de funcionamento do estabelecimento.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              const appointment = appointmentsByDateTime[`${format(selectedDay, 'yyyy-MM-dd')}-${timeSlot}`];
              
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
                        <div className="font-medium">{getServiceName(appointment)}</div>
                        <div className="text-sm text-gray-600">{getClientName(appointment)}</div>
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
            <span>Agenda Semanal - Agendamentos Confirmados</span>
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
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const appointment = appointmentsByDateTime[`${dateKey}-${timeSlot}`];
                    
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
                            <div className="font-medium truncate">{getServiceName(appointment)}</div>
                            <div className="text-gray-600 truncate">{getClientName(appointment)}</div>
                            <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
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

  // Helper functions
  function getStatusColor(status: string) {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  }

  function getServiceName(appointment: Appointment) {
    if ((appointment as any).service?.name) {
      return (appointment as any).service.name;
    }
    if ((appointment as any).services?.name) {
      return (appointment as any).services.name;
    }
    if ((appointment as any).service_name) {
      return (appointment as any).service_name;
    }
    return 'Serviço';
  }

  function getClientName(appointment: Appointment) {
    if ((appointment as any).client?.name) {
      return (appointment as any).client.name;
    }
    if ((appointment as any).client_auth?.name) {
      return (appointment as any).client_auth.name;
    }
    if ((appointment as any).client_name) {
      return (appointment as any).client_name;
    }
    return 'Cliente';
  }
};

export default ModernWeeklySchedule;
