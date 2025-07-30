
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
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const toggleAdditionalService = useCallback((service: Service) => {
    setSelectedAdditionalServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  }, []);

  const submitBookingRequest = useCallback(async () => {
    console.log('🚀 Starting booking submission:', {
      selectedService: selectedService?.name,
      additionalServices: selectedAdditionalServices.map(s => s.name),
      selectedDate: selectedDate?.toDateString(),
      selectedTime,
      clientData: clientData.name,
      userId: user?.id,
      salonId
    });

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
      // FIX: Usar componentes locais da data para evitar problemas de timezone
      const localYear = selectedDate.getFullYear();
      const localMonth = selectedDate.getMonth() + 1;
      const localDay = selectedDate.getDate();
      const dateString = `${localYear}-${localMonth.toString().padStart(2, '0')}-${localDay.toString().padStart(2, '0')}`;
      
      // Calcular duração total considerando serviços adicionais
      const totalDuration = selectedService.duration_minutes + 
        selectedAdditionalServices.reduce((acc, service) => acc + service.duration_minutes, 0);

      // Verificar se o horário ainda está disponível considerando a duração total
      const { data: conflictCheck, error: conflictError } = await supabase
        .from('appointments')
        .select('id')
        .eq('salon_id', salonId)
        .eq('appointment_date', dateString)
        .eq('appointment_time', selectedTime)
        .in('status', ['pending', 'confirmed'])
        .limit(1);

      if (conflictError) {
        console.error('Error checking availability:', conflictError);
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

      // Preparar as notas incluindo serviços adicionais
      let notesWithServices = clientData.notes?.trim() || '';
      if (selectedAdditionalServices.length > 0) {
        const additionalServicesText = selectedAdditionalServices
          .map(service => `${service.name} (${service.duration_minutes}min - R$ ${service.price})`)
          .join(', ');
        
        notesWithServices = notesWithServices 
          ? `${notesWithServices}\n\nServiços Adicionais: ${additionalServicesText}`
          : `Serviços Adicionais: ${additionalServicesText}`;
      }

      // Criar o agendamento com status 'pending'
      const appointmentData = {
        salon_id: salonId,
        service_id: selectedService.id,
        client_auth_id: user.id,
        appointment_date: dateString,
        appointment_time: selectedTime,
        status: 'pending' as const,
        notes: notesWithServices || null
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
            description: `Erro ao criar agendamento: ${appointmentError.message}`,
            variant: "destructive"
          });
        }
        return false;
      }

      console.log('✅ Appointment created successfully:', appointment?.id);

      const totalPrice = selectedService.price + 
        selectedAdditionalServices.reduce((acc, service) => acc + service.price, 0);

      toast({
        title: "✅ Solicitação Enviada!",
        description: `Sua solicitação para ${selectedService.name}${selectedAdditionalServices.length > 0 ? ` + ${selectedAdditionalServices.length} adicional(is)` : ''} foi enviada e está aguardando aprovação do estabelecimento. Total: R$ ${totalPrice.toFixed(2)}`,
        duration: 6000
      });

      return true;

    } catch (error) {
      console.error('Error in booking submission:', error);
      
      toast({
        title: "Erro no Agendamento",
        description: error instanceof Error ? error.message : "Erro inesperado. Tente novamente.",
        variant: "destructive",
        duration: 7000
      });
      
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [salonId, user?.id, selectedService, selectedAdditionalServices, selectedDate, selectedTime, clientData, toast]);

  const resetBooking = useCallback(() => {
    setSelectedService(null);
    setSelectedAdditionalServices([]);
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
    selectedAdditionalServices,
    selectedDate,
    selectedTime,
    clientData,
    isSubmitting,
    
    // Setters
    setCurrentStep,
    setSelectedService,
    setSelectedAdditionalServices,
    setSelectedDate,
    setSelectedTime,
    setClientData,
    
    // Ações
    toggleAdditionalService,
    submitBookingRequest,
    resetBooking
  };
};
