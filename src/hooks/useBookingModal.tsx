
import { useState, useEffect } from 'react';
import { useServiceData } from './useServiceData';
import { Salon, Service } from './useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { useAvailableTimeSlots } from './useAvailableTimeSlots';
import { supabase } from '@/integrations/supabase/client';

export const useBookingModal = (salon: Salon) => {
  const { toast } = useToast();
  const { services, fetchSalonServices, loading: servicesLoading } = useServiceData();
  const { availableSlots, loading: slotsLoading, fetchAvailableSlots } = useAvailableTimeSlots();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && salon) {
      console.log('useBookingModal - Loading available slots for date:', selectedDate);
      fetchAvailableSlots(salon, selectedDate);
    }
  }, [selectedDate, salon]);

  const loadSalonServices = async () => {
    if (!salon?.id) {
      console.error('useBookingModal - No salon ID provided');
      return;
    }
    
    try {
      console.log('useBookingModal - Loading services for salon:', salon.id);
      const salonServices = await fetchSalonServices(salon.id);
      console.log('useBookingModal - Services loaded:', salonServices?.length || 0, 'services');
      
      if (!salonServices || salonServices.length === 0) {
        console.warn('useBookingModal - No services found for salon:', salon.id);
        toast({
          title: "Aviso",
          description: "Este estabelecimento ainda não possui serviços cadastrados.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('useBookingModal - Error loading salon services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços do estabelecimento",
        variant: "destructive"
      });
    }
  };

  const createAppointment = async (appointmentData: any) => {
    try {
      console.log('useBookingModal - Creating appointment with data:', appointmentData);

      // Create client first
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .upsert({
          name: appointmentData.clientName,
          phone: appointmentData.clientPhone,
          email: appointmentData.clientEmail || null
        }, {
          onConflict: 'phone',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (clientError) {
        console.error('Error creating/updating client:', clientError);
        throw new Error('Erro ao criar cliente');
      }

      console.log('Client created/updated:', clientData);

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salon_id,
          service_id: appointmentData.service_id,
          client_id: clientData.id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Erro ao criar agendamento');
      }

      console.log('Appointment created successfully:', appointment);
      return { success: true, appointment };

    } catch (error) {
      console.error('Error in createAppointment:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento' 
      };
    }
  };

  const handleServiceSelect = (service: Service) => {
    console.log('useBookingModal - Service selected:', service);
    setSelectedService(service);
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log('useBookingModal - Date selected:', date);
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when date changes
  };

  const handleTimeSelect = (time: string) => {
    console.log('useBookingModal - Time selected:', time);
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('useBookingModal - Creating appointment with data:', {
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        client: clientData.name
      });

      const appointmentResult = await createAppointment({
        salon_id: salon.id,
        service_id: selectedService.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientEmail: clientData.email || undefined,
        notes: clientData.notes || undefined
      });

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || 'Erro ao criar solicitação de agendamento');
      }

      toast({
        title: "Solicitação Enviada!",
        description: "Sua solicitação de agendamento foi enviada para o estabelecimento. Você receberá uma resposta em breve.",
      });

      return { success: true };

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar solicitação de agendamento",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter only active services
  const activeServices = services.filter(service => service.active);

  return {
    // State
    currentStep,
    services: activeServices,
    loadingServices: servicesLoading,
    selectedService,
    selectedDate,
    selectedTime,
    availableTimes: availableSlots,
    clientData,
    isSubmitting,
    
    // Actions
    loadSalonServices,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
    handleReset,
    handleBack,
    formatCurrency,
    setClientData,
    setCurrentStep
  };
};
