import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePlanConfigurations } from './usePlanConfigurations';

export const usePlanLimitsChecker = () => {
  const [checking, setChecking] = useState(false);
  const { getPlanLimits } = usePlanConfigurations();

  const checkAndEnforcePlanLimits = useCallback(async (salonId: string) => {
    try {
      setChecking(true);

      // Buscar dados do salão
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select('id, name, plan, is_open')
        .eq('id', salonId)
        .single();

      if (salonError || !salon) {
        console.error('Erro ao buscar salão:', salonError);
        return { success: false, message: 'Salão não encontrado' };
      }

      // Obter limites do plano
      const planLimits = getPlanLimits(salon.plan);

      // Contar agendamentos não excluídos deste mês
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('salon_id', salonId)
        .gte('appointment_date', startDateStr)
        .lte('appointment_date', endDateStr)
        .is('deleted_at', null);

      if (appointmentsError) {
        console.error('Erro ao contar agendamentos:', appointmentsError);
        return { success: false, message: 'Erro ao verificar agendamentos' };
      }

      const currentAppointments = appointments?.length || 0;
      const maxAppointments = planLimits.max_appointments;

      console.log(`🔍 Plano ${salon.plan}: ${currentAppointments}/${maxAppointments} agendamentos este mês`);

      // Se atingiu o limite, fechar o salão
      if (currentAppointments >= maxAppointments && salon.is_open) {
        console.log('🚫 Limite de agendamentos atingido. Fechando salão automaticamente.');
        
        const { error: updateError } = await supabase
          .from('salons')
          .update({ is_open: false })
          .eq('id', salonId);

        if (updateError) {
          console.error('Erro ao fechar salão:', updateError);
          return { success: false, message: 'Erro ao fechar salão' };
        }

        return {
          success: true,
          limitReached: true,
          currentAppointments,
          maxAppointments,
          salonClosed: true,
          message: `Limite de ${maxAppointments} agendamentos atingido. Salão fechado automaticamente.`
        };
      }

      // Se ainda não atingiu o limite
      return {
        success: true,
        limitReached: false,
        currentAppointments,
        maxAppointments,
        salonClosed: false,
        message: `${currentAppointments}/${maxAppointments} agendamentos utilizados este mês`
      };

    } catch (error) {
      console.error('Erro na verificação de limites:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro inesperado'
      };
    } finally {
      setChecking(false);
    }
  }, [getPlanLimits]);

  const getSalonAppointmentStats = useCallback(async (salonId: string) => {
    try {
      // Buscar plano do salão
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select('plan')
        .eq('id', salonId)
        .single();

      if (salonError || !salon) {
        return { success: false, message: 'Salão não encontrado' };
      }

      const planLimits = getPlanLimits(salon.plan);

      // Contar agendamentos deste mês
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const startDateStr = startOfMonth.toISOString().split('T')[0];
      const endDateStr = endOfMonth.toISOString().split('T')[0];

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id')
        .eq('salon_id', salonId)
        .gte('appointment_date', startDateStr)
        .lte('appointment_date', endDateStr)
        .is('deleted_at', null);

      if (appointmentsError) {
        return { success: false, message: 'Erro ao contar agendamentos' };
      }

      const currentAppointments = appointments?.length || 0;
      const maxAppointments = planLimits.max_appointments;
      const percentage = Math.round((currentAppointments / maxAppointments) * 100);

      return {
        success: true,
        currentAppointments,
        maxAppointments,
        percentage,
        limitReached: currentAppointments >= maxAppointments,
        nearLimit: percentage >= 90
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro inesperado'
      };
    }
  }, [getPlanLimits]);

  return {
    checking,
    checkAndEnforcePlanLimits,
    getSalonAppointmentStats
  };
};