
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from './useSupabaseData';

export const useAppointmentData = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Create appointment - Corrigido para funcionar corretamente com client_id
  const createAppointment = async (appointmentData: any) => {
    try {
      setLoading(true);
      
      // Se já temos client_id, usar diretamente
      let clientId = appointmentData.client_id;
      
      // Se não temos client_id mas temos dados do cliente, criar/buscar cliente
      if (!clientId && (appointmentData.clientName || appointmentData.clientPhone)) {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .upsert({
            name: appointmentData.clientName,
            phone: appointmentData.clientPhone,
            email: appointmentData.clientEmail || null
          }, {
            onConflict: 'phone',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (clientError) {
          console.error('Error creating/updating client:', clientError);
          return { success: false, message: 'Erro ao registrar cliente' };
        }
        
        clientId = clientData.id;
      }

      if (!clientId) {
        return { success: false, message: 'ID do cliente é obrigatório' };
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salon_id,
          client_id: clientId,
          service_id: appointmentData.service_id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating appointment:', error);
        return { success: false, message: 'Erro ao criar agendamento' };
      }

      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return { success: false, message: 'Erro ao criar agendamento' };
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status, notes })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Error updating appointment:', error);
        return { success: false, message: 'Erro ao atualizar agendamento' };
      }

      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error updating appointment:', error);
      return { success: false, message: 'Erro ao atualizar agendamento' };
    }
  };

  const fetchAllAppointments = async (salonId: string, includeDeleted: boolean = false) => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          clients (*),
          services (*)
        `)
        .eq('salon_id', salonId);

      if (includeDeleted) {
        query = query.not('deleted_at', 'is', null);
      } else {
        query = query.is('deleted_at', null);
      }

      const { data, error } = await query.order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, message: 'Erro ao buscar agendamentos' };
      }

      // Transform the data to match our interface
      const transformedData = data?.map(appointment => ({
        ...appointment,
        status: appointment.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        client: appointment.clients,
        service: appointment.services,
        salon: undefined // Will be populated if needed
      })) || [];

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, message: 'Erro ao buscar agendamentos' };
    }
  };

  const restoreAppointment = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ deleted_at: null })
        .eq('id', appointmentId)
        .select()
        .single();

      if (error) {
        console.error('Error restoring appointment:', error);
        return { success: false, message: 'Erro ao restaurar agendamento' };
      }

      return { success: true, appointment: data };
    } catch (error) {
      console.error('Error restoring appointment:', error);
      return { success: false, message: 'Erro ao restaurar agendamento' };
    }
  };

  const fetchClientAppointments = async (clientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (*),
          salons (
            id,
            name,
            address,
            phone
          )
        `)
        .eq('client_id', clientId)
        .is('deleted_at', null)
        .order('appointment_date', { ascending: false });

      if (error) {
        console.error('Error fetching client appointments:', error);
        return { success: false, message: 'Erro ao buscar agendamentos' };
      }

      // Transform the data to match our interface
      const transformedData = data?.map(appointment => ({
        ...appointment,
        status: appointment.status as 'pending' | 'confirmed' | 'completed' | 'cancelled',
        service: appointment.services,
        salon: appointment.salons
      })) || [];

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      return { success: false, message: 'Erro ao buscar agendamentos' };
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
