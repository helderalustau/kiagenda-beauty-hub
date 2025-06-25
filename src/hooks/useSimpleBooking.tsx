
import { useEffect, useCallback, useMemo, useState } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import { supabase } from '@/integrations/supabase/client';

export const useSimpleBooking = (salon: Salon) => {
  const bookingState = useBookingState();
  const { services, loadingServices, loadServices } = useBookingServices(salon.id);
  const { isSubmitting, submitBooking: submitBookingBase } = useBookingSubmission(salon.id);
  
  // Estados consolidados para horários
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);

  // Memoizar salon.id para evitar re-renders desnecessários
  const salonId = useMemo(() => salon?.id, [salon?.id]);

  // Carregar serviços apenas quando necessário
  useEffect(() => {
    if (salonId && !services.length && !loadingServices) {
      console.log('🔄 Loading services for salon:', salon.name);
      loadServices();
    }
  }, [salonId, services.length, loadingServices, loadServices, salon.name]);

  // Função consolidada para gerar horários
  const generateTimeSlots = useCallback((openTime: string, closeTime: string): string[] => {
    try {
      const slots: string[] = [];
      const [openHour, openMinute] = openTime.split(':').map(Number);
      const [closeHour, closeMinute] = closeTime.split(':').map(Number);
      
      if (isNaN(openHour) || isNaN(openMinute) || isNaN(closeHour) || isNaN(closeMinute)) {
        console.error('❌ Invalid time format:', { openTime, closeTime });
        return [];
      }
      
      const openTimeInMinutes = openHour * 60 + openMinute;
      const closeTimeInMinutes = closeHour * 60 + closeMinute;
      
      if (openTimeInMinutes >= closeTimeInMinutes) {
        console.error('❌ Opening time is not before closing time');
        return [];
      }
      
      // Gerar slots a cada 30 minutos
      for (let time = openTimeInMinutes; time < closeTimeInMinutes; time += 30) {
        const hour = Math.floor(time / 60);
        const minute = time % 60;
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
      
      console.log(`✅ Generated ${slots.length} time slots from ${openTime} to ${closeTime}`);
      return slots;
    } catch (error) {
      console.error('❌ Error generating time slots:', error);
      return [];
    }
  }, []);

  // Buscar slots ocupados
  const fetchBookedSlots = useCallback(async (salonId: string, date: string): Promise<string[]> => {
    try {
      console.log(`🔍 Fetching booked slots for salon ${salonId} on ${date}`);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('appointment_time')
        .eq('salon_id', salonId)
        .eq('appointment_date', date)
        .in('status', ['pending', 'confirmed'])
        .order('appointment_time');

      if (error) {
        console.error('❌ Error fetching booked slots:', error);
        return [];
      }

      const bookedTimes = data?.map(appointment => appointment.appointment_time) || [];
      console.log(`📅 Found ${bookedTimes.length} booked slots:`, bookedTimes);
      return bookedTimes;
    } catch (error) {
      console.error('❌ Error in fetchBookedSlots:', error);
      return [];
    }
  }, []);

  // Filtrar slots disponíveis
  const filterAvailableSlots = useCallback((allSlots: string[], bookedSlots: string[], date: Date) => {
    const currentTime = new Date();
    const isToday = date.toDateString() === currentTime.toDateString();
    
    return allSlots.filter(slot => {
      // Se já está reservado, não disponibilizar
      if (bookedSlots.includes(slot)) {
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
  }, []);

  // Buscar slots disponíveis - função principal consolidada
  const fetchAvailableSlots = useCallback(async () => {
    console.log('🚀 Starting fetchAvailableSlots', {
      hasSalon: !!salon?.id,
      hasDate: !!bookingState.selectedDate,
      salonName: salon?.name,
      date: bookingState.selectedDate?.toDateString(),
      openingHours: salon?.opening_hours
    });

    // Validações iniciais
    if (!salon?.id) {
      console.log('❌ No salon ID provided');
      setAvailableSlots([]);
      setLoadingTimes(false);
      return;
    }

    if (!bookingState.selectedDate) {
      console.log('❌ No date selected');
      setAvailableSlots([]);
      setLoadingTimes(false);
      return;
    }

    if (!salon.opening_hours) {
      console.log('❌ No opening hours found in salon data');
      setAvailableSlots([]);
      setLoadingTimes(false);
      return;
    }

    setLoadingTimes(true);
    
    try {
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][bookingState.selectedDate.getDay()];
      const daySchedule = salon.opening_hours[dayOfWeek];
      
      console.log(`📅 Checking schedule for ${dayOfWeek}:`, daySchedule);
      
      if (!daySchedule || daySchedule.closed === true || !daySchedule.open || !daySchedule.close) {
        console.log(`🚫 Salon closed on ${dayOfWeek}`);
        setAvailableSlots([]);
        setLoadingTimes(false);
        return;
      }

      // Gerar todos os slots possíveis
      const allSlots = generateTimeSlots(daySchedule.open, daySchedule.close);
      
      if (allSlots.length === 0) {
        console.log('❌ No slots generated');
        setAvailableSlots([]);
        setLoadingTimes(false);
        return;
      }
      
      // Buscar slots ocupados
      const dateString = bookingState.selectedDate.toISOString().split('T')[0];
      const bookedSlots = await fetchBookedSlots(salon.id, dateString);
      
      // Filtrar slots disponíveis
      const availableSlots = filterAvailableSlots(allSlots, bookedSlots, bookingState.selectedDate);
      
      console.log(`✅ Final available slots (${availableSlots.length}):`, availableSlots);
      setAvailableSlots(availableSlots);
      
    } catch (error) {
      console.error('❌ Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingTimes(false);
    }
  }, [salon?.id, salon?.opening_hours, salon?.name, bookingState.selectedDate, generateTimeSlots, fetchBookedSlots, filterAvailableSlots]);

  // Effect para buscar slots quando data mudar
  useEffect(() => {
    if (bookingState.selectedDate && salon?.id && salon?.opening_hours) {
      console.log('🔄 Date changed, fetching available slots');
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setLoadingTimes(false);
    }
  }, [bookingState.selectedDate, salon?.id, salon?.opening_hours, fetchAvailableSlots]);

  // Handler melhorado para seleção de data
  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('📅 useSimpleBooking - Date selected:', date?.toDateString());
    
    if (date) {
      // Verificar se a data não é no passado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        console.log('❌ Cannot select past date');
        return;
      }
      
      console.log('✅ Valid date selected, updating state');
      bookingState.setSelectedDate(date);
      // Reset time when date changes
      bookingState.setSelectedTime('');
    } else {
      console.log('📅 Clearing date selection');
      bookingState.setSelectedDate(undefined);
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

  // Handler melhorado para seleção de horário
  const handleTimeSelect = useCallback((time: string) => {
    console.log('🕒 useSimpleBooking - Time selected:', time);
    bookingState.setSelectedTime(time);
  }, [bookingState]);

  // Submeter agendamento
  const handleSubmitBooking = useCallback(async () => {
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress, ignoring duplicate request');
      return false;
    }

    console.log('📋 Starting booking submission from hook');
    
    const success = await submitBookingBase(
      bookingState.selectedService,
      bookingState.selectedDate,
      bookingState.selectedTime,
      bookingState.clientData
    );
    
    if (success) {
      console.log('✅ Booking submitted successfully, resetting state');
      // Resetar estado após sucesso
      setTimeout(() => {
        bookingState.resetBooking();
      }, 1000);
    }
    
    return success;
  }, [submitBookingBase, bookingState, isSubmitting]);

  return {
    // Estados do booking
    ...bookingState,
    
    // Serviços
    services,
    loadingServices,
    
    // Horários consolidados
    availableTimes: availableSlots,
    loadingTimes,
    
    // Handlers melhorados
    handleDateSelect,
    handleTimeSelect,
    
    // Submissão
    isSubmitting,
    submitBooking: handleSubmitBooking
  };
};
