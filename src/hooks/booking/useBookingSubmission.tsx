
import { useState, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/hooks/useSupabaseData';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useBookingSubmission = (salonId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  // Submeter agendamento
  const submitBooking = useCallback(async (
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: ClientData
  ) => {
    console.log('🚀 Starting booking submission with data:', {
      service: selectedService?.name,
      date: selectedDate?.toDateString(),
      time: selectedTime,
      client: { name: clientData.name, phone: clientData.phone }
    });

    // Validação completa inicial
    if (!selectedService) {
      toast({
        title: "Serviço não selecionado",
        description: "Selecione um serviço para continuar",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedDate) {
      toast({
        title: "Data não selecionada",
        description: "Selecione uma data para o agendamento",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedTime) {
      toast({
        title: "Horário não selecionado",
        description: "Selecione um horário para o agendamento",
        variant: "destructive"
      });
      return false;
    }

    if (!clientData.name.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Preencha seu nome de usuário",
        variant: "destructive"
      });
      return false;
    }

    if (!clientData.phone.trim()) {
      toast({
        title: "Telefone obrigatório",
        description: "Preencha seu telefone",
        variant: "destructive"
      });
      return false;
    }

    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer um agendamento",
        variant: "destructive"
      });
      return false;
    }

    // Verificar se já há uma submissão em andamento
    if (submissionInProgress.current || isSubmitting) {
      console.log('⚠️ Submission already in progress, blocking duplicate');
      return false;
    }

    // Marcar submissão como em andamento
    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      // Criar agendamento diretamente (sem user_id)
      const appointmentData = {
        salon_id: salonId,
        service_id: selectedService.id,
        client_auth_id: user.id, // Usar diretamente o ID do usuário logado
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        status: 'pending',
        notes: clientData.notes?.trim() || null
      };

      console.log('📝 Creating appointment with data:', appointmentData);

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (appointmentError) {
        console.error('❌ Error creating appointment:', appointmentError);
        
        let errorMessage = "Erro ao criar agendamento";
        if (appointmentError.message.includes('duplicate')) {
          errorMessage = "Já existe um agendamento para este horário";
        } else if (appointmentError.message.includes('foreign key')) {
          errorMessage = "Dados inválidos. Tente novamente";
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ Appointment created successfully:', appointment.id);

      toast({
        title: "✅ Solicitação Enviada!",
        description: "Seu agendamento foi enviado e está aguardando aprovação do estabelecimento.",
        duration: 5000
      });

      return true;

    } catch (error) {
      console.error('❌ Error in booking submission:', error);
      
      let errorMessage = "Erro ao enviar solicitação de agendamento";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro no Agendamento",
        description: errorMessage,
        variant: "destructive",
        duration: 7000
      });
      
      return false;
    } finally {
      // Sempre liberar os locks
      submissionInProgress.current = false;
      setIsSubmitting(false);
      console.log('🏁 Booking submission process completed');
    }
  }, [salonId, user?.id, toast]);

  return {
    isSubmitting,
    submitBooking
  };
};
