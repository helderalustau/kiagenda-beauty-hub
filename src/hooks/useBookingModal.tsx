
import { useState, useEffect, useCallback } from 'react';
import { useServiceData } from './useServiceData';
import { Salon, Service } from './useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { useAvailableTimeSlots } from './useAvailableTimeSlots';
import { useAuth } from './useAuth';
import { useClientData } from './useClientData';
import { supabase } from '@/integrations/supabase/client';

export const useBookingModal = (salon: Salon) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { services, fetchSalonServices, loading: servicesLoading } = useServiceData();
  const { availableSlots, loading: slotsLoading, fetchAvailableSlots } = useAvailableTimeSlots();
  const { getClientByPhone } = useClientData();

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

  // Preencher dados do cliente logado automaticamente
  useEffect(() => {
    if (user && (!clientData.name || !clientData.phone)) {
      console.log('useBookingModal - Auto-filling client data from user:', user);
      setClientData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.id || prev.phone // O ID do usuário é usado como phone no sistema
      }));
    }
  }, [user, clientData.name, clientData.phone]);

  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && salon && !slotsLoading) {
      console.log('useBookingModal - Loading available slots for date:', selectedDate);
      fetchAvailableSlots(salon, selectedDate);
    }
  }, [selectedDate, salon?.id, fetchAvailableSlots, slotsLoading]);

  const loadSalonServices = useCallback(async () => {
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
      } else {
        // Check for active services
        const activeServices = salonServices.filter(service => service.active === true);
        console.log('useBookingModal - Active services:', activeServices);
        
        if (activeServices.length === 0) {
          toast({
            title: "Aviso",
            description: "Este estabelecimento não possui serviços ativos no momento.",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('useBookingModal - Error loading salon services:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços do estabelecimento",
        variant: "destructive"
      });
    }
  }, [salon?.id, fetchSalonServices, toast]);

  const createAppointmentWithLoggedClient = async (appointmentData: any) => {
    try {
      console.log('useBookingModal - Creating appointment with logged client data:', appointmentData);

      if (!user?.id) {
        throw new Error('Cliente não está logado');
      }

      // Buscar ou criar cliente usando o ID do usuário logado como phone
      const clientResult = await getClientByPhone(user.id);
      let clientId = null;

      if (clientResult.success && clientResult.client) {
        clientId = clientResult.client.id;
        console.log('useBookingModal - Using existing client:', clientResult.client);
      } else {
        // Criar novo cliente com dados do usuário logado
        console.log('useBookingModal - Creating new client for logged user');
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: appointmentData.clientName,
            phone: user.id, // Usar ID do usuário como phone
            email: appointmentData.clientEmail || null
          })
          .select()
          .single();

        if (clientError) {
          console.error('Error creating client:', clientError);
          throw new Error('Erro ao criar dados do cliente');
        }

        clientId = newClient.id;
        console.log('useBookingModal - New client created:', newClient);
      }

      // Criar agendamento
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          salon_id: appointmentData.salon_id,
          service_id: appointmentData.service_id,
          client_id: clientId,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: 'pending',
          notes: appointmentData.notes || null
        })
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:clients(id, name, phone, email)
        `)
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Erro ao criar agendamento');
      }

      console.log('useBookingModal - Appointment created successfully:', appointment);
      return { success: true, appointment };

    } catch (error) {
      console.error('Error in createAppointmentWithLoggedClient:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar agendamento' 
      };
    }
  };

  const handleServiceSelect = useCallback((service: Service) => {
    console.log('useBookingModal - Service selected:', service);
    setSelectedService(service);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('useBookingModal - Date selected:', date);
    setSelectedDate(date);
    setSelectedTime(''); // Reset selected time when date changes
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    console.log('useBookingModal - Time selected:', time);
    setSelectedTime(time);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !clientData.name || !clientData.phone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return { success: false };
    }

    if (!user?.id) {
      toast({
        title: "Erro", 
        description: "Você precisa estar logado para fazer um agendamento",
        variant: "destructive"
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      console.log('useBookingModal - Creating appointment with data:', {
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        client: clientData.name
      });

      const appointmentResult = await createAppointmentWithLoggedClient({
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

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({
      name: user?.name || '',
      phone: user?.id || '',
      email: '',
      notes: ''
    });
  }, [user]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  return {
    // State
    currentStep,
    services,
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
    formatCurrency,
    setClientData,
    setCurrentStep
  };
};
