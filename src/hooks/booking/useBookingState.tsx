
import { useState, useCallback } from 'react';
import { Service } from '@/hooks/useSupabaseData';

interface BookingData {
  name: string;
  phone: string;
  notes: string;
}

export const useBookingState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingData, setBookingData] = useState<BookingData>({
    name: '',
    phone: '',
    notes: ''
  });

  const resetBooking = useCallback(() => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setBookingData({ name: '', phone: '', notes: '' });
  }, []);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }, []);

  return {
    // States
    currentStep,
    selectedService,
    selectedDate,
    selectedTime,
    bookingData,

    // Actions
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setBookingData,
    resetBooking,
    formatCurrency
  };
};
