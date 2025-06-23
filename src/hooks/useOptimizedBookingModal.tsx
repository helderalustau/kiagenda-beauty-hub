
import { useCallback } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from './booking/useBookingState';
import { useBookingServices } from './booking/useBookingServices';
import { useBookingClientData } from './booking/useBookingClientData';
import { useOptimizedBookingFlow } from './booking/useOptimizedBookingFlow';
import { useOptimizedTimeSlots } from './booking/useOptimizedTimeSlots';

export const useOptimizedBookingModal = (salon: Salon) => {
  const bookingState = useBookingState();
  const { services, loadingServices, loadSalonServices } = useBookingServices(salon.id);
  const { availableSlots, loading: slotsLoading } = useOptimizedTimeSlots(salon, bookingState.selectedDate);
  const { submitOptimizedBooking, isProcessing } = useOptimizedBookingFlow();

  useBookingClientData(bookingState.clientData, bookingState.setClientData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Starting booking submission process');
    
    try {
      const result = await submitOptimizedBooking(
        bookingState.selectedService,
        bookingState.selectedDate,
        bookingState.selectedTime,
        bookingState.clientData,
        salon
      );
      
      console.log('📊 Booking submission result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in booking submission:', error);
      return { success: false };
    }
  };

  const handleReset = useCallback(() => {
    console.log('🔄 Resetting booking modal state');
    bookingState.resetBooking();
  }, [bookingState]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Validação melhorada para cada etapa
  const canProceedToStep2 = useCallback(() => {
    return bookingState.selectedService !== null && !loadingServices;
  }, [bookingState.selectedService, loadingServices]);

  const canProceedToStep3 = useCallback(() => {
    return bookingState.selectedDate !== undefined && bookingState.selectedTime !== '' && !slotsLoading;
  }, [bookingState.selectedDate, bookingState.selectedTime, slotsLoading]);

  const canSubmit = useCallback(() => {
    return bookingState.selectedService !== null && 
           bookingState.selectedDate !== undefined && 
           bookingState.selectedTime !== '' && 
           bookingState.clientData.name.trim() !== '' && 
           bookingState.clientData.phone.trim() !== '' &&
           !isProcessing;
  }, [bookingState.selectedService, bookingState.selectedDate, bookingState.selectedTime, bookingState.clientData, isProcessing]);

  return {
    // State - spread all booking state properties
    ...bookingState,
    
    // Services and slots
    services,
    loadingServices,
    availableSlots,
    slotsLoading,
    
    // Submission state
    isSubmitting: isProcessing,
    
    // Actions
    loadSalonServices,
    handleSubmit,
    handleReset,
    formatCurrency,
    
    // Validation helpers
    canProceedToStep2,
    canProceedToStep3,
    canSubmit
  };
};
