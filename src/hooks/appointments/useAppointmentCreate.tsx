
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppointmentTypes } from './useAppointmentTypes';

export const useAppointmentCreate = () => {
  const [loading, setLoading] = useState(false);
  const { normalizeAppointment } = useAppointmentTypes();

  // Create appointment - VERSÃO CORRIGIDA FINAL
  const createAppointment = async (appointmentData: any) => {
    try {
      console.log('🚀 Creating appointment with data:', appointmentData);
      setLoading(true);
      
      // Validação rigorosa dos dados obrigatórios
      const requiredFields = ['salon_id', 'service_id', 'appointment_date', 'appointment_time'];
      const missingFields = requiredFields.filter(field => !appointmentData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }

      // FIX: Validar e normalizar formato da data LOCALMENTE
      let formattedDate = appointmentData.appointment_date;
      
      // Se a data é um objeto Date, formatar corretamente usando componentes locais
      if (appointmentData.appointment_date instanceof Date) {
        const date = appointmentData.appointment_date;
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() retorna 0-11
        const day = date.getDate();
        formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        console.log('📅 Converted Date object to local string:', formattedDate, 'from components:', { year, month, day });
      }
      
      // Validar formato da data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formattedDate)) {
        throw new Error('Formato de data inválido. Use YYYY-MM-DD');
      }

      // Validar formato do horário
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointmentData.appointment_time)) {
        throw new Error('Formato de horário inválido. Use HH:MM');
      }

      // Obter client_auth_id diretamente dos dados ou do appointmentData
      let clientAuthId = appointmentData.client_auth_id;
      
      // Se não temos client_auth_id, tentar buscar pelos dados do cliente
      if (!clientAuthId && (appointmentData.clientPhone || appointmentData.clientName)) {
        console.log('🔍 Buscando cliente pelos dados fornecidos...');
        
        let clientQuery = supabase.from('client_auth').select('*');
        
        if (appointmentData.clientPhone) {
          const cleanPhone = appointmentData.clientPhone.replace(/\D/g, '');
          clientQuery = clientQuery.eq('phone', cleanPhone);
        } else if (appointmentData.clientName) {
          clientQuery = clientQuery.eq('name', appointmentData.clientName);
        }
        
        const { data: clientAuth, error: clientError } = await clientQuery.single();
        
        if (clientError || !clientAuth) {
          throw new Error('Cliente não encontrado. Verifique os dados ou faça login primeiro.');
        }
        
        clientAuthId = clientAuth.id;
        console.log('✅ Cliente encontrado:', clientAuth);
      }

      if (!clientAuthId) {
        throw new Error('ID do cliente não fornecido. Faça login primeiro.');
      }

      // Verificar se o salão existe
      const { data: salon, error: salonError } = await supabase
        .from('salons')
        .select('id')
        .eq('id', appointmentData.salon_id)
        .single();

      if (salonError || !salon) {
        throw new Error('Estabelecimento não encontrado');
      }

      // Verificar se o serviço existe
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('id')
        .eq('id', appointmentData.service_id)
        .eq('salon_id', appointmentData.salon_id)
        .single();

      if (serviceError || !service) {
        throw new Error('Serviço não encontrado');
      }

      // Preparar dados do agendamento com todas as foreign keys válidas
      const insertData = {
        salon_id: appointmentData.salon_id,
        client_auth_id: clientAuthId,
        service_id: appointmentData.service_id,
        appointment_date: formattedDate, // Usar a data formatada localmente
        appointment_time: appointmentData.appointment_time,
        status: 'pending' as const,
        notes: appointmentData.notes || null,
        user_id: appointmentData.user_id || null
      };

      console.log('📝 Inserting appointment data:', insertData);

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
        console.error('❌ Database error creating appointment:', error);
        
        // Erros específicos mais amigáveis
        if (error.code === '23503') {
          if (error.message.includes('salon_id')) {
            throw new Error('Estabelecimento não encontrado');
          } else if (error.message.includes('service_id')) {
            throw new Error('Serviço não encontrado');
          } else if (error.message.includes('client_auth_id')) {
            throw new Error('Cliente não encontrado. Faça login primeiro.');
          }
        }
        
        throw error;
      }

      console.log('✅ Appointment created successfully:', data);
      
      // Normalizar dados do agendamento
      const normalizedAppointment = normalizeAppointment(data);
      
      return { 
        success: true, 
        appointment: normalizedAppointment,
        message: `Agendamento criado para ${formattedDate} às ${appointmentData.appointment_time}`
      };
    } catch (error) {
      console.error('❌ Error in createAppointment:', error);
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
