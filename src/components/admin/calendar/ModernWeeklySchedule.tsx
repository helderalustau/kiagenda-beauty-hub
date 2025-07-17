import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment, Salon } from '@/types/supabase-entities';
import { useOpeningHours } from '@/hooks/useOpeningHours';
import AppointmentDetailsModal from '../AppointmentDetailsModal';

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
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const { generateTimeSlots } = useOpeningHours();

  // Mostrar agendamentos pendentes, confirmados e concluídos
  const visibleAppointments = appointments.filter(appointment => 
    appointment.status === 'pending' || appointment.status === 'confirmed' || appointment.status === 'completed'
  );

  // Filtrar agendamentos para a semana atual
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Começa no domingo
  const weekEnd = addDays(weekStart, 6);
  
  const weekAppointments = visibleAppointments.filter(appointment => {
    const appointmentDate = new Date(appointment.appointment_date);
    return appointmentDate >= weekStart && appointmentDate <= weekEnd;
  });

  // DEBUG: Log para verificar agendamentos
  console.log('ModernWeeklySchedule - Total appointments received:', appointments.length);
  console.log('ModernWeeklySchedule - Visible appointments:', visibleAppointments.length);
  console.log('ModernWeeklySchedule - Appointment details:', visibleAppointments.map(apt => ({
    id: apt.id,
    status: apt.status,
    date: apt.appointment_date,
    time: apt.appointment_time,
    client: apt.client?.name || apt.client?.username,
    service: apt.service?.name
  })));

  // Gerar os dias da semana atual
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Gerar horários disponíveis baseado no horário de funcionamento
  const timeSlots = generateTimeSlots(salon.opening_hours || {});

  // Organizar agendamentos por data e horário - CORRIGIDO para timezone Brasil
  const appointmentsByDateTime = weekAppointments.reduce((acc, appointment) => {
    try {
      // FIX: Tratar a data como local sem conversão de timezone
      const dateKey = appointment.appointment_date; // Manter como string YYYY-MM-DD
      const timeKey = appointment.appointment_time;
      const key = `${dateKey}-${timeKey}`;
      
      console.log(`ModernWeeklySchedule - Mapping appointment:`, {
        id: appointment.id,
        dateKey,
        timeKey,
        key,
        client: appointment.client?.name || appointment.client?.username,
        service: appointment.service?.name,
        status: appointment.status
      });
      
      acc[key] = appointment;
    } catch (error) {
      console.error('Error processing appointment:', appointment, error);
    }
    return acc;
  }, {} as Record<string, Appointment>);

  console.log('ModernWeeklySchedule - appointmentsByDateTime map:', appointmentsByDateTime);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to safely get service name from appointment
  const getServiceName = (appointment: Appointment) => {
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

  // Helper function to safely get client name from appointment - FIXED
  const getClientName = (appointment: Appointment) => {
    if (appointment.client?.name) {
      return appointment.client.name;
    }
    if (appointment.client?.username) {
      return appointment.client.username;
    }
    if ((appointment as any).client_name) {
      return (appointment as any).client_name;
    }
    return 'Cliente';
  };

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

  // Get appointment for slot - CORRIGIDO para buscar por EXATA data/hora
  const getAppointmentForSlot = (day: Date, timeSlot: string) => {
    // Usar componentes locais da data para formar YYYY-MM-DD
    const year = day.getFullYear();
    const month = (day.getMonth() + 1).toString().padStart(2, '0');
    const dayNum = day.getDate().toString().padStart(2, '0');
    const dateKey = `${year}-${month}-${dayNum}`;
    
    // Buscar tanto com segundos quanto sem segundos
    const keyWithSeconds = `${dateKey}-${timeSlot}:00`;
    const keyWithoutSeconds = `${dateKey}-${timeSlot}`;
    
    console.log(`ModernWeeklySchedule - Looking for appointment with key: ${keyWithoutSeconds} or ${keyWithSeconds}`);
    
    // Primeiro tentar com segundos, depois sem
    let appointment = appointmentsByDateTime[keyWithSeconds] || appointmentsByDateTime[keyWithoutSeconds];
    
    // Se não encontrou, tentar procurar por horário aproximado (mesmo horário e data)
    if (!appointment) {
      const matchingAppointment = Object.entries(appointmentsByDateTime).find(([key, apt]) => {
        const [date, time] = key.split('-').slice(0, -1).join('-').split('-').concat(key.split('-').slice(-1));
        const appointmentDate = `${date.split('-')[0]}-${date.split('-')[1]}-${date.split('-')[2]}`;
        const appointmentTime = key.split('-')[3];
        
        return appointmentDate === dateKey && (
          appointmentTime === timeSlot ||
          appointmentTime === `${timeSlot}:00` ||
          appointmentTime.startsWith(timeSlot)
        );
      });
      
      if (matchingAppointment) {
        appointment = matchingAppointment[1];
      }
    }
    
    if (appointment) {
      console.log(`ModernWeeklySchedule - Found appointment:`, {
        id: appointment.id,
        client: appointment.client?.name || appointment.client?.username,
        service: appointment.service?.name,
        status: appointment.status,
        date: appointment.appointment_date,
        time: appointment.appointment_time
      });
    }
    
    return appointment;
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  // Componente de Agendamento estilo Google Agenda - MELHORADO
  const AppointmentBlock = ({ appointment }: { appointment: Appointment }) => (
    <div 
      className={`p-2 m-1 rounded-lg border cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105 ${getStatusColor(appointment.status)}`}
      onClick={() => handleAppointmentClick(appointment)}
    >
      <div className="text-xs font-semibold truncate mb-1">
        {getClientName(appointment)}
      </div>
      <div className="text-xs truncate opacity-90 mb-1">
        {getServiceName(appointment)}
      </div>
      <div className="text-xs opacity-70 font-medium">
        {appointment.appointment_time}
      </div>
      <div className="text-xs opacity-60 mt-1">
        {appointment.status === 'pending' ? '⏳ Pendente' : 
         appointment.status === 'confirmed' ? '✅ Confirmado' :
         appointment.status === 'completed' ? '🎉 Concluído' :
         appointment.status === 'cancelled' ? '❌ Cancelado' : appointment.status}
      </div>
    </div>
  );

  // Verificar se temos horários válidos
  if (timeSlots.length === 0) {
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
          <div className="space-y-1">
            {timeSlots.map((timeSlot) => {
              const appointment = getAppointmentForSlot(selectedDay, timeSlot);
              
              return (
                <div 
                  key={timeSlot} 
                  className="flex items-center border-b border-gray-100 hover:bg-gray-50 transition-colors min-h-[50px]"
                >
                  <div className="w-20 text-sm font-medium text-gray-600 px-3">
                    {timeSlot}
                  </div>
                  
                  <div className="flex-1">
                    {appointment ? (
                      <AppointmentBlock appointment={appointment} />
                    ) : (
                      <div className="text-sm text-gray-400 italic p-3">Horário disponível</div>
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

            {/* Grid de horários com agendamentos */}
            <div className="space-y-1">
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="grid grid-cols-8 gap-1 min-h-[60px]">
                  <div className="p-2 text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {timeSlot}
                  </div>
                  
                  {weekDays.map((day) => {
                    const appointment = getAppointmentForSlot(day, timeSlot);
                    
                    return (
                      <div 
                        key={`${day.toString()}-${timeSlot}`}
                        className={`border border-gray-200 rounded bg-white hover:bg-gray-50 transition-colors min-h-[80px] relative ${
                          appointment ? 'bg-blue-50' : ''
                        }`}
                      >
                        {appointment ? (
                          <AppointmentBlock appointment={appointment} />
                        ) : (
                          <div className="p-2 text-xs text-gray-400 h-full flex items-center justify-center">
                            Disponível
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

      {/* Modal de Detalhes */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </Card>
  );
};

export default ModernWeeklySchedule;
