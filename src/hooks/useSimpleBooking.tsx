
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
  const { isSubmitting, submitBooking } = useBookingSubmission(salon.id);

  // Memoizar salon.id para evitar re-renders desnecessários
  const salonId = useMemo(() => salon?.id, [salon?.id]);

  // Carregar serviços apenas quando necessário
  useEffect(() => {
    if (salonId) {
      console.log('🔄 Loading services for salon:', salon.name);
      loadServices();
    }
  }, [salonId, loadServices]);

  // Carregar horários com debounce implícito
  const handleDateChange = useCallback((date: Date | undefined) => {
    if (date && salon) {
      console.log('📅 Date changed, fetching slots for:', date.toDateString());
      fetchAvailableSlots(salon, date);
    }
  }, [salon, fetchAvailableSlots]);

  // Monitorar mudanças de data
  useEffect(() => {
    if (bookingState.selectedDate) {
      handleDateChange(bookingState.selectedDate);
    }
  }, [bookingState.selectedDate, handleDateChange]);

  // Submeter agendamento
  const handleSubmitBooking = useCallback(async () => {
    console.log('📋 Submitting booking');
    const success = await submitBooking(
      bookingState.selectedService,
      bookingState.selectedDate,
      bookingState.selectedTime,
      bookingState.clientData
    );
    
    if (success) {
      bookingState.resetBooking();
    }
    
    return success;
  }, [submitBooking, bookingState]);

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
