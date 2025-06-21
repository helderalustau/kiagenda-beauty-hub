
import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { useSupabaseData, Service, Salon } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

export const useBookingModal = (salon: Salon) => {
  const { fetchSalonServices, createAppointment } = useSupabaseData();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSalonServices = async () => {
    try {
      setLoadingServices(true);
      console.log('useBookingModal - Loading services for salon:', salon.id);
      
      const fetchedServices = await fetchSalonServices(salon.id);
      console.log('useBookingModal - Services loaded:', fetchedServices.length);
      
      setServices(fetchedServices);
      
      if (fetchedServices.length === 0) {
        toast({
          title: "Aviso",
          description: "Este estabelecimento ainda não possui serviços cadastrados.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('useBookingModal - Error loading services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingServices(false);
    }
  };

  const generateAvailableTimes = () => {
    if (!selectedDate || !salon.opening_hours) {
      setAvailableTimes([]);
      return;
    }

    const dayOfWeek = selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const openingHours = salon.opening_hours[dayOfWeek.toLowerCase()];

    if (!openingHours || openingHours.closed) {
      setAvailableTimes([]);
      return;
    }

    const { open, close } = openingHours;
    const startTime = parseInt(open.split(':')[0]);
    const endTime = parseInt(close.split(':')[0]);
    const times: string[] = [];

    for (let hour = startTime; hour < endTime; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      times.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    setAvailableTimes(times);
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        salon_id: salon.id,
        service_id: selectedService.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        notes: clientData.notes,
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientEmail: clientData.email
      };

      console.log('useBookingModal - Creating appointment:', appointmentData);

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Agendamento realizado com sucesso! Você receberá uma confirmação em breve.",
        });
        
        return { success: true };
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao realizar agendamento. Tente novamente.",
          variant: "destructive"
        });
        return { success: false };
      }
    } catch (error) {
      console.error("useBookingModal - Error creating appointment:", error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao realizar agendamento. Tente novamente.",
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
    setClientData({ name: '', phone: '', email: '', notes: '' });
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 2) {
        setSelectedService(null);
      } else if (currentStep === 3) {
        setSelectedDate(undefined);
        setSelectedTime('');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Effects
  useEffect(() => {
    if (selectedDate && salon?.opening_hours) {
      generateAvailableTimes();
    }
  }, [selectedDate, salon?.opening_hours]);

  return {
    // State
    currentStep,
    services,
    loadingServices,
    selectedService,
    selectedDate,
    selectedTime,
    availableTimes,
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
