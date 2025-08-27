import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSimpleAppointmentManagerProps {
  salonId: string;
}

interface AppointmentWithRelations {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  client_auth_id: string;
  salon_id: string;
  service_id: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  user_id?: string;
  salon?: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    duration_minutes: number;
  };
  client?: {
    id: string;
    username: string;
    name: string;
    phone: string;
    email: string;
  };
}

export const useSimpleAppointmentManager = ({ salonId }: UseSimpleAppointmentManagerProps) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  // Fetch all appointments for the salon
  const fetchAppointments = useCallback(async () => {
    if (!salonId) {
      console.warn('❌ SimpleAppointmentManager: No salon ID provided');
      return;
    }

    setLoading(true);
    try {
      console.log('📋 SimpleAppointmentManager: Fetching appointments for salon:', salonId);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .eq('salon_id', salonId)
        .is('deleted_at', null)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) {
        console.error('❌ SimpleAppointmentManager: Error fetching appointments:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar agendamentos: " + error.message,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ SimpleAppointmentManager: Raw data received:', {
        dataLength: data?.length || 0,
        sampleData: data?.slice(0, 2)
      });

      if (!data) {
        console.warn('⚠️ SimpleAppointmentManager: No data returned from query');
        setAppointments([]);
        return;
      }

      // Convert and validate the data
      const validAppointments = data.filter(apt => {
        const isValid = apt.id && apt.status && apt.appointment_date;
        if (!isValid) {
          console.warn('⚠️ Invalid appointment data:', apt);
        }
        return isValid;
      });

      console.log('✅ SimpleAppointmentManager: Valid appointments processed:', {
        total: validAppointments.length,
        byStatus: {
          pending: validAppointments.filter(a => a.status === 'pending').length,
          confirmed: validAppointments.filter(a => a.status === 'confirmed').length,
          completed: validAppointments.filter(a => a.status === 'completed').length,
          cancelled: validAppointments.filter(a => a.status === 'cancelled').length
        }
      });

      setAppointments(validAppointments as AppointmentWithRelations[]);
    } catch (error) {
      console.error('❌ SimpleAppointmentManager: Unexpected error:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar agendamentos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [salonId, toast]);

  // Update appointment status
  const updateAppointmentStatus = useCallback(async (
    appointmentId: string, 
    newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  ) => {
    console.log('🔧 useSimpleAppointmentManager: INICIANDO updateAppointmentStatus:', {
      appointmentId,
      newStatus,
      currentUpdating: updating,
      timestamp: new Date().toISOString()
    });
    if (!appointmentId || !newStatus) {
      console.error('❌ useSimpleAppointmentManager: PARÂMETROS INVÁLIDOS:', { appointmentId, newStatus });
      return false;
    }

    if (updating === appointmentId) {
      console.warn('⚠️ useSimpleAppointmentManager: JÁ ATUALIZANDO ESTE AGENDAMENTO:', appointmentId);
      return false;
    }

    console.log('✅ useSimpleAppointmentManager: Parâmetros válidos, iniciando atualização...');
    setUpdating(appointmentId);
    
    try {
      console.log('🚀 useSimpleAppointmentManager: CHAMANDO SUPABASE UPDATE:', {
        appointmentId,
        newStatus,
        updatePayload: { 
          status: newStatus,
          updated_at: new Date().toISOString()
        }
      });

      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ SimpleAppointmentManager: Error updating status:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar status: " + error.message,
          variant: "destructive"
        });
        return false;
      }

      if (!data) {
        console.error('❌ SimpleAppointmentManager: No data returned from update');
        toast({
          title: "Erro",
          description: "Erro: Nenhum dado retornado da atualização",
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ SimpleAppointmentManager: Status updated successfully:', {
        appointmentId,
        oldStatus: appointments.find(a => a.id === appointmentId)?.status,
        newStatus,
        updatedData: data
      });
      
      // Update local state immediately for better UX
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: newStatus, updated_at: new Date().toISOString() }
          : apt
      ));

      // Show success message with financial integration info
      const statusMessages = {
        'confirmed': 'Agendamento confirmado com sucesso',
        'completed': 'Atendimento concluído! ✅\nReceita registrada automaticamente no módulo financeiro.',
        'cancelled': 'Agendamento cancelado',
        'pending': 'Agendamento revertido para pendente'
      };

      toast({
        title: "Sucesso",
        description: statusMessages[newStatus],
        duration: newStatus === 'completed' ? 6000 : 3000, // Mostra por mais tempo quando concluído
      });

      // Data será atualizada automaticamente via sistema realtime
      console.log('✅ SimpleAppointmentManager: Status atualizado - sistema realtime sincronizará automaticamente');

      return true;
    } catch (error) {
      console.error('❌ SimpleAppointmentManager: Unexpected error updating status:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar status",
        variant: "destructive"
      });
      return false;
    } finally {
      setUpdating(null);
    }
  }, [updating, toast, fetchAppointments]);

  // Load appointments on mount and when salon changes
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Helper functions
  const getAppointmentsByStatus = useCallback((status: string) => {
    return appointments.filter(apt => apt.status === status);
  }, [appointments]);

  const getAppointmentsByDate = useCallback((date: Date) => {
    const targetDate = date.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];
      return aptDate === targetDate;
    });
  }, [appointments]);

  const getTodayAppointments = useCallback(() => {
    return getAppointmentsByDate(new Date());
  }, [getAppointmentsByDate]);

  const getPendingAppointments = useCallback(() => {
    return getAppointmentsByStatus('pending');
  }, [getAppointmentsByStatus]);

  return {
    // Data
    appointments,
    
    // Loading states
    loading,
    updating,
    
    // Actions
    fetchAppointments,
    updateAppointmentStatus,
    
    // Helper functions
    getAppointmentsByStatus,
    getAppointmentsByDate,
    getTodayAppointments,
    getPendingAppointments,
    
    // Stats
    totalAppointments: appointments.length,
    pendingCount: getPendingAppointments().length,
    todayCount: getTodayAppointments().length
  };
};