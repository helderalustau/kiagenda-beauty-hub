
import { useState, useCallback } from 'react';
import { Service } from '@/hooks/useSupabaseData';

export const useBookingState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServiceSelect = useCallback((service: Service) => {
    console.log('Service selected:', service);
    setSelectedService(service);
  }, []);

  const handleDateSelect = useCallback((date: Date | undefined) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    setSelectedTime('');
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
  }, []);

  const handleReset = useCallback(() => {
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
