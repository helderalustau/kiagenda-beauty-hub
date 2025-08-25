
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAppointmentFinancialSync } from '../useAppointmentFinancialSync';
import { useAppointmentTypes } from './useAppointmentTypes';

export const useAppointmentUpdate = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { processAppointmentCompletion } = useAppointmentFinancialSync();
  const { normalizeAppointment } = useAppointmentTypes();

  // Update appointment status - Fixed signature
  const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled', reason?: string) => {
    if (loading) {
      console.warn('⚠️ Update already in progress, skipping...');
      return { success: false, message: 'Atualização já em andamento' };
    }

    try {
      setLoading(true);
      console.log('🔄 useAppointmentUpdate: Updating appointment status:', { appointmentId, status, reason });
      
      if (!appointmentId || !status) {
        console.error('❌ Missing required parameters:', { appointmentId, status });
        return { success: false, message: 'Parâmetros obrigatórios não fornecidos' };
      }
      
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (reason) {
        updateData.notes = reason;
      }

      console.log('📝 useAppointmentUpdate: Sending update with data:', updateData);

      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .single();

      if (error) {
        console.error('❌ useAppointmentUpdate: Error updating appointment status:', error);
        return { success: false, message: error.message || 'Erro na atualização do banco de dados' };
      }

      if (!data) {
        console.error('❌ useAppointmentUpdate: No data returned from update');
        return { success: false, message: 'Nenhum dado retornado da atualização' };
      }

      console.log('✅ useAppointmentUpdate: Appointment status updated successfully:', data);

      // Se foi concluído, processar dados financeiros via edge function
      if (status === 'completed') {
        console.log('💰 Appointment concluído, processando dados financeiros...');
        const financialResult = await processAppointmentCompletion(appointmentId);
        
        if (!financialResult.success) {
          console.error('❌ Falha no processamento financeiro:', financialResult.error);
          toast({
            title: "Aviso",
            description: "Status atualizado, mas houve erro no processamento financeiro",
            variant: "destructive"
          });
        } else {
          console.log('✅ Dados financeiros processados com sucesso');
        }
      }

      // Mostrar toast de sucesso
      const statusMessages = {
        'pending': 'marcado como pendente',
        'confirmed': 'confirmado',
        'completed': 'concluído',
        'cancelled': 'cancelado'
      };

      toast({
        title: "Status atualizado",
        description: `Agendamento ${statusMessages[status]} com sucesso`,
      });

      // Return normalized data
      const normalizedAppointment = normalizeAppointment(data);
      console.log('✅ useAppointmentUpdate: Normalized appointment:', normalizedAppointment);
      return { success: true, appointment: normalizedAppointment };
    } catch (error) {
      console.error('❌ useAppointmentUpdate: Unexpected error:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Erro inesperado ao atualizar o status do agendamento' };
    } finally {
      setLoading(false);
    }
  };

  // Restore appointment
  const restoreAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .update({ 
          deleted_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .single();

      if (error) {
        console.error('Error restoring appointment:', error);
        return { success: false, message: error.message };
      }

      // Return normalized data
      const normalizedAppointment = normalizeAppointment(data);
      return { success: true, appointment: normalizedAppointment };
    } catch (error) {
      console.error('Error restoring appointment:', error);
      return { success: false, message: 'Erro ao restaurar o agendamento' };
    } finally {
      setLoading(false);
    }
  };

  // Delete appointment
  const deleteAppointment = async (appointmentId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);

      if (error) {
        console.error('Error deleting appointment:', error);
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, message: 'Erro ao excluir o agendamento' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateAppointmentStatus,
    restoreAppointment,
    deleteAppointment
  };
};
