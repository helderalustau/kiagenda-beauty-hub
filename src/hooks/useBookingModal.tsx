
import { useCallback } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from './booking/useBookingState';
import { useBookingServices } from './booking/useBookingServices';
import { useBookingClientData } from './booking/useBookingClientData';
import { useBookingAppointment } from './booking/useBookingAppointment';
import { useBookingTimeSlots } from './booking/useBookingTimeSlots';

export const useBookingModal = (salon: Salon) => {
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

  const { availableTimes } = useBookingTimeSlots(salon, selectedDate);

  useBookingClientData(clientData, setClientData);

  const { handleSubmit: submitAppointment } = useBookingAppointment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    return await submitAppointment(
      selectedService,
      selectedDate,
      selectedTime,
      clientData,
      salon,
      setIsSubmitting
    );
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
    availableTimes,
    clientData,
    isSubmitting,
    
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
