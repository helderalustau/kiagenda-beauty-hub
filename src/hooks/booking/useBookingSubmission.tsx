
import { useState, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/hooks/useSupabaseData';
import { useClientManagement } from './useClientManagement';

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
  const { findOrCreateClient } = useClientManagement();

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
      userId: user?.id,
      userRole: user?.role,
      isClient: !user?.role
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

    // Permitir agendamentos mesmo sem usuário logado (agendamento direto)
    console.log('🔑 User authentication status:', user?.id ? 'Logged in' : 'Direct booking');

    // Verificar se já há uma submissão em andamento
    if (submissionInProgress.current || isSubmitting) {
      console.log('⚠️ Submission already in progress');
      return false;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      // SALVAMENTO DE DATA - Garantir que seja EXATAMENTE a data selecionada
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // getMonth() é 0-indexed
      const day = selectedDate.getDate();
      
      // Criar string YYYY-MM-DD usando componentes locais
      const dateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
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

      // Buscar ou criar cliente se não estiver logado ou se for agendamento direto
      let clientAuthId: string;
      
      if (user?.id) {
        // Verificar se o user.id existe na tabela client_auth
        console.log('🔍 Checking if client exists in client_auth table for ID:', user.id);
        
        const { data: clientExists, error: clientCheckError } = await supabase
          .from('client_auth')
          .select('id')
          .eq('id', user.id)
          .single();

        if (clientExists) {
          console.log('✅ Client found in client_auth table:', clientExists.id);
          clientAuthId = clientExists.id;
        } else {
          console.log('⚠️ Client not found in client_auth, creating new client');
          clientAuthId = await findOrCreateClient(clientData.name, clientData.phone);
        }
      } else {
        // Criar ou encontrar cliente baseado no nome e telefone
        console.log('👤 No user logged in, finding or creating client by name/phone');
        clientAuthId = await findOrCreateClient(clientData.name, clientData.phone);
      }

      console.log('✅ Using client_auth_id:', clientAuthId);

      // Criar o agendamento
      const appointmentData = {
        salon_id: salonId,
        service_id: selectedService.id,
        client_auth_id: clientAuthId,
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
