
import { useEffect } from 'react';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { Salon } from '@/hooks/useSupabaseData';

export const useBookingTimeSlots = (
  salon: Salon,
  selectedDate: Date | undefined
) => {
  const { availableSlots, loading: slotsLoading, fetchAvailableSlots } = useAvailableTimeSlots();

  useEffect(() => {
    if (selectedDate && salon && !slotsLoading) {
      console.log('Loading available slots for date:', selectedDate);
      fetchAvailableSlots(salon, selectedDate);
    }
  }, [selectedDate, salon?.id, fetchAvailableSlots, slotsLoading]);

  return {
    availableTimes: availableSlots
  };
};
