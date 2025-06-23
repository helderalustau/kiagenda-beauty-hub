
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Salon, Service } from '@/hooks/useSupabaseData';

interface OptimizedBookingData {
  salon_id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  clientName: string;
  clientPhone: string;
  notes?: string;
}

export const useOptimizedBookingFlow = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Buscar ou criar cliente
  const findOrCreateClient = useCallback(async (name: string, phone: string) => {
    try {
      console.log('🔍 Finding or creating client:', { name, phone });
      
      // Primeiro, tentar encontrar cliente existente pelo telefone
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Error searching client:', searchError);
        throw searchError;
      }

      if (existingClient) {
        console.log('✅ Found existing client:', existingClient.id);
        return existingClient.id;
      }

      // Se não existe, criar novo cliente
      console.log('➕ Creating new client');
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          email: null
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating client:', createError);
        throw createError;
      }

      console.log('✅ New client created:', newClient.id);
      return newClient.id;
    } catch (error) {
      console.error('❌ Error in findOrCreateClient:', error);
      throw error;
    }
  }, []);

  // Criar agendamento otimizado
  const createOptimizedAppointment = useCallback(async (appointmentData: OptimizedBookingData) => {
    if (!user?.id) {
      throw new Error('Usuário não está logado');
    }

    setIsProcessing(true);
    
    try {
      console.log('🚀 Starting optimized appointment creation:', appointmentData);
      
      // Buscar ou criar cliente
      const clientId = await findOrCreateClient(appointmentData.clientName, appointmentData.clientPhone);

      // Criar agendamento diretamente no banco
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salon_id,
          service_id: appointmentData.service_id,
          client_id: clientId,
          user_id: user.id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select('*')
        .single();

      if (appointmentError) {
        console.error('❌ Appointment creation failed:', appointmentError);
        throw appointmentError;
      }

      console.log('✅ Optimized appointment created successfully:', appointment);
      
      return { 
        success: true, 
        appointment,
        message: 'Agendamento criado com sucesso!'
      };

    } catch (error) {
      console.error('❌ Error in optimized appointment creation:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, findOrCreateClient]);

  // Validação dos dados de agendamento
  const validateBookingData = useCallback((
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: { name: string; phone: string; notes: string }
  ) => {
    const errors: string[] = [];

    if (!selectedService) errors.push('Selecione um serviço');
    if (!selectedDate) errors.push('Selecione uma data');
    if (!selectedTime) errors.push('Selecione um horário');
    if (!clientData.name.trim()) errors.push('Nome é obrigatório');
    if (!clientData.phone.trim()) errors.push('Telefone é obrigatório');
    
    // Validação básica do telefone (números e parênteses)
    const phoneClean = clientData.phone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Submissão otimizada do agendamento
  const submitOptimizedBooking = useCallback(async (
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: { name: string; phone: string; notes: string },
    salon: Salon
  ) => {
    console.log('🎯 Starting optimized booking submission');
    
    // Validação prévia
    const validation = validateBookingData(selectedService, selectedDate, selectedTime, clientData);
    if (!validation.isValid) {
      toast({
        title: "Dados inválidos",
        description: validation.errors.join(', '),
        variant: "destructive"
      });
      return { success: false };
    }

    if (!user?.id) {
      toast({
        title: "Erro de autenticação", 
        description: "Você precisa estar logado para fazer um agendamento",
        variant: "destructive"
      });
      return { success: false };
    }

    try {
      const appointmentResult = await createOptimizedAppointment({
        salon_id: salon.id,
        service_id: selectedService!.id,
        appointment_date: selectedDate!.toISOString().split('T')[0],
        appointment_time: selectedTime,
        clientName: clientData.name,
        clientPhone: clientData.phone,
        notes: clientData.notes || undefined
      });

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || 'Erro ao criar agendamento');
      }

      toast({
        title: "✅ Agendamento Criado!",
        description: "Sua solicitação foi enviada com sucesso. Aguarde a confirmação do estabelecimento.",
        duration: 6000
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Optimized booking submission failed:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar solicitação",
        variant: "destructive"
      });
      return { success: false };
    }
  }, [createOptimizedAppointment, validateBookingData, toast, user?.id]);

  return {
    submitOptimizedBooking,
    isProcessing,
    validateBookingData
  };
};
