
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

  // Handler functions for compatibility with existing modal hooks
  const handleServiceSelect = useCallback((service: Service) => {
    console.log('Service selected:', service.name);
    setSelectedService(service);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('Date selected:', date?.toDateString());
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
  }, []);

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
    
    // Compatibility aliases for existing modal hooks
    clientData: bookingData,
    isSubmitting: false, // This will be overridden by submission hooks
    
    // Actions
    setCurrentStep,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setBookingData,
    
    // Compatibility aliases
    setClientData: setBookingData,
    setIsSubmitting: () => {}, // This will be overridden by submission hooks
    
    // Handlers
    handleServiceSelect,
    handleDateSelect,
    handleTimeSelect,
    handleReset: resetBooking,
    resetBooking,
    formatCurrency
  };
};
