
import { useState, useCallback, useMemo } from 'react';
import { useToast } from "@/components/ui/use-toast";
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

  // Otimizada: criação de agendamento em uma única transação
  const createOptimizedAppointment = useCallback(async (appointmentData: OptimizedBookingData) => {
    if (!user?.id) {
      throw new Error('Cliente não está logado');
    }

    setIsProcessing(true);
    
    try {
      console.log('🚀 Starting optimized appointment creation');
      
      // Transação otimizada: buscar/criar cliente e criar agendamento em uma única operação
      const { data: result, error } = await supabase.rpc('create_appointment_optimized', {
        p_salon_id: appointmentData.salon_id,
        p_service_id: appointmentData.service_id,
        p_appointment_date: appointmentData.appointment_date,
        p_appointment_time: appointmentData.appointment_time,
        p_client_name: appointmentData.clientName,
        p_client_phone: appointmentData.clientPhone,
        p_client_user_id: user.id,
        p_notes: appointmentData.notes || null
      });

      if (error) {
        console.error('❌ Optimized appointment creation failed:', error);
        throw error;
      }

      console.log('✅ Optimized appointment created successfully:', result);
      
      return { 
        success: true, 
        appointment: result,
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
  }, [user?.id]);

  // Otimizada: validação prévia dos dados
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
    
    // Validação de formato do telefone
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (clientData.phone && !phoneRegex.test(clientData.phone)) {
      errors.push('Formato de telefone inválido');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Otimizada: submissão do agendamento
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
        title: "✅ Solicitação Enviada!",
        description: "Sua solicitação foi enviada com sucesso. Você receberá uma resposta em breve.",
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
