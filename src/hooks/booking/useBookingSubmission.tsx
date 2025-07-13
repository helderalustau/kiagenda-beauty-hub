
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

  const submitBooking = useCallback(async (
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: ClientData
  ) => {
    console.log('🚀 Starting booking submission with params:', {
      service: selectedService?.name,
      date: selectedDate?.toDateString(),
      time: selectedTime,
      clientName: clientData.name,
      clientPhone: clientData.phone,
      userId: user?.id
    });

    // Validações básicas
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name.trim() || !clientData.phone.trim()) {
      console.error('❌ Missing required fields for booking submission');
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    if (!user?.id) {
      console.error('❌ User not authenticated');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer um agendamento",
        variant: "destructive"
      });
      return false;
    }

    // Verificar se já há uma submissão em andamento
    if (submissionInProgress.current || isSubmitting) {
      console.log('⚠️ Submission already in progress');
      return false;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      // FIX FINAL: Usar componentes locais da data para garantir que seja EXATAMENTE a data selecionada
      const localYear = selectedDate.getFullYear();
      const localMonth = selectedDate.getMonth() + 1; // getMonth() retorna 0-11, precisamos 1-12
      const localDay = selectedDate.getDate();
      
      // Formatar como YYYY-MM-DD usando EXATAMENTE os componentes locais da data selecionada
      const dateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
      
      console.log('🔍 DATA DETALHADA - Verificando disponibilidade:', { 
        salonId, 
        dateString,
        selectedTime,
        'Data Original': selectedDate.toDateString(),
        'Data ISO': selectedDate.toISOString(),
        'Componentes Locais': { 
          ano: localYear, 
          mes: localMonth, 
          dia: localDay 
        },
        'String Final para DB': dateString
      });
      
      const { data: conflictCheck, error: conflictError } = await supabase
        .from('appointments')
        .select('id')
        .eq('salon_id', salonId)
        .eq('appointment_date', dateString)
        .eq('appointment_time', selectedTime)
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (conflictError) {
        console.error('❌ Error checking availability:', conflictError);
        throw new Error('Erro ao verificar disponibilidade do horário');
      }

      if (conflictCheck && conflictCheck.length > 0) {
        console.error('❌ Time slot already taken');
        toast({
          title: "Horário indisponível",
          description: "Este horário foi ocupado por outro cliente. Escolha outro horário.",
          variant: "destructive"
        });
        return false;
      }

      // Criar o agendamento
      const appointmentData = {
        salon_id: salonId,
        service_id: selectedService.id,
        client_auth_id: user.id,
        appointment_date: dateString,
        appointment_time: selectedTime,
        status: 'pending' as const,
        notes: clientData.notes?.trim() || null
      };

      console.log('📝 Creating appointment with data:', appointmentData);

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .single();

      if (appointmentError) {
        console.error('❌ Error creating appointment:', appointmentError);
        
        if (appointmentError.code === '23505') {
          toast({
            title: "Horário ocupado",
            description: "Este horário foi ocupado por outro cliente. Tente outro horário.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no agendamento",
            description: `Erro ao criar agendamento: ${appointmentError.message}`,
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('✅ Appointment created successfully:', appointment?.id);

      toast({
        title: "✅ Solicitação Enviada!",
        description: `Seu agendamento para ${selectedService.name} foi enviado e está aguardando aprovação.`,
        duration: 6000
      });

      return true;

    } catch (error) {
      console.error('❌ Error in booking submission:', error);
      
      toast({
        title: "Erro no Agendamento",
        description: error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
        variant: "destructive",
        duration: 7000
      });
      
      return false;
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }, [salonId, user?.id, toast]);

  return {
    isSubmitting,
    submitBooking
  };
};
