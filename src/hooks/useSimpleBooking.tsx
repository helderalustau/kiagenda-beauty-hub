
import { useEffect, useCallback } from 'react';
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

  // Carregar serviços quando o hook é inicializado
  useEffect(() => {
    if (salon?.id) {
      console.log('🔄 Loading services for salon:', salon.name);
      loadServices();
    }
  }, [salon?.id, loadServices]);

  // Carregar horários quando data é selecionada
  useEffect(() => {
    if (bookingState.selectedDate && salon) {
      console.log('📅 Date selected, fetching available slots for:', bookingState.selectedDate.toDateString());
      fetchAvailableSlots(salon, bookingState.selectedDate);
    }
  }, [bookingState.selectedDate, salon, fetchAvailableSlots]);

  // Submeter agendamento
  const handleSubmitBooking = async () => {
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
  };

  return {
    // Estados do booking
    ...bookingState,
    
    // Serviços
    services,
    loadingServices,
    loadServices,
    
    // Horários - usando availableSlots em vez de availableTimes
    availableTimes: availableSlots,
    loadingTimes,
    
    // Submissão
    isSubmitting,
    submitBooking: handleSubmitBooking
  };
};
