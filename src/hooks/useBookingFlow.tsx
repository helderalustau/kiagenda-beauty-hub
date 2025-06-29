
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

export const useBookingFlow = (salonId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estados do booking
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const submitBookingRequest = useCallback(async () => {
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name.trim() || !clientData.phone.trim()) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
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

    setIsSubmitting(true);

    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // Verificar se o horário ainda está disponível
      const { data: conflictCheck, error: conflictError } = await supabase
        .from('appointments')
        .select('id')
        .eq('salon_id', salonId)
        .eq('appointment_date', dateString)
        .eq('appointment_time', selectedTime)
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (conflictError) {
        throw new Error('Erro ao verificar disponibilidade do horário');
      }

      if (conflictCheck && conflictCheck.length > 0) {
        toast({
          title: "Horário indisponível",
          description: "Este horário foi ocupado por outro cliente. Escolha outro horário.",
          variant: "destructive"
        });
        return false;
      }

      // Criar o agendamento com status 'pending'
      const appointmentData = {
        salon_id: salonId,
        service_id: selectedService.id,
        client_auth_id: user.id,
        appointment_date: dateString,
        appointment_time: selectedTime,
        status: 'pending' as const,
        notes: clientData.notes?.trim() || null
      };

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
        console.error('Error creating appointment:', appointmentError);
        
        if (appointmentError.code === '23505') {
          toast({
            title: "Horário ocupado",
            description: "Este horário foi ocupado por outro cliente. Tente outro horário.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no agendamento",
            description: "Erro ao criar agendamento. Tente novamente.",
            variant: "destructive"
          });
        }
        return false;
      }

      toast({
        title: "✅ Solicitação Enviada!",
        description: `Sua solicitação para ${selectedService.name} foi enviada e está aguardando aprovação do estabelecimento.`,
        duration: 6000
      });

      return true;

    } catch (error) {
      console.error('Error in booking submission:', error);
      
      toast({
        title: "Erro no Agendamento",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
        duration: 7000
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [salonId, user?.id, selectedService, selectedDate, selectedTime, clientData, toast]);

  const resetBooking = useCallback(() => {
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
    setCurrentStep(1);
  }, []);

  return {
    // Estados
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    clientData,
    isSubmitting,
    
    // Setters
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setClientData,
    
    // Ações
    submitBookingRequest,
    resetBooking
  };
};
