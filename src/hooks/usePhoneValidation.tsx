
import { useState } from 'react';

export const usePhoneValidation = () => {
  const formatPhone = (value: string): string => {
    // Remove todos os caracteres não numéricos
    let digits = value.replace(/\D/g, '');
    
    // Remove o código do país se já estiver presente
    if (digits.startsWith('55') && digits.length > 11) {
      digits = digits.substring(2);
    }
    
    // Limita a 11 dígitos
    digits = digits.substring(0, 11);
    
    // Aplica formatação progressiva conforme o usuário digita
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `+55 (${digits}`;
    if (digits.length <= 6) return `+55 (${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    
    // Para 11 dígitos (celular)
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
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
