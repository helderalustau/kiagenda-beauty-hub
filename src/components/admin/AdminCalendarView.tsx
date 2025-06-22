
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, Phone, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { useToast } from "@/components/ui/use-toast";

interface AdminCalendarViewProps {
  appointments: Appointment[];
  onRefresh: () => Promise<void>;
  salonId: string;
}

const AdminCalendarView = ({ appointments, onRefresh, salonId }: AdminCalendarViewProps) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const { updateAppointmentStatus } = useAppointmentData();
  const { toast } = useToast();

  // Filter appointments based on search and status
  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(apt => apt.status === statusFilter);
    }

    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (date: Date) => {
    return filteredAppointments.filter(apt => 
      isSameDay(new Date(apt.appointment_date), date)
    ).sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    const result = await updateAppointmentStatus(appointmentId, newStatus);
    
    if (result.success) {
      toast({
        title: "Status Atualizado",
        description: "Status do agendamento foi alterado com sucesso."
      });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Agenda Semanal
              </CardTitle>
              <p className="text-gray-600 mt-1">
                {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayAppointments = getAppointmentsForDay(day);
          const isCurrentDay = isToday(day);
          
          return (
            <Card key={day.toISOString()} className={`${isCurrentDay ? 'ring-2 ring-blue-500 bg-blue-50/50' : 'bg-white/80'} backdrop-blur-sm border-0 shadow-sm`}>
              <CardHeader className="pb-3">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <p className={`text-xl font-bold ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 min-h-[200px]">
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum agendamento</p>
                  </div>
                ) : (
                  dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="p-3 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">
                            {appointment.appointment_time}
                          </p>
                          <p className="text-xs text-blue-600 font-medium">
                            {appointment.service?.name}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-700 truncate">
                          {appointment.client?.name}
                        </p>
                      </div>
                      
                      {appointment.client?.phone && (
                        <div className="flex items-center gap-2 mb-3">
                          <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-600">
                            {appointment.client.phone}
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <Badge className={`text-xs ${getStatusColor(appointment.status)} w-full justify-center`}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                        
                        {appointment.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="flex-1 h-7 text-xs bg-green-600 hover:bg-green-700"
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                            >
                              Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                            >
                              Recusar
                            </Button>
                          </div>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <Button
                            size="sm"
                            className="w-full h-7 text-xs bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                          >
                            Concluir
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCalendarView;
