
import { useEffect, useCallback, useMemo } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';

export const useSimpleBooking = (salon: Salon) => {
  const bookingState = useBookingState();
  const { services, loadingServices, loadServices } = useBookingServices(salon.id);
  const { availableSlots, loading: loadingTimes, fetchAvailableSlots } = useAvailableTimeSlots();
  const { isSubmitting, submitBooking: submitBookingBase } = useBookingSubmission(salon.id);

  // Memoizar salon.id para evitar re-renders desnecessários
  const salonId = useMemo(() => salon?.id, [salon?.id]);

  // Carregar serviços apenas quando necessário
  useEffect(() => {
    if (salonId && !services.length && !loadingServices) {
      console.log('🔄 Loading services for salon:', salon.name);
      loadServices();
    }
  }, [salonId, services.length, loadingServices, loadServices, salon.name]);

  // Carregar horários quando data mudar
  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date && salon) {
      console.log('📅 Date changed, fetching slots for:', date.toDateString());
      fetchAvailableSlots(salon, date);
    }
  }, [salon, fetchAvailableSlots]);

  // Monitorar mudanças de data (sem loop)
  useEffect(() => {
    if (bookingState.selectedDate) {
      handleDateChange(bookingState.selectedDate);
    }
  }, [bookingState.selectedDate, handleDateChange]);

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
    
    // Horários
    availableTimes: availableSlots,
    loadingTimes,
    
    // Submissão
    isSubmitting,
    submitBooking: handleSubmitBooking
  };
};
