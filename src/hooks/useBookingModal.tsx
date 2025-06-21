
import { useState, useEffect } from 'react';
import { format, parseISO } from "date-fns";
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
      console.log('No date selected or no opening hours available');
      setAvailableTimes([]);
      return;
    }

    // Mapeamento correto dos dias da semana
    const dayNames = [
      'sunday',    // 0
      'monday',    // 1  
      'tuesday',   // 2
      'wednesday', // 3
      'thursday',  // 4
      'friday',    // 5
      'saturday'   // 6
    ];

    const dayIndex = selectedDate.getDay();
    const englishDay = dayNames[dayIndex];
    
    // Mapeamento para português
    const dayNamesPortuguese: { [key: string]: string } = {
      'sunday': 'domingo',
      'monday': 'segunda',
      'tuesday': 'terça',
      'wednesday': 'quarta',
      'thursday': 'quinta',
      'friday': 'sexta',
      'saturday': 'sábado'
    };

    const portugueseDay = dayNamesPortuguese[englishDay];
    
    console.log('Generating times for day:', englishDay, '-> Portuguese:', portugueseDay);
    console.log('Opening hours:', salon.opening_hours);

    const daySchedule = salon.opening_hours[portugueseDay];

    if (!daySchedule) {
      console.log('No schedule found for day:', portugueseDay);
      setAvailableTimes([]);
      return;
    }

    if (daySchedule.closed === true) {
      console.log('Day is closed:', portugueseDay);
      setAvailableTimes([]);
      return;
    }

    const { open, close } = daySchedule;
    console.log('Schedule for', portugueseDay, ':', { open, close });

    // Parse horários
    const [openHour, openMinute] = open.split(':').map(Number);
    const [closeHour, closeMinute] = close.split(':').map(Number);
    
    const times: string[] = [];
    let currentHour = openHour;
    let currentMinute = openMinute;

    // Gerar slots de 30 em 30 minutos
    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      times.push(timeString);
      
      // Avançar 30 minutos
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour += 1;
      }
    }

    console.log('Generated times:', times);
    setAvailableTimes(times);
  };

  const handleServiceSelect = (service: Service) => {
    console.log('Service selected:', service);
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateSelect = (date: Date | undefined) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time: string) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação rigorosa dos dados obrigatórios
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      const missingFields = [];
      if (!selectedService) missingFields.push('serviço');
      if (!selectedDate) missingFields.push('data');
      if (!selectedTime) missingFields.push('horário');
      if (!clientData.name) missingFields.push('nome');
      if (!clientData.phone) missingFields.push('telefone');
      
      toast({
        title: "Erro",
        description: `Campos obrigatórios faltando: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados do agendamento com validação de horário
      const appointmentData = {
        salon_id: salon.id,
        service_id: selectedService.id,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime, // Garantir que seja uma string válida de tempo
        notes: clientData.notes,
        clientName: clientData.name.trim(),
        clientPhone: clientData.phone.trim(),
        clientEmail: clientData.email?.trim() || null
      };

      console.log('useBookingModal - Creating appointment with data:', appointmentData);

      // Validar formato do horário
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(selectedTime)) {
        throw new Error('Formato de horário inválido');
      }

      const result = await createAppointment(appointmentData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: `Agendamento realizado para ${format(selectedDate, 'dd/MM/yyyy')} às ${selectedTime}. Você receberá uma confirmação em breve.`,
        });
        
        console.log('useBookingModal - Appointment created successfully');
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
        description: "Erro inesperado ao realizar agendamento. Verifique os dados e tente novamente.",
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
