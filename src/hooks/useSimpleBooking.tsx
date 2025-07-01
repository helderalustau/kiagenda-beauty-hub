
import React, { useCallback, useMemo, useEffect } from 'react';
import { Salon } from '@/hooks/useSupabaseData';
import { useBookingState } from '@/hooks/booking/useBookingState';
import { useBookingServices } from '@/hooks/booking/useBookingServices';
import { useBookingSubmission } from '@/hooks/booking/useBookingSubmission';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';

export const useSimpleBooking = (salon: Salon) => {
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
      servicesCount: services?.length || 0,
      availableSlotsCount: availableSlots?.length || 0,
      loadingServices,
      loadingTimes,
      servicesError,
      timeSlotsError
    });
  }, [
    salonId, 
    salon?.name,
    bookingState.selectedService, 
    bookingState.selectedDate, 
    bookingState.selectedTime, 
    services,
    availableSlots, 
    loadingServices,
    loadingTimes, 
    servicesError,
    timeSlotsError
  ]);

  // Force refresh services when salon changes
  useEffect(() => {
    if (salonId && (!services.length || servicesError)) {
      console.log('🔄 Force refreshing services for salon:', salon?.name);
      refreshServices();
    }
  }, [salonId, services.length, servicesError, refreshServices, salon?.name]);

  // Handle date selection with validation
  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('📅 Date selected:', date?.toDateString());
    
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (date < today) {
        console.log('❌ Cannot select past date');
        return;
      }
    }
    
    bookingState.setSelectedDate(date);
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
    
    // Reset time when service changes (different services may have different availability)
    if (bookingState.selectedTime) {
      console.log('🔄 Resetting selected time due to service change');
      bookingState.setSelectedTime('');
    }
  }, [bookingState]);

  // Submit booking
  const handleSubmitBooking = useCallback(async () => {
    if (isSubmitting) {
      console.log('⚠️ Submission already in progress');
      return false;
    }

    console.log('📋 Starting booking submission with data:', {
      service: bookingState.selectedService?.name,
      date: bookingState.selectedDate?.toDateString(),
      time: bookingState.selectedTime,
      clientData: bookingState.clientData
    });

    // Validate required fields
    if (!bookingState.selectedService) {
      console.error('❌ No service selected');
      return false;
    }

    if (!bookingState.selectedDate) {
      console.error('❌ No date selected');
      return false;
    }

    if (!bookingState.selectedTime) {
      console.error('❌ No time selected');
      return false;
    }

    if (!bookingState.clientData.name.trim()) {
      console.error('❌ Client name missing');
      return false;
    }

    if (!bookingState.clientData.phone.trim()) {
      console.error('❌ Client phone missing');
      return false;
    }
    
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
  }, [submitBookingBase, bookingState, isSubmitting]);

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
    services,
    loadingServices,
    servicesError,
    
    // Time slots
    availableTimes: availableSlots || [],
    loadingTimes,
    timeSlotsError,
    
    // Handlers
    handleDateSelect,
    handleTimeSelect,
    handleServiceSelect,
    
    // Submission
    isSubmitting,
    submitBooking: handleSubmitBooking,
    
    // Utilities
    refetchSlots,
    refreshServices,
    formatCurrency
  };
};
