
import { useState, useEffect } from 'react';
import { useSupabaseData, Salon, Service } from './useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { useAvailableTimeSlots } from './useAvailableTimeSlots';

export const useBookingModal = (salon: Salon) => {
  const { toast } = useToast();
  const { 
    services, 
    fetchSalonServices, 
    createAppointment, 
    getOrCreateClient,
    loading: dataLoading 
  } = useSupabaseData();
  
  const { availableSlots, loading: slotsLoading, fetchAvailableSlots } = useAvailableTimeSlots();

  const [currentStep, setCurrentStep] = useState(1);
  const [loadingServices, setLoadingServices] = useState(false);
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
    if (!salon?.id) return;
    
    try {
      setLoadingServices(true);
      console.log('useBookingModal - Loading services for salon:', salon.id);
      await fetchSalonServices(salon.id);
    } catch (error) {
      console.error('Error loading salon services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços do estabelecimento",
        variant: "destructive"
      });
    } finally {
      setLoadingServices(false);
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

      // Get or create client
      const clientResult = await getOrCreateClient({
        name: clientData.name,
        phone: clientData.phone,
        email: clientData.email || undefined
      });

      if (!clientResult.success || !clientResult.client) {
        throw new Error('Erro ao criar/encontrar cliente');
      }

      // Create appointment
      const appointmentResult = await createAppointment({
        salon_id: salon.id,
        client_id: clientResult.client.id,
        service_id: selectedService.id,
        appointment_date: selectedDate.toISOString().split('T')[0],
        appointment_time: selectedTime,
        notes: clientData.notes || undefined
      });

      if (!appointmentResult.success) {
        throw new Error(appointmentResult.message || 'Erro ao criar agendamento');
      }

      toast({
        title: "Agendamento Criado!",
        description: "Seu agendamento foi enviado para análise. Você receberá uma confirmação em breve.",
      });

      return { success: true };

    } catch (error) {
      console.error('Error creating appointment:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar agendamento",
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

  return {
    // State
    currentStep,
    services: services || [],
    loadingServices: loadingServices || dataLoading,
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
