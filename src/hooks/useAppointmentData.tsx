import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from './useSupabaseData';
import { useClientData } from './useClientData';

export const useAppointmentData = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const { getOrCreateClient } = useClientData();

  // Fetch all appointments
  const fetchAllAppointments = async (salonId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .eq('salon_id', salonId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .single();

      if (error) {
        console.error('Error updating appointment status:', error);
        return { success: false, message: error.message };
      }

      // Update local state
      setAppointments(prev => prev.map(appointment => appointment.id === appointmentId ? data : appointment));
      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error updating appointment status:', error);
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
        .update({ deleted_at: null })
        .eq('id', appointmentId)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .single();

      if (error) {
        console.error('Error restoring appointment:', error);
        return { success: false, message: error.message };
      }

      // Update local state
      setAppointments(prev => prev.map(appointment => appointment.id === appointmentId ? data : appointment));
      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error restoring appointment:', error);
      return { success: false, message: 'Erro ao restaurar o agendamento' };
    } finally {
      setLoading(false);
    }
  };

  const fetchClientAppointments = async (clientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .eq('client_id', clientId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) {
        console.error('Error fetching client appointments:', error);
        return;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching client appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create appointment - VERSÃO CORRIGIDA
  const createAppointment = async (appointmentData: any) => {
    try {
      console.log('Creating appointment with data:', appointmentData);
      
      // Validação rigorosa dos dados obrigatórios
      const requiredFields = ['salon_id', 'service_id', 'appointment_date', 'appointment_time', 'clientName', 'clientPhone'];
      const missingFields = requiredFields.filter(field => !appointmentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }

      // Validar formato da data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(appointmentData.appointment_date)) {
        throw new Error('Formato de data inválido. Use YYYY-MM-DD');
      }

      // Validar formato do horário
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointmentData.appointment_time)) {
        throw new Error('Formato de horário inválido. Use HH:MM');
      }

      // Buscar ou criar cliente
      console.log('Getting or creating client...');
      const clientResult = await getOrCreateClient({
        name: appointmentData.clientName,
        phone: appointmentData.clientPhone,
        email: appointmentData.clientEmail
      });
      
      if (!clientResult.success || !clientResult.client) {
        throw new Error(clientResult.message || 'Erro ao processar dados do cliente');
      }

      const client = clientResult.client;
      console.log('Client processed:', client);

      // Preparar dados do agendamento
      const insertData = {
        salon_id: appointmentData.salon_id,
        client_id: client.id,
        service_id: appointmentData.service_id,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time, // Inserir horário diretamente
        status: 'pending' as const,
        notes: appointmentData.notes || null,
        user_id: appointmentData.user_id || null
      };

      console.log('Inserting appointment data:', insertData);

      // Criar agendamento
      const { data, error } = await supabase
        .from('appointments')
        .insert(insertData)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .single();

      if (error) {
        console.error('Database error creating appointment:', error);
        throw error;
      }

      console.log('Appointment created successfully:', data);
      
      // Atualizar estado local
      setAppointments(prev => [data, ...prev]);
      
      return { 
        success: true, 
        appointment: data,
        message: `Agendamento criado para ${appointmentData.appointment_date} às ${appointmentData.appointment_time}`
      };
    } catch (error) {
      console.error('Error in createAppointment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento'
      };
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

      // Update local state
      setAppointments(prev => prev.filter(appointment => appointment.id !== appointmentId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting appointment:', error);
      return { success: false, message: 'Erro ao excluir o agendamento' };
    } finally {
      setLoading(false);
    }
  };

  return {
    appointments,
    loading,
    createAppointment,
    updateAppointmentStatus,
    fetchAllAppointments,
    restoreAppointment,
    fetchClientAppointments,
    setAppointments
  };
};
