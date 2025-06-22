
import { useEffect } from 'react';
import { useAvailableTimeSlots } from '@/hooks/useAvailableTimeSlots';
import { Salon } from '@/hooks/useSupabaseData';

export const useBookingTimeSlots = (
  salon: Salon,
  selectedDate: Date | undefined
) => {
  const { availableSlots, loading: slotsLoading, fetchAvailableSlots } = useAvailableTimeSlots();

  useEffect(() => {
    console.log('useBookingTimeSlots - Effect triggered:', {
      selectedDate: selectedDate?.toDateString(),
      salonId: salon?.id,
      salonName: salon?.name,
      slotsLoading
    });

    if (selectedDate && salon?.id) {
      console.log('Loading available slots for:', {
        salon: salon.name,
        date: selectedDate.toDateString(),
        openingHours: salon.opening_hours
      });
      fetchAvailableSlots(salon, selectedDate);
    } else {
      console.log('Missing requirements for slot loading:', {
        hasDate: !!selectedDate,
        hasSalon: !!salon,
        salonId: salon?.id
      });
    }
  }, [selectedDate, salon?.id, salon?.name, fetchAvailableSlots]);

  return {
    availableTimes: availableSlots,
    loading: slotsLoading
  };
};
