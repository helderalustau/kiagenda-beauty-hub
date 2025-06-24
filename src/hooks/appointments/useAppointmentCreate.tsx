
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppointmentTypes } from './useAppointmentTypes';

export const useAppointmentCreate = () => {
  const [loading, setLoading] = useState(false);
  const { normalizeAppointment } = useAppointmentTypes();

  // Create appointment - VERSÃO CORRIGIDA
  const createAppointment = async (appointmentData: any) => {
    try {
      console.log('Creating appointment with data:', appointmentData);
      setLoading(true);
      
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

      // Buscar cliente existente na tabela client_auth
      console.log('Getting client from client_auth...');
      const { data: clientAuth, error: clientError } = await supabase
        .from('client_auth')
        .select('*')
        .eq('phone', appointmentData.clientPhone.replace(/\D/g, ''))
        .single();
      
      if (clientError || !clientAuth) {
        throw new Error('Cliente não encontrado. Faça login primeiro.');
      }

      console.log('Client processed:', clientAuth);

      // Preparar dados do agendamento
      const insertData = {
        salon_id: appointmentData.salon_id,
        client_auth_id: clientAuth.id, // Usar client_auth_id
        service_id: appointmentData.service_id,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
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
          client:client_auth(id, username, name, phone, email)
        `)
        .single();

      if (error) {
        console.error('Database error creating appointment:', error);
        throw error;
      }

      console.log('Appointment created successfully:', data);
      
      // Normalizar dados do agendamento
      const normalizedAppointment = normalizeAppointment(data);
      
      return { 
        success: true, 
        appointment: normalizedAppointment,
        message: `Agendamento criado para ${appointmentData.appointment_date} às ${appointmentData.appointment_time}`
      };
    } catch (error) {
      console.error('Error in createAppointment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createAppointment
  };
};
