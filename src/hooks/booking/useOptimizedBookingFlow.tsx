
import { useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Salon, Service } from '@/hooks/useSupabaseData';
import { useAppointmentCreation } from './useAppointmentCreation';
import { useBookingValidation } from './useBookingValidation';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useOptimizedBookingFlow = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { createOptimizedAppointment, isProcessing } = useAppointmentCreation();
  const { validateBookingData } = useBookingValidation();

  // Submissão otimizada do agendamento
  const submitOptimizedBooking = useCallback(async (
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: ClientData,
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
      // FIX: Usar componentes locais da data para evitar problemas de timezone
      const localYear = selectedDate!.getFullYear();
      const localMonth = selectedDate!.getMonth() + 1;
      const localDay = selectedDate!.getDate();
      const localDateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
      
      const appointmentResult = await createOptimizedAppointment({
        salon_id: salon.id,
        service_id: selectedService!.id,
        appointment_date: localDateString,
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
