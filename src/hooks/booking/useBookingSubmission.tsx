
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlanLimitsChecker } from '../usePlanLimitsChecker';

export const useBookingSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { canCreateAppointment } = usePlanLimitsChecker();

  const submitBooking = async (bookingData: any) => {
    setIsSubmitting(true);
    
    try {
      // Verificar se pode criar agendamento (limite do plano)
      const limitCheck = await canCreateAppointment(bookingData.salon_id);
      if (!limitCheck.canCreate) {
        return {
          success: false,
          message: limitCheck.message
        };
      }

      // Verificar se o salão está aberto
      const { data: salon } = await supabase
        .from('salons')
        .select('is_open')
        .eq('id', bookingData.salon_id)
        .single();

      if (!salon?.is_open) {
        return {
          success: false,
          message: 'Este estabelecimento está fechado para novos agendamentos no momento.'
        };
      }

      // Criar agendamento
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert([bookingData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar agendamento:', error);
        return {
          success: false,
          message: 'Erro ao criar agendamento. Tente novamente.'
        };
      }

      return {
        success: true,
        appointment
      };

    } catch (error) {
      console.error('Erro no processo de agendamento:', error);
      return {
        success: false,
        message: 'Erro inesperado. Tente novamente.'
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitBooking
  };
};
