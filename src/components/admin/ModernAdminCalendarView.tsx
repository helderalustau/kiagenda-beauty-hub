
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter, Search } from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Appointment } from '@/types/supabase-entities';
import AppointmentCard from './calendar/AppointmentCard';

interface ModernAdminCalendarViewProps {
  appointments: Appointment[];
  onUpdateAppointment: (id: string, updates: { status: string; notes?: string }) => void;
  isUpdating: boolean;
}

const ModernAdminCalendarView = ({ 
  appointments, 
  onUpdateAppointment, 
  isUpdating 
}: ModernAdminCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  // Gerar dias do calendário
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
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

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Agenda de Atendimentos
            </CardTitle>
            
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Navegação do Calendário */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <h2 className="text-xl font-semibold">
              {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            
            <Button
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="flex items-center"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Grid do Calendário */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center font-semibold text-gray-600 bg-gray-50 rounded">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <div
                  key={index}
                  className={`min-h-32 p-2 border rounded-lg transition-colors ${
                    isCurrentMonth 
                      ? isDayToday 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                      : 'bg-gray-100 border-gray-100'
                  }`}
                >
                  <div className={`text-sm font-medium mb-2 ${
                    isCurrentMonth 
                      ? isDayToday 
                        ? 'text-blue-600' 
                        : 'text-gray-900'
                      : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div
                        key={appointment.id}
                        className={`text-sm p-2 rounded border ${getStatusColor(appointment.status)}`}
                      >
                        <div className="font-bold text-base truncate">
                          {appointment.appointment_time} - {appointment.client?.name || appointment.client?.username}
                        </div>
                        <div className="truncate opacity-75 font-medium text-sm">
                          {appointment.service?.name}
                        </div>
                      </div>
                    ))}
                    
                    {dayAppointments.length > 3 && (
                      <div className="text-sm text-gray-500 text-center font-medium">
                        +{dayAppointments.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Lista Detalhada de Agendamentos */}
          {filteredAppointments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Agendamentos Detalhados</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAppointments.map(appointment => (
                  <AppointmentCard 
                    key={appointment.id} 
                    appointment={appointment}
                    onUpdateAppointment={onUpdateAppointment}
                    isUpdating={isUpdating}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernAdminCalendarView;
