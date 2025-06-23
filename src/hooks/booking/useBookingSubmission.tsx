
import { useState, useCallback } from 'react';
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

  // Buscar ou criar cliente
  const findOrCreateClient = useCallback(async (name: string, phone: string) => {
    try {
      const { data: existingClient, error: searchError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', phone)
        .maybeSingle();

      if (searchError) throw searchError;

      if (existingClient) {
        return existingClient.id;
      }

      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          email: null
        })
        .select('id')
        .single();

      if (createError) throw createError;
      return newClient.id;
    } catch (error) {
      console.error('Erro ao gerenciar cliente:', error);
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
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone || !user?.id) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      const clientId = await findOrCreateClient(clientData.name, clientData.phone);

      const { error } = await supabase
        .from('appointments')
        .insert({
          salon_id: salonId,
          service_id: selectedService.id,
          client_id: clientId,
          user_id: user.id,
          appointment_date: selectedDate.toISOString().split('T')[0],
          appointment_time: selectedTime,
          status: 'pending',
          notes: clientData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Agendamento enviado com sucesso!",
        duration: 5000
      });

      return true;
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar agendamento",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [salonId, findOrCreateClient, user?.id, toast]);

  return {
    isSubmitting,
    submitBooking
  };
};
