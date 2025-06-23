
import { useEffect } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useBookingTimeSlots } from '@/hooks/booking/useBookingTimeSlots';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';

export const useSimpleBooking = (salon: Salon) => {
  // Usar os hooks especializados
  const bookingState = useBookingState();
  const { services, loadingServices, loadServices } = useBookingServices(salon.id);
  const { availableTimes, loadingTimes, loadAvailableTimes, setAvailableTimes } = useBookingTimeSlots(salon);
  const { isSubmitting, submitBooking } = useBookingSubmission(salon.id);

  // Carregar serviços quando o hook é inicializado
  useEffect(() => {
    if (salon?.id) {
      console.log('Loading services for salon:', salon.name);
      loadServices();
    }
  }, [salon?.id, loadServices]);

  // Carregar horários quando data é selecionada - com debounce para evitar loops
  useEffect(() => {
    if (bookingState.selectedDate && !loadingTimes) {
      console.log('Date selected, loading times:', bookingState.selectedDate.toDateString());
      const timeoutId = setTimeout(() => {
        loadAvailableTimes(bookingState.selectedDate!);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [bookingState.selectedDate, loadAvailableTimes, loadingTimes]);

  // Submeter agendamento
  const handleSubmitBooking = async () => {
    console.log('Submitting booking');
    const success = await submitBooking(
      bookingState.selectedService,
      bookingState.selectedDate,
      bookingState.selectedTime,
      bookingState.clientData
    );
    
    if (success) {
      bookingState.resetBooking();
      setAvailableTimes([]);
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
    
    // Horários
    availableTimes,
    loadingTimes,
    loadAvailableTimes,
    
    // Submissão
    isSubmitting,
    submitBooking: handleSubmitBooking
  };
};
