
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Phone } from "lucide-react";
import { Appointment, Salon } from '@/hooks/useSupabaseData';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyScheduleViewProps {
  appointments: Appointment[];
  salon: Salon;
  onUpdateAppointment: (appointmentId: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const WeeklyScheduleView = ({ appointments, salon, onUpdateAppointment, isUpdating }: WeeklyScheduleViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState(new Date());

  // Gerar horários baseado na configuração do salão
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 08:00
    const endHour = 18; // 18:00
    
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.appointment_date);
      return isSameDay(aptDate, day);
    });
  };

  const getAppointmentForTimeSlot = (day: Date, timeSlot: string) => {
    const dayAppointments = getAppointmentsForDay(day);
    return dayAppointments.find(apt => apt.appointment_time === timeSlot);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
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

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <div className={`p-2 rounded-lg border text-xs ${getStatusColor(appointment.status)}`}>
      <div className="font-semibold truncate">{appointment.service?.name}</div>
      <div className="flex items-center space-x-1 mt-1">
        <User className="h-3 w-3" />
        <span className="truncate">{appointment.client?.username || appointment.client?.name}</span>
      </div>
      <div className="flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>{appointment.appointment_time}</span>
      </div>
      <Badge className={`mt-1 text-xs ${getStatusColor(appointment.status)}`}>
        {getStatusText(appointment.status)}
      </Badge>
      {appointment.status === 'pending' && (
        <div className="flex space-x-1 mt-2">
          <Button 
            size="sm" 
            className="h-6 text-xs bg-green-600 hover:bg-green-700" 
            onClick={() => onUpdateAppointment(appointment.id, { status: 'confirmed' })}
            disabled={isUpdating}
          >
            Aceitar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 text-xs border-red-200 text-red-600 hover:bg-red-50" 
            onClick={() => onUpdateAppointment(appointment.id, { status: 'cancelled' })}
            disabled={isUpdating}
          >
            Recusar
          </Button>
        </div>
      )}
    </div>
  );

  if (viewMode === 'day') {
    const dayAppointments = getAppointmentsForDay(selectedDay);
    
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span>Agenda - {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setViewMode('week')}>
                Visão Semanal
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDay(subWeeks(selectedDay, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDay(addWeeks(selectedDay, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-2">
            {timeSlots.map(timeSlot => {
              const appointment = getAppointmentForTimeSlot(selectedDay, timeSlot);
              
              return (
                <div key={timeSlot} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {timeSlot}
                  </div>
                  <div className="flex-1">
                    {appointment ? (
                      <AppointmentCard appointment={appointment} />
                    ) : (
                      <div className="text-sm text-gray-400 italic">Horário disponível</div>
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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-blue-600" />
            <span>Agenda Semanal</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(weekStart, "dd/MM", { locale: ptBR })} - {format(addDays(weekStart, 6), "dd/MM/yyyy", { locale: ptBR })}
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header com dias da semana */}
            <div className="grid grid-cols-8 border-b bg-gray-50">
              <div className="p-3 text-sm font-medium text-gray-600 border-r">Horário</div>
              {weekDays.map(day => (
                <div 
                  key={day.toISOString()} 
                  className="p-3 text-center border-r cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    setSelectedDay(day);
                    setViewMode('day');
                  }}
                >
                  <div className="text-xs text-gray-500 uppercase">
                    {format(day, "EEE", { locale: ptBR })}
                  </div>
                  <div className="text-sm font-medium">
                    {format(day, "dd")}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid com horários */}
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="grid grid-cols-8 border-b hover:bg-gray-50/50">
                <div className="p-3 text-sm font-medium text-gray-600 border-r bg-gray-50">
                  {timeSlot}
                </div>
                {weekDays.map(day => {
                  const appointment = getAppointmentForTimeSlot(day, timeSlot);
                  
                  return (
                    <div key={`${day.toISOString()}-${timeSlot}`} className="p-2 border-r min-h-[60px]">
                      {appointment && <AppointmentCard appointment={appointment} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyScheduleView;
