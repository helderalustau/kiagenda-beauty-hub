
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
        .maybeSingle();

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

      // REMOVIDO: Fechamento automático da loja
      // A loja não será fechada automaticamente quando o limite for atingido
      // Apenas retorna informações sobre o limite para controle do admin

      return {
        success: true,
        limitReached: currentAppointments >= maxAppointments,
        currentAppointments,
        maxAppointments,
        salonClosed: false, // Nunca fecha automaticamente
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
        .maybeSingle();

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

  // Nova função para verificar se pode criar agendamento
  const canCreateAppointment = useCallback(async (salonId: string) => {
    try {
      const stats = await getSalonAppointmentStats(salonId);
      if (!stats.success) {
        return { canCreate: false, message: 'Erro ao verificar limites' };
      }

      if (stats.limitReached) {
        return { 
          canCreate: false, 
          message: `Limite de ${stats.maxAppointments} agendamentos atingido este mês. Faça upgrade do plano para continuar.` 
        };
      }

      return { canCreate: true, message: 'Pode criar agendamento' };
    } catch (error) {
      return { canCreate: false, message: 'Erro ao verificar limites' };
    }
  }, [getSalonAppointmentStats]);

  return {
    checking,
    checkAndEnforcePlanLimits,
    getSalonAppointmentStats,
    canCreateAppointment
  };
};
