
import { useCallback } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from './booking/useBookingState';
import { useBookingServices } from './booking/useBookingServices';
import { useBookingClientData } from './booking/useBookingClientData';
import { useOptimizedBookingFlow } from './booking/useOptimizedBookingFlow';
import { useOptimizedTimeSlots } from './booking/useOptimizedTimeSlots';

export const useOptimizedBookingModal = (salon: Salon) => {
  const {
    currentStep,
    setCurrentStep,
    selectedService,
    selectedDate,
    selectedTime,
    clientData,
    setClientData,
    isSubmitting,
    setIsSubmitting,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleReset: resetState
  } = useBookingState();

  const {
    services,
    loadingServices,
    loadSalonServices
  } = useBookingServices(salon);

  const { availableSlots, loading: slotsLoading } = useOptimizedTimeSlots(salon, selectedDate);

  useBookingClientData(clientData, setClientData);

  const { submitOptimizedBooking, isProcessing } = useOptimizedBookingFlow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 Starting booking submission process');
    setIsSubmitting(true);
    
    try {
      const result = await submitOptimizedBooking(
        selectedService,
        selectedDate,
        selectedTime,
        clientData,
        salon
      );
      
      console.log('📊 Booking submission result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in booking submission:', error);
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    console.log('🔄 Resetting booking modal state');
    resetState();
  }, [resetState]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  // Validação melhorada para cada etapa
  const canProceedToStep2 = useCallback(() => {
    return selectedService !== null && !loadingServices;
  }, [selectedService, loadingServices]);

  const canProceedToStep3 = useCallback(() => {
    return selectedDate !== undefined && selectedTime !== '' && !slotsLoading;
  }, [selectedDate, selectedTime, slotsLoading]);

  const canSubmit = useCallback(() => {
    return selectedService !== null && 
           selectedDate !== undefined && 
           selectedTime !== '' && 
           clientData.name.trim() !== '' && 
           clientData.phone.trim() !== '' &&
           !isSubmitting && 
           !isProcessing;
  }, [selectedService, selectedDate, selectedTime, clientData, isSubmitting, isProcessing]);

  return {
    // State
    currentStep,
    services,
    loadingServices,
    selectedService,
    selectedDate,
    selectedTime,
    availableSlots,
    slotsLoading,
    clientData,
    isSubmitting: isSubmitting || isProcessing,
    
    // Actions
    loadSalonServices,
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleSubmit,
    handleReset,
    formatCurrency,
    setClientData,
    setCurrentStep,
    
    // Validation helpers
    canProceedToStep2,
    canProceedToStep3,
    canSubmit
  };
};
