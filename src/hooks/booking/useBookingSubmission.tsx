
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

  // Buscar ou criar cliente
  const findOrCreateClient = useCallback(async (name: string, phone: string) => {
    try {
      console.log('🔍 Searching for existing client with phone:', phone);
      
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (searchError) {
        console.error('❌ Error searching for client:', searchError);
        throw searchError;
      }

      if (existingClient) {
        console.log('✅ Found existing client:', existingClient.id);
        return existingClient.id;
      }

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
      
      console.log('✅ Created new client:', newClient.id);
      return newClient.id;
    } catch (error) {
      console.error('❌ Error in findOrCreateClient:', error);
      throw error;
    }
  }, []);

  // Submeter agendamento
  const submitBooking = useCallback(async (
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: ClientData
  ) => {
    // Validação inicial
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      console.log('❌ Missing required data for booking');
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    if (!user?.id) {
      console.log('❌ User not authenticated');
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para fazer um agendamento",
        variant: "destructive"
      });
      return false;
    }

    // Verificar se já há uma submissão em andamento
    if (submissionInProgress.current || isSubmitting) {
      console.log('⚠️ Submission already in progress, blocking duplicate request');
      return false;
    }

    // Marcar submissão como em andamento
    submissionInProgress.current = true;
    setIsSubmitting(true);
    console.log('🚀 Starting booking submission process');

    try {
      // 1. Buscar ou criar cliente
      const clientId = await findOrCreateClient(clientData.name, clientData.phone);

      // 2. Criar agendamento
      console.log('📝 Creating appointment');
      const appointmentData = {
        salon_id: salonId,
        service_id: selectedService.id,
        client_id: clientId,
        user_id: user.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        status: 'pending' as const,
        notes: clientData.notes || null
      };

      console.log('📋 Appointment data:', appointmentData);

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .single();

      if (appointmentError) {
        console.error('❌ Error creating appointment:', appointmentError);
        throw appointmentError;
      }

      console.log('✅ Appointment created successfully:', appointment);

      toast({
        title: "✅ Agendamento Enviado!",
        description: "Sua solicitação foi enviada com sucesso! O estabelecimento será notificado e você receberá uma confirmação em breve.",
        duration: 6000
      });

      return true;

    } catch (error) {
      console.error('❌ Error in booking submission:', error);
      
      let errorMessage = "Erro ao enviar agendamento";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      // Sempre liberar os locks
      submissionInProgress.current = false;
      setIsSubmitting(false);
      console.log('🏁 Booking submission process completed');
    }
  }, [salonId, findOrCreateClient, user?.id, toast, isSubmitting]);

  return {
    isSubmitting,
    submitBooking
  };
};
