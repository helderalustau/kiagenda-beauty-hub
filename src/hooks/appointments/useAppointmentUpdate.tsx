
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppointmentTypes } from './useAppointmentTypes';

export const useAppointmentUpdate = () => {
  const [loading, setLoading] = useState(false);
  const { normalizeAppointment } = useAppointmentTypes();

  // Update appointment status - Fixed signature
  const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled', reason?: string) => {
    try {
      setLoading(true);
      console.log('🔄 Updating appointment status:', { appointmentId, status, reason });
      
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (reason) {
        updateData.notes = reason;
      }

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
        console.error('❌ Error updating appointment status:', error);
        return { success: false, message: error.message };
      }

      console.log('✅ Appointment status updated successfully:', data);

      // Return normalized data
      const normalizedAppointment = normalizeAppointment(data);
      return { success: true, appointment: normalizedAppointment };
    } catch (error) {
      console.error('❌ Error updating appointment status:', error);
      return { success: false, message: 'Erro ao atualizar o status do agendamento' };
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
