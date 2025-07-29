
import { useState } from 'react';

export const usePhoneValidation = () => {
  const formatPhone = (value: string): string => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedDigits = digits.slice(0, 11);
    
    // Aplica formatação baseada no número de dígitos
    if (limitedDigits.length === 0) return '';
    if (limitedDigits.length <= 2) return `(${limitedDigits}`;
    if (limitedDigits.length <= 6) return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
    if (limitedDigits.length <= 10) return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 6)}-${limitedDigits.slice(6)}`;
    
    // Para 11 dígitos (celular): (XX) XXXXX-XXXX
    return `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 7)}-${limitedDigits.slice(7)}`;
  };

  const validatePhone = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
  };

  const extractDigits = (phone: string): string => {
    return phone.replace(/\D/g, '');
  };

  return {
    formatPhone,
    validatePhone,
    extractDigits
  };
};
