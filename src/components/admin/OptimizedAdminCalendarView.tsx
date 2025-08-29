
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Appointment } from '@/types/supabase-entities';
import CalendarStats from './calendar/CalendarStats';
import CalendarFilters from './calendar/CalendarFilters';
import CalendarNavigation from './calendar/CalendarNavigation';
import GoogleCalendarView from './calendar/GoogleCalendarView';
import WeekView from './calendar/WeekView';
import DayView from './calendar/DayView';

interface OptimizedAdminCalendarViewProps {
  appointments: Appointment[];
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => Promise<boolean>;
  isUpdating: boolean;
}

const OptimizedAdminCalendarView = ({ 
  appointments, 
  onUpdateAppointment, 
  isUpdating 
}: OptimizedAdminCalendarViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const clientName = appointment.client?.name || appointment.client?.username || '';
      const serviceName = appointment.service?.name || '';
      
      const matchesSearch = searchTerm === '' || 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Gerar dias da semana
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentWeek]);

  // Agrupar agendamentos por data
  const appointmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    filteredAppointments.forEach(appointment => {
      const date = appointment.appointment_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });
    
    // Ordenar por horário
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    });
    
    return grouped;
  }, [filteredAppointments]);

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <CalendarStats appointments={appointments} />

      {/* Google Calendar Style View */}
      <GoogleCalendarView
        appointments={filteredAppointments}
        onUpdateAppointment={onUpdateAppointment}
        isUpdating={isUpdating}
      />
    </div>
  );
};

export default OptimizedAdminCalendarView;
