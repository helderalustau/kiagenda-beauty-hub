
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/supabase-entities';
import { useAppointmentTypes } from './useAppointmentTypes';

export const useAppointmentFetch = () => {
  const [loading, setLoading] = useState(false);
  const { normalizeAppointment } = useAppointmentTypes();

  // Fetch all appointments - Fixed return type
  const fetchAllAppointments = async (salonId: string, includeDeleted: boolean = false) => {
    try {
      setLoading(true);
      let query = supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .eq('salon_id', salonId)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (!includeDeleted) {
        query = query.is('deleted_at', null);
      } else {
        query = query.not('deleted_at', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching appointments:', error);
        return { success: false, data: [], message: error.message };
      }

      // Normalize the appointments data
      const normalizedAppointments: Appointment[] = (data || []).map(normalizeAppointment);
      return { success: true, data: normalizedAppointments };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { success: false, data: [], message: 'Erro ao buscar agendamentos' };
    } finally {
      setLoading(false);
    }
  };

  const fetchClientAppointments = async (clientId: string) => {
    try {
      setLoading(true);
      console.log('Fetching appointments for client ID:', clientId);
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .eq('client_auth_id', clientId)
        .is('deleted_at', null)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) {
        console.error('Error fetching client appointments:', error);
        return { success: false, data: [] };
      }

      console.log('Raw client appointments data:', data);

      // DEBUG: Verificar datas específicas vindas do banco
      if (data && data.length > 0) {
        console.log('🔍 [FETCH DEBUG] Primeira entrada do banco:', {
          id: data[0]?.id,
          appointment_date: data[0]?.appointment_date,
          appointment_time: data[0]?.appointment_time,
          status: data[0]?.status,
          created_at: data[0]?.created_at
        });
      }

      // Normalize the appointments data
      const normalizedAppointments: Appointment[] = (data || []).map(normalizeAppointment);
      console.log('Normalized client appointments:', normalizedAppointments);
      
      return { success: true, data: normalizedAppointments };
    } catch (error) {
      console.error('Error fetching client appointments:', error);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchAllAppointments,
    fetchClientAppointments
  };
};
