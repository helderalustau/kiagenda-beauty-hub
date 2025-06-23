
import { useCallback } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from './booking/useBookingState';
import { useBookingServices } from './booking/useBookingServices';
import { useBookingClientData } from './booking/useBookingClientData';
import { useBookingAppointment } from './booking/useBookingAppointment';
import { useBookingTimeSlots } from './booking/useBookingTimeSlots';

export const useBookingModal = (salon: Salon) => {
  const bookingState = useBookingState();
  const { services, loadingServices, loadSalonServices } = useBookingServices(salon.id);
  const { availableTimes } = useBookingTimeSlots(salon);
  const { handleSubmit: submitAppointment } = useBookingAppointment();

  // Use client data hook for auto-filling
  useBookingClientData(bookingState.clientData, bookingState.setClientData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return await submitAppointment(
      bookingState.selectedService,
      bookingState.selectedDate,
      bookingState.selectedTime,
      bookingState.clientData,
      salon,
      () => {} // setIsSubmitting placeholder
    );
  };

  const handleReset = useCallback(() => {
    bookingState.resetBooking();
  }, [bookingState]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  return {
    // State - spread all booking state properties
    ...bookingState,
    
    // Services
    services,
    loadingServices,
    availableTimes,
    
    // Actions
    loadSalonServices,
    handleSubmit,
    handleReset,
    formatCurrency
  };
};
