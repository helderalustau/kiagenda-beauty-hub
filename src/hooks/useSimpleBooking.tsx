
import React, { useCallback, useMemo } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';

export const useSimpleBooking = (salon: Salon) => {
  const bookingState = useBookingState();
  const { services, loadingServices, loadServices } = useBookingServices(salon.id);
  const { isSubmitting, submitBooking: submitBookingBase } = useBookingSubmission(salon.id);
  
  // Usar o hook com service_id para considerar duração do serviço
  const { availableSlots, loading: loadingTimes, error: timeSlotsError } = useAvailableTimeSlots(
    salon?.id, 
    bookingState.selectedDate,
    bookingState.selectedService?.id
  );

  // Memoizar salon.id para evitar re-renders desnecessários
  const salonId = useMemo(() => salon?.id, [salon?.id]);

  // Carregar serviços apenas quando necessário
  React.useEffect(() => {
    if (salonId && !services.length && !loadingServices) {
      console.log('🔄 Loading services for salon:', salon.name);
      loadServices();
    }
  }, [salonId, services.length, loadingServices, loadServices, salon.name]);

  // Handler melhorado para seleção de data
  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('📅 Date selected:', date?.toDateString());
    
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        console.log('❌ Cannot select past date');
        return;
      }
      
      bookingState.setSelectedDate(date);
      bookingState.setSelectedTime('');
    } else {
      bookingState.setSelectedDate(undefined);
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

  // Handler melhorado para seleção de horário
  const handleTimeSelect = useCallback((time: string) => {
    console.log('🕒 Time selected:', time);
    bookingState.setSelectedTime(time);
  }, [bookingState]);

  // Handler para seleção de serviço
  const handleServiceSelect = useCallback((service: any) => {
    console.log('🛍️ Service selected:', service?.name);
    bookingState.setSelectedService(service);
    if (bookingState.selectedTime) {
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

  // Submeter agendamento
  const handleSubmitBooking = useCallback(async () => {
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress');
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
    
    // Horários disponíveis
    availableTimes: availableSlots,
    loadingTimes,
    timeSlotsError,
    
    // Handlers
    handleDateSelect,
    handleTimeSelect,
    handleServiceSelect,
    
    // Submissão
    isSubmitting,
    submitBooking: handleSubmitBooking
  };
};
