
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AppointmentData {
  salon_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  clientName: string;
  clientPhone: string;
  notes?: string;
}

export const useAppointmentCreation = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Criar agendamento otimizado
  const createOptimizedAppointment = useCallback(async (appointmentData: AppointmentData) => {
    if (!user?.id) {
      throw new Error('Usuário não está logado');
    }

    setIsProcessing(true);
    
    try {
      console.log('🚀 Starting optimized appointment creation:', appointmentData);
      
      // Buscar cliente na tabela client_auth
      const { data: clientAuth, error: clientError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('id', user.id)
        .single();

      if (clientError || !clientAuth) {
        throw new Error('Cliente não encontrado');
      }

      // Criar agendamento diretamente no banco (sem user_id)
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salon_id,
          service_id: appointmentData.service_id,
          client_auth_id: clientAuth.id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select('*')
        .single();

      if (appointmentError) {
        console.error('❌ Appointment creation failed:', appointmentError);
        throw appointmentError;
      }

      console.log('✅ Optimized appointment created successfully:', appointment);
      
      return { 
        success: true, 
        appointment,
        message: 'Agendamento criado com sucesso!'
      };

    } catch (error) {
      console.error('❌ Error in optimized appointment creation:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id]);

  return {
    createOptimizedAppointment,
    isProcessing
  };
};
