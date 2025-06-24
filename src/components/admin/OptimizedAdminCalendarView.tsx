
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Search, Filter, RefreshCw, Loader2 } from "lucide-react";
import { useAppointmentData } from '@/hooks/useAppointmentData';
import { Appointment } from '@/types/supabase-entities';

interface OptimizedAdminCalendarViewProps {
  salonId: string;
  onRefresh: () => void;
}

type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

const OptimizedAdminCalendarView = ({ salonId, onRefresh }: OptimizedAdminCalendarViewProps) => {
  const { appointments, fetchAllAppointments, updateAppointmentStatus } = useAppointmentData();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [updatingAppointments, setUpdatingAppointments] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (salonId) {
      loadAppointments();
    }
  }, [salonId, currentWeek]);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAllAppointments(salonId);
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchAllAppointments, salonId]);

  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: AppointmentStatus) => {
    setUpdatingAppointments(prev => new Set([...prev, appointmentId]));
    
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      await loadAppointments();
      onRefresh();
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
    } finally {
      setUpdatingAppointments(prev => {
        const newSet = new Set(prev);
        newSet.delete(appointmentId);
        return newSet;
      });
    }
  }, [updateAppointmentStatus, loadAppointments, onRefresh]);

  const getWeekDays = useCallback((date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  }, [currentWeek]);

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter(apt => {
        const matchesSearch = !searchTerm || 
          apt.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.service?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        // Ordenar por data de criação (mais recentes primeiro)
        const dateA = new Date(a.created_at || '').getTime();
        const dateB = new Date(b.created_at || '').getTime();
        return dateB - dateA;
      });
  }, [appointments, searchTerm, statusFilter]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  const weekDays = useMemo(() => getWeekDays(currentWeek), [getWeekDays, currentWeek]);
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Agenda Semanal - Todos os Agendamentos
              {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
            </CardTitle>
            <Button onClick={() => { loadAppointments(); onRefresh(); }} size="sm" variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button onClick={() => navigateWeek('prev')} variant="outline" size="sm" disabled={loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-lg">
              {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {' '}
              {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h3>
            <Button onClick={() => navigateWeek('next')} variant="outline" size="sm" disabled={loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={loading}>
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

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-2 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {filteredAppointments.filter(apt => apt.status === 'pending').length}
              </div>
              <div className="text-xs text-yellow-600">Pendentes</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {filteredAppointments.filter(apt => apt.status === 'confirmed').length}
              </div>
              <div className="text-xs text-blue-600">Confirmados</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {filteredAppointments.filter(apt => apt.status === 'completed').length}
              </div>
              <div className="text-xs text-green-600">Concluídos</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <div className="text-lg font-bold text-red-600">
                {filteredAppointments.filter(apt => apt.status === 'cancelled').length}
              </div>
              <div className="text-xs text-red-600">Cancelados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayAppointments = filteredAppointments
            .filter(apt => {
              const aptDate = new Date(apt.appointment_date);
              return aptDate.toDateString() === day.toDateString();
            })
            .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));

          return (
            <Card key={day.toISOString()} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-600">{dayNames[index]}</p>
                  <p className="text-lg font-bold text-gray-900">{day.getDate()}</p>
                  {dayAppointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {dayAppointments.length} agendamento{dayAppointments.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {dayAppointments.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum agendamento</p>
                ) : (
                  dayAppointments.map((appointment) => {
                    const isUpdating = updatingAppointments.has(appointment.id);
                    
                    return (
                      <div key={appointment.id} className="bg-gray-50 rounded-lg p-3 space-y-2 transition-all hover:bg-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-medium">{appointment.appointment_time}</span>
                          </div>
                          <Badge className={`${getStatusColor(appointment.status)} border`} variant="secondary">
                            {appointment.status === 'pending' && 'Pendente'}
                            {appointment.status === 'confirmed' && 'Confirmado'}
                            {appointment.status === 'completed' && 'Concluído'}
                            {appointment.status === 'cancelled' && 'Cancelado'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-medium">{appointment.client?.name || appointment.client?.username}</span>
                          </div>
                          {appointment.client?.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">{appointment.client.phone}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-gray-200">
                          <p className="text-sm font-medium">{appointment.service?.name}</p>
                          <p className="text-xs text-gray-600">{appointment.service?.duration_minutes}min</p>
                          <p className="text-sm font-bold text-green-600">
                            {formatCurrency(appointment.service?.price || 0)}
                          </p>
                        </div>

                        {appointment.notes && (
                          <div className="bg-blue-50 p-2 rounded text-xs">
                            <strong>Obs:</strong> {appointment.notes}
                          </div>
                        )}

                        {isUpdating && (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                            <span className="text-xs text-gray-600 ml-2">Atualizando...</span>
                          </div>
                        )}

                        {!isUpdating && appointment.status === 'pending' && (
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              disabled={loading}
                            >
                              Confirmar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                              disabled={loading}
                            >
                              Cancelar
                            </Button>
                          </div>
                        )}

                        {!isUpdating && appointment.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleStatusChange(appointment.id, 'completed')}
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={loading}
                          >
                            Marcar como Concluído
                          </Button>
                        )}

                        <div className="text-xs text-gray-400 pt-1">
                          Criado: {new Date(appointment.created_at || '').toLocaleString('pt-BR')}
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando agendamentos...</p>
        </div>
      )}
    </div>
  );
};

export default OptimizedAdminCalendarView;
