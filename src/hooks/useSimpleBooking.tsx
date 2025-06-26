
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
    bookingState.selectedService?.id // Passar o ID do serviço selecionado
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
    console.log('📅 useSimpleBooking - Date selected:', date?.toDateString());
    
    if (date) {
      // Verificar se a data não é no passado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        console.log('❌ Cannot select past date');
        return;
      }
      
      console.log('✅ Valid date selected, updating state');
      bookingState.setSelectedDate(date);
      // Reset time when date changes
      bookingState.setSelectedTime('');
    } else {
      console.log('📅 Clearing date selection');
      bookingState.setSelectedDate(undefined);
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

  // Handler melhorado para seleção de horário
  const handleTimeSelect = useCallback((time: string) => {
    console.log('🕒 useSimpleBooking - Time selected:', time);
    bookingState.setSelectedTime(time);
  }, [bookingState]);

  // Handler para seleção de serviço - limpar horário quando mudar serviço
  const handleServiceSelect = useCallback((service: any) => {
    console.log('🛍️ Service selected:', service?.name);
    bookingState.setSelectedService(service);
    // Limpar horário selecionado quando mudar de serviço
    if (bookingState.selectedTime) {
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

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
    
    // Horários que consideram duração do serviço
    availableTimes: availableSlots,
    loadingTimes,
    timeSlotsError,
    
    // Handlers melhorados
    handleDateSelect,
    handleTimeSelect,
    handleServiceSelect, // Novo handler para serviços
    
    // Submissão
    isSubmitting,
    submitBooking: handleSubmitBooking
  };
};
