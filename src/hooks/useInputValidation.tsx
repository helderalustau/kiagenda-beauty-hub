import { useMemo } from 'react';

export const useInputValidation = () => {
  const validation = useMemo(() => ({
    sanitizeAndValidate: (input: string, type: 'text' | 'email' | 'name' | 'phone' | 'password') => {
      if (!input || typeof input !== 'string') {
        return { isValid: false, error: 'Campo obrigatório', value: '' };
      }

      // Basic sanitization
      let sanitized = input.trim();
      
      // Remove potentially dangerous characters for XSS prevention
      sanitized = sanitized.replace(/[<>'"]/g, '');
      
      // Type-specific validation
      switch (type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(sanitized)) {
            return { isValid: false, error: 'Email inválido', value: sanitized };
          }
          break;
          
        case 'name':
          if (sanitized.length < 2 || sanitized.length > 50) {
            return { isValid: false, error: 'Nome deve ter entre 2 e 50 caracteres', value: sanitized };
          }
          // Only allow letters, spaces, and common name characters
          const nameRegex = /^[a-zA-ZÀ-ÿ\s\-\'\.]+$/;
          if (!nameRegex.test(sanitized)) {
            return { isValid: false, error: 'Nome contém caracteres inválidos', value: sanitized };
          }
          break;
          
        case 'phone':
          // Remove non-digits
          sanitized = sanitized.replace(/\D/g, '');
          if (sanitized.length < 10 || sanitized.length > 11) {
            return { isValid: false, error: 'Telefone inválido', value: sanitized };
          }
          break;
          
        case 'password':
          if (sanitized.length < 6) {
            return { isValid: false, error: 'Senha deve ter pelo menos 6 caracteres', value: sanitized };
          }
          break;
          
        case 'text':
        default:
          if (sanitized.length > 1000) {
            return { isValid: false, error: 'Texto muito longo', value: sanitized.substring(0, 1000) };
          }
          break;
      }

      return { isValid: true, value: sanitized };
    },

    validateRequired: (value: any, fieldName: string) => {
      if (!value || (typeof value === 'string' && !value.trim())) {
        return { isValid: false, error: `${fieldName} é obrigatório` };
      }
      return { isValid: true, value };
    },

    validateLength: (value: string, minLength: number, maxLength: number, fieldName: string) => {
      if (!value) {
        return { isValid: false, error: `${fieldName} é obrigatório` };
      }
      
      if (value.length < minLength) {
        return { isValid: false, error: `${fieldName} deve ter pelo menos ${minLength} caracteres` };
      }
      
      if (value.length > maxLength) {
        return { isValid: false, error: `${fieldName} deve ter no máximo ${maxLength} caracteres` };
      }
      
      return { isValid: true, value };
    },

    validateUrl: (url: string) => {
      if (!url || typeof url !== 'string') {
        return false;
      }
      
      try {
        const urlObj = new URL(url);
        // Only allow http and https protocols
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
      } catch {
        return false;
      }
    },

    validatePassword: (password: string) => {
      const errors: string[] = [];
      
      if (password.length < 8) {
        errors.push('Deve ter pelo menos 8 caracteres');
      }
      
      if (!/[A-Z]/.test(password)) {
        errors.push('Deve conter pelo menos uma letra maiúscula');
      }
      
      if (!/[a-z]/.test(password)) {
        errors.push('Deve conter pelo menos uma letra minúscula');
      }
      
      if (!/\d/.test(password)) {
        errors.push('Deve conter pelo menos um número');
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Deve conter pelo menos um caractere especial');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        strength: errors.length === 0 ? 'strong' : errors.length <= 2 ? 'medium' : 'weak'
      };
    }
  }), []);

  return validation;
};
