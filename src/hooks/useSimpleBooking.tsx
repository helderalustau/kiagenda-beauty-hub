
import React, { useCallback, useMemo, useEffect } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { useAuth } from '@/hooks/useAuth';

export const useSimpleBooking = (salon: Salon) => {
  const { user, isClient } = useAuth();
  console.log('🏪 useSimpleBooking initialized for salon:', salon?.name, 'ID:', salon?.id);
  
  const bookingState = useBookingState();
  const { services, loadingServices, error: servicesError, refreshServices } = useBookingServices(salon?.id);
  const { isSubmitting, submitBooking: submitBookingBase } = useBookingSubmission(salon?.id);
  
  // Prevent unnecessary re-renders with stable salon ID
  const salonId = useMemo(() => salon?.id, [salon?.id]);
  
  // Use time slots hook with proper dependencies
  const { 
    availableSlots, 
    loading: loadingTimes, 
    error: timeSlotsError, 
    refetch: refetchSlots 
  } = useAvailableTimeSlots(
    salonId, 
    bookingState.selectedDate,
    bookingState.selectedService?.id
  );

  // Debug logs
  useEffect(() => {
    console.log('📊 Booking state update:', {
      salonId,
      salonName: salon?.name,
      selectedService: bookingState.selectedService?.name,
      selectedDate: bookingState.selectedDate?.toDateString(),
      selectedTime: bookingState.selectedTime,
      clientName: bookingState.clientData.name,
      clientPhone: bookingState.clientData.phone,
      servicesCount: services?.length || 0,
      availableSlotsCount: availableSlots?.length || 0,
      loadingServices,
      loadingTimes,
      servicesError,
      timeSlotsError,
      isClient,
      userId: user?.id
    });
  }, [
    salonId, 
    salon?.name,
    bookingState.selectedService, 
    bookingState.selectedDate, 
    bookingState.selectedTime, 
    bookingState.clientData,
    services,
    availableSlots, 
    loadingServices,
    loadingTimes, 
    servicesError,
    timeSlotsError,
    isClient,
    user?.id
  ]);

  // Force refresh services when salon changes
  useEffect(() => {
    if (salonId && (!services.length || servicesError)) {
      console.log('🔄 Force refreshing services for salon:', salon?.name);
      refreshServices();
    }
  }, [salonId, services.length, servicesError, refreshServices, salon?.name]);

  // Validation functions
  const validateBookingData = useCallback(() => {
    const errors: string[] = [];
    
    if (!bookingState.selectedService) errors.push('Selecione um serviço');
    if (!bookingState.selectedDate) errors.push('Selecione uma data');
    if (!bookingState.selectedTime) errors.push('Selecione um horário');
    if (!bookingState.clientData.name?.trim()) errors.push('Nome é obrigatório');
    if (!bookingState.clientData.phone?.trim()) errors.push('Telefone é obrigatório');
    
    // Validação básica do telefone
    const phoneClean = bookingState.clientData.phone?.replace(/\D/g, '') || '';
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [bookingState.selectedService, bookingState.selectedDate, bookingState.selectedTime, bookingState.clientData]);

  // Handle date selection with validation - FIX: Garantir data local
  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('📅 Date selected:', date?.toDateString());
    
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Criar uma nova data com os componentes locais para evitar problemas de timezone
      const selectedLocalDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      if (selectedLocalDate < today) {
        console.log('❌ Cannot select past date');
        return;
      }
      
      console.log('✅ Setting local date:', selectedLocalDate.toDateString(), 'Components:', {
        year: selectedLocalDate.getFullYear(),
        month: selectedLocalDate.getMonth() + 1,
        day: selectedLocalDate.getDate()
      });
      
      bookingState.setSelectedDate(selectedLocalDate);
    } else {
      bookingState.setSelectedDate(date);
    }
    
    bookingState.setSelectedTime(''); // Reset time when date changes
  }, [bookingState]);

  // Handle time selection
  const handleTimeSelect = useCallback((time: string) => {
    console.log('🕒 Time selected:', time);
    bookingState.setSelectedTime(time);
  }, [bookingState]);

  // Handle service selection
  const handleServiceSelect = useCallback((service: any) => {
    console.log('🛍️ Service selected:', service?.name, 'ID:', service?.id);
    bookingState.setSelectedService(service);
    
    // Reset time when service changes
    if (bookingState.selectedTime) {
      console.log('🔄 Resetting selected time due to service change');
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

  // Submit booking with enhanced validation
  const handleSubmitBooking = useCallback(async () => {
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress');
      return false;
    }

    console.log('📋 Starting booking submission validation');

    // Client authentication check
    if (!user?.id) {
      console.error('❌ User not authenticated');
      return false;
    }

    if (!isClient) {
      console.error('❌ User is not a client');
      return false;
    }

    // Data validation
    const validation = validateBookingData();
    if (!validation.isValid) {
      console.error('❌ Validation failed:', validation.errors);
      return false;
    }

    console.log('📋 Submitting booking with data:', {
      service: bookingState.selectedService?.name,
      date: bookingState.selectedDate?.toDateString(),
      dateComponents: {
        year: bookingState.selectedDate?.getFullYear(),
        month: bookingState.selectedDate?.getMonth() + 1,
        day: bookingState.selectedDate?.getDate()
      },
      time: bookingState.selectedTime,
      clientData: {
        name: bookingState.clientData.name,
        phone: bookingState.clientData.phone,
        email: bookingState.clientData.email,
        notes: bookingState.clientData.notes
      }
    });
    
    const success = await submitBookingBase(
      bookingState.selectedService,
      bookingState.selectedDate,
      bookingState.selectedTime,
      bookingState.clientData
    );
    
    if (success) {
      console.log('✅ Booking submitted successfully, resetting state');
      setTimeout(() => {
        bookingState.resetBooking();
      }, 1000);
    } else {
      console.error('❌ Booking submission failed');
    }
    
    return success;
  }, [submitBookingBase, bookingState, isSubmitting, user?.id, isClient, validateBookingData]);

  // Format currency
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  return {
    // States
    ...bookingState,
    
    // Services
    services: services || [],
    loadingServices,
    servicesError,
    
    // Time slots
    availableTimes: availableSlots || [],
    loadingTimes,
    timeSlotsError,
    
    // Authentication
    isClient,
    user,
    
    // Handlers
    handleDateSelect,
    handleTimeSelect,
    handleServiceSelect,
    
    // Submission
    isSubmitting,
    submitBooking: handleSubmitBooking,
    
    // Validation
    validateBookingData,
    
    // Utilities
    refetchSlots,
    refreshServices,
    formatCurrency
  };
};
