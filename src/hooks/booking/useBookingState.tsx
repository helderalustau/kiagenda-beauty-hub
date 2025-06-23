
import { useState, useCallback } from 'react';
import { Service } from '@/hooks/useSupabaseData';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useBookingState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState<ClientData>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceSelect = useCallback((service: Service) => {
    console.log('🎯 Service selected:', service.name);
    setSelectedService(service);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('📅 Date selected:', date?.toDateString());
    setSelectedDate(date);
    // Reset time when date changes
    if (selectedTime) {
      setSelectedTime('');
      console.log('🕐 Time reset due to date change');
    }
  }, [selectedTime]);

  const handleTimeSelect = useCallback((time: string) => {
    console.log('🕐 Time selected:', time);
    setSelectedTime(time);
  }, []);

  const handleReset = useCallback(() => {
    console.log('🔄 Resetting all booking state');
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedDate(undefined);
    setSelectedTime('');
    setClientData({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
    setIsSubmitting(false);
  }, []);

  return {
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
    handleReset
  };
};
