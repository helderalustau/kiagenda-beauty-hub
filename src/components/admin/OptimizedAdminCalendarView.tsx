
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { Appointment } from '@/types/supabase-entities';
import CalendarStats from './calendar/CalendarStats';
import CalendarFilters from './calendar/CalendarFilters';
import CalendarNavigation from './calendar/CalendarNavigation';
import WeekView from './calendar/WeekView';
import DayView from './calendar/DayView';

interface OptimizedAdminCalendarViewProps {
  appointments: Appointment[];
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
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

      {/* Controles e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Agenda de Atendimentos
            </CardTitle>
            
            <CalendarFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
            />
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Navegação */}
          <CalendarNavigation
            currentWeek={currentWeek}
            viewMode={viewMode}
            onWeekChange={setCurrentWeek}
            onViewModeChange={setViewMode}
          />

          {/* Vista Semanal */}
          {viewMode === 'week' && (
            <WeekView
              weekDays={weekDays}
              appointmentsByDate={appointmentsByDate}
              onUpdateAppointment={onUpdateAppointment}
              isUpdating={isUpdating}
            />
          )}

          {/* Vista Diária */}
          {viewMode === 'day' && (
            <DayView
              selectedDate={selectedDate}
              appointmentsByDate={appointmentsByDate}
              onDateChange={setSelectedDate}
              onUpdateAppointment={onUpdateAppointment}
              isUpdating={isUpdating}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedAdminCalendarView;
