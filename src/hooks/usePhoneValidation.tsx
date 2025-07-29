
import { useState } from 'react';

export const usePhoneValidation = () => {
  const formatPhone = (value: string): string => {
    // Remove todos os caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedDigits = digits.slice(0, 11);
    
    // Aplica a formatação baseada no número de dígitos
    if (limitedDigits.length <= 10) {
      // Formato: (11) 1234-5678
      return limitedDigits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      // Formato: (11) 12345-6789
      return limitedDigits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  const getPhoneDigits = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  return {
    formatPhone,
    validatePhone,
    getPhoneDigits
  };
};
