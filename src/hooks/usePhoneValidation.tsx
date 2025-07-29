
import { useState, useCallback } from 'react';

export const usePhoneValidation = () => {
  const formatPhoneInput = useCallback((value: string): string => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedDigits = digits.substring(0, 11);
    
    // Aplica formatação baseada no tamanho
    if (limitedDigits.length <= 2) {
      return limitedDigits;
    } else if (limitedDigits.length <= 6) {
      return `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2)}`;
    } else if (limitedDigits.length <= 10) {
      return `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2, 6)}-${limitedDigits.substring(6)}`;
    } else {
      return `(${limitedDigits.substring(0, 2)}) ${limitedDigits.substring(2, 7)}-${limitedDigits.substring(7, 11)}`;
    }
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    // Válido se tem 10 ou 11 dígitos
    return digits.length >= 10 && digits.length <= 11;
  }, []);

  const getDigitsOnly = useCallback((phone: string): string => {
    return phone.replace(/\D/g, '');
  }, []);

  return {
    formatPhoneInput,
    validatePhone,
    getDigitsOnly
  };
};
