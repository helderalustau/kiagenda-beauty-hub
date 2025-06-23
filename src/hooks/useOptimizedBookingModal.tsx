
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
    setIsSubmitting(true);
    
    try {
      const result = await submitOptimizedBooking(
        selectedService,
        selectedDate,
        selectedTime,
        clientData,
        salon
      );
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = useCallback(() => {
    resetState();
  }, [resetState]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

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
    setCurrentStep
  };
};
