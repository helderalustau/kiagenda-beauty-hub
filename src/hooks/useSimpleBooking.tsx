
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Salon, Service } from '@/hooks/useSupabaseData';

interface BookingData {
  name: string;
  phone: string;
  notes: string;
}

export const useSimpleBooking = (salon: Salon) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Estados básicos
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingData, setBookingData] = useState<BookingData>({
    name: '',
    phone: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Carregar serviços
  const loadServices = useCallback(async () => {
    if (!salon?.id) return;
    
    setLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('salon_id', salon.id)
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar serviços",
        variant: "destructive"
      });
    } finally {
      setLoadingServices(false);
    }
  }, [salon?.id, toast]);

  // Gerar horários disponíveis - função simplificada e estável
  const generateTimeSlots = useCallback((date: Date) => {
    if (!salon?.opening_hours || !date) {
      console.log('Missing salon opening hours or date');
      return [];
    }

    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
    const daySchedule = salon.opening_hours[dayOfWeek];
    
    console.log('Generating slots for:', { dayOfWeek, daySchedule });
    
    if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
      console.log('Salon closed on this day');
      return [];
    }

    const slots: string[] = [];
    const [openHour, openMinute] = daySchedule.open.split(':').map(Number);
    const [closeHour, closeMinute] = daySchedule.close.split(':').map(Number);
    
    const openTimeInMinutes = openHour * 60 + openMinute;
    const closeTimeInMinutes = closeHour * 60 + closeMinute;
    
    for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
    
    console.log('Generated slots:', slots);
    return slots;
  }, [salon?.opening_hours]);

  // Carregar horários disponíveis - função simplificada
  const loadAvailableTimes = useCallback(async (date: Date) => {
    if (!salon?.id || !date) {
      console.log('Missing salon ID or date');
      setAvailableTimes([]);
      return;
    }

    console.log('Loading available times for:', date.toDateString());
    setLoadingTimes(true);
    
    try {
      const dateString = date.toISOString().split('T')[0];
      
      // Gerar todos os slots possíveis primeiro
      const allSlots = generateTimeSlots(date);
      console.log('All possible slots:', allSlots);
      
      if (allSlots.length === 0) {
        console.log('No slots generated for this day');
        setAvailableTimes([]);
        return;
      }
      
      // Buscar agendamentos já existentes
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salon.id)
        .eq('appointment_date', dateString)
        .in('status', ['pending', 'confirmed']);

      if (error) {
        console.error('Error fetching appointments:', error);
        throw error;
      }

      const bookedTimes = appointments?.map(apt => apt.appointment_time) || [];
      console.log('Booked times:', bookedTimes);
      
      // Filtrar horários disponíveis
      const currentTime = new Date();
      const isToday = date.toDateString() === currentTime.toDateString();
      
      const availableSlots = allSlots.filter(slot => {
        // Se já está ocupado, não mostrar
        if (bookedTimes.includes(slot)) {
          return false;
        }
        
        // Se é hoje, não mostrar horários que já passaram (com margem de 1 hora)
        if (isToday) {
          const [hour, minute] = slot.split(':').map(Number);
          const slotTime = new Date();
          slotTime.setHours(hour, minute, 0, 0);
          
          const currentTimePlusMargin = new Date(currentTime.getTime() + 60 * 60 * 1000);
          if (slotTime <= currentTimePlusMargin) {
            return false;
          }
        }
        
        return true;
      });

      console.log('Final available slots:', availableSlots);
      setAvailableTimes(availableSlots);
      
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setAvailableTimes([]);
      toast({
        title: "Erro",
        description: "Erro ao carregar horários disponíveis",
        variant: "destructive"
      });
    } finally {
      setLoadingTimes(false);
    }
  }, [salon?.id, generateTimeSlots, toast]);

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
  const submitBooking = useCallback(async () => {
    if (!selectedService || !selectedDate || !selectedTime || !bookingData.name || !bookingData.phone || !user?.id) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return false;
    }

    setIsSubmitting(true);
    try {
      const clientId = await findOrCreateClient(bookingData.name, bookingData.phone);

      const { error } = await supabase
        .from('appointments')
        .insert({
          salon_id: salon.id,
          service_id: selectedService.id,
          client_id: clientId,
          user_id: user.id,
          appointment_date: selectedDate.toISOString().split('T')[0],
          appointment_time: selectedTime,
          status: 'pending',
          notes: bookingData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Agendamento enviado com sucesso!",
        duration: 5000
      });

      resetBooking();
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
  }, [selectedService, selectedDate, selectedTime, bookingData, user?.id, salon.id, findOrCreateClient, toast]);

  // Reset do formulário
  const resetBooking = useCallback(() => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setBookingData({ name: '', phone: '', notes: '' });
    setAvailableTimes([]);
  }, []);

  // Formatação de moeda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  return {
    // Estados
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    bookingData,
    services,
    availableTimes,
    isSubmitting,
    loadingServices,
    loadingTimes,

    // Ações
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setBookingData,
    loadServices,
    loadAvailableTimes,
    submitBooking,
    resetBooking,
    formatCurrency
  };
};
