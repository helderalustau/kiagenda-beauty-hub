
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Phone, MapPin, Search, Filter, CheckCircle2, XCircle, Calendar as CalendarIcon, TrendingUp } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  client_auth: {
    name: string;
    phone?: string;
    email?: string;
  };
  services: {
    name: string;
    price: number;
    duration_minutes: number;
  };
}

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

  // Calcular estatísticas
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.appointment_date === today);
    
    return {
      total: appointments.length,
      pending: appointments.filter(apt => apt.status === 'pending').length,
      confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      todayTotal: todayAppointments.length,
      todayRevenue: todayAppointments
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.services.price, 0)
    };
  }, [appointments]);

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      const matchesSearch = searchTerm === '' || 
        appointment.client_auth.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.services.name.toLowerCase().includes(searchTerm.toLowerCase());
      
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Aguardando';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                {appointment.client_auth.name}
              </h4>
              <Badge className={`text-xs ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-2" />
                <span>{appointment.appointment_time} - {appointment.services.name}</span>
              </div>
              
              {appointment.client_auth.phone && (
                <div className="flex items-center">
                  <Phone className="h-3 w-3 mr-2" />
                  <span>{appointment.client_auth.phone}</span>
                </div>
              )}
              
              <div className="flex items-center font-medium text-green-600">
                <span className="mr-2">💰</span>
                <span>{formatCurrency(appointment.services.price)}</span>
                <span className="text-gray-500 ml-2">({appointment.services.duration_minutes}min)</span>
              </div>
            </div>
          </div>
        </div>

        {appointment.status === 'pending' && (
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => onUpdateAppointment(appointment.id, { status: 'confirmed' })}
              disabled={isUpdating}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Aprovar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdateAppointment(appointment.id, { status: 'cancelled' })}
              disabled={isUpdating}
              className="flex-1"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Rejeitar
            </Button>
          </div>
        )}

        {appointment.status === 'confirmed' && (
          <Button
            size="sm"
            onClick={() => onUpdateAppointment(appointment.id, { status: 'completed' })}
            disabled={isUpdating}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Finalizar Atendimento
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Estatísticas em 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agendamentos Ativos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              Agendamentos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-yellow-700">Aguardando</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.confirmed}</div>
                <div className="text-sm text-blue-700">Confirmados</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Serviços / Estatísticas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.todayTotal}</div>
                <div className="text-sm text-green-700">Agendamentos Hoje</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-xl font-bold text-purple-600">{formatCurrency(stats.todayRevenue)}</div>
                <div className="text-sm text-purple-700">Receita Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Agenda de Atendimentos
            </CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar cliente ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="confirmed">Confirmados</SelectItem>
                  <SelectItem value="completed">Concluídos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Navegação da Semana */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                →
              </Button>
              <span className="font-medium">
                {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM", { locale: ptBR })} - {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "dd/MM/yyyy", { locale: ptBR })}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Dia
              </Button>
            </div>
          </div>

          {/* Vista Semanal */}
          {viewMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
              {weekDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayAppointments = appointmentsByDate[dateKey] || [];
                
                return (
                  <div key={dateKey} className="space-y-2">
                    <div className={`text-center p-2 rounded-lg ${isToday(day) ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'}`}>
                      <div className="font-semibold">
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className="text-sm">
                        {format(day, 'dd/MM')}
                      </div>
                      {dayAppointments.length > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {dayAppointments.length}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {dayAppointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Vista Diária */}
          {viewMode === 'day' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="w-auto"
                />
                <span className="font-medium">
                  {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')] || []).map(appointment => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
              
              {(!appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')] || appointmentsByDate[format(selectedDate, 'yyyy-MM-dd')].length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum agendamento para este dia</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizedAdminCalendarView;
