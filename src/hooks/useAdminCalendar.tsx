import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppointmentData } from './useAppointmentData';
import { useRealtimeNotifications } from './useRealtimeNotifications';
import { Appointment } from '@/types/supabase-entities';
import { useToast } from '@/hooks/use-toast';

interface UseAdminCalendarProps {
  salonId: string;
}

export const useAdminCalendar = ({ salonId }: UseAdminCalendarProps) => {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const {
    appointments,
    fetchAllAppointments,
    updateAppointmentStatus,
    loading: appointmentLoading
  } = useAppointmentData();

  console.log('📅 useAdminCalendar - Dados:', {
    salonId,
    appointmentsCount: appointments.length,
    loading: loading || appointmentLoading
  });

  // Setup realtime notifications
  const handleNewAppointment = useCallback((appointment: Appointment) => {
    console.log('🔔 Nova solicitação recebida no calendário:', appointment);
    // Refresh calendar data
    if (salonId) {
      fetchAllAppointments(salonId);
    }
  }, [salonId, fetchAllAppointments]);

  const handleAppointmentUpdate = useCallback((appointment: Appointment) => {
    console.log('📝 Agendamento atualizado no calendário:', appointment);
    // Refresh calendar data
    if (salonId) {
      fetchAllAppointments(salonId);
    }
  }, [salonId, fetchAllAppointments]);

  useRealtimeNotifications({
    salonId,
    onNewAppointment: handleNewAppointment,
    onAppointmentUpdate: handleAppointmentUpdate
  });

  // Load appointments when component mounts or salon changes
  const loadAppointments = useCallback(async () => {
    if (!salonId) {
      console.warn('❌ SalonId não encontrado para carregar agendamentos');
      return;
    }

    setLoading(true);
    try {
      console.log('📅 Carregando agendamentos para salon:', salonId);
      const result = await fetchAllAppointments(salonId);
      console.log('✅ Agendamentos carregados:', {
        success: result.success,
        count: result.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [salonId, fetchAllAppointments, toast]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Handle status updates
  const handleStatusChange = useCallback(async (appointmentId: string, newStatus: string) => {
    console.log('🔄 Atualizando status do agendamento:', { appointmentId, newStatus });
    
    try {
      const result = await updateAppointmentStatus(appointmentId, newStatus as any);
      console.log('📋 Resultado da atualização de status:', result);
      
      if (result.success) {
        console.log('✅ Status atualizado com sucesso');
        
        // Show appropriate toast message
        const statusMessages = {
          'confirmed': 'Agendamento confirmado com sucesso',
          'completed': 'Atendimento marcado como concluído',
          'cancelled': 'Agendamento cancelado'
        };

        toast({
          title: "Sucesso",
          description: statusMessages[newStatus as keyof typeof statusMessages] || "Status atualizado",
        });

        // Refresh data
        await loadAppointments();
      } else {
        console.error('❌ Falha ao atualizar status:', result.message);
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro na atualização de status:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive"
      });
    }
  }, [updateAppointmentStatus, loadAppointments, toast]);

  // Calendar navigation functions
  const getWeekDays = useCallback((date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      week.push(dayDate);
    }
    return week;
  }, []);

  const navigateWeek = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
    console.log('📅 Navegando para nova semana:', newDate);
  }, [currentWeek]);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchesSearch = !searchTerm || 
        apt.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  // Get appointments for a specific day
  const getAppointmentsForDay = useCallback((day: Date) => {
    return filteredAppointments.filter(apt => {
      try {
        const aptDate = new Date(apt.appointment_date);
        return aptDate.toDateString() === day.toDateString();
      } catch (error) {
        console.error('Erro ao processar data do agendamento:', error);
        return false;
      }
    });
  }, [filteredAppointments]);

  const weekDays = useMemo(() => getWeekDays(currentWeek), [getWeekDays, currentWeek]);

  return {
    // Data
    appointments: filteredAppointments,
    weekDays,
    
    // UI State
    currentWeek,
    searchTerm,
    statusFilter,
    loading: loading || appointmentLoading,
    
    // Setters
    setSearchTerm,
    setStatusFilter,
    
    // Actions
    loadAppointments,
    handleStatusChange,
    navigateWeek,
    getAppointmentsForDay,
    
    // Stats
    totalAppointments: filteredAppointments.length
  };
};