
import { useCallback } from 'react';
import { Service } from '@/hooks/useSupabaseData';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

export const useBookingValidation = () => {
  // Validação dos dados de agendamento
  const validateBookingData = useCallback((
    selectedService: Service | null,
    selectedDate: Date | undefined,
    selectedTime: string,
    clientData: ClientData
  ) => {
    const errors: string[] = [];

    if (!selectedService) errors.push('Selecione um serviço');
    if (!selectedDate) errors.push('Selecione uma data');
    if (!selectedTime) errors.push('Selecione um horário');
    if (!clientData.name.trim()) errors.push('Nome é obrigatório');
    if (!clientData.phone.trim()) errors.push('Telefone é obrigatório');
    
    // Validação básica do telefone (números e parênteses)
    const phoneClean = clientData.phone.replace(/\D/g, '');
    if (phoneClean.length < 10 || phoneClean.length > 11) {
      errors.push('Telefone deve ter 10 ou 11 dígitos');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    validateBookingData
  };
};
