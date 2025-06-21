
export const useInputValidation = () => {
  // Sanitize input to prevent XSS
  const sanitizeInput = (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .trim()
      .substring(0, 1000); // Limit length
  };

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate phone number (Brazilian format)
  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  };

  // Validate name (only letters and spaces)
  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]+$/;
    return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
  };

  // Validate salon name
  const validateSalonName = (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && name.trim().length > 0;
  };

  // Validate URL
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Sanitize and validate input
  const sanitizeAndValidate = (
    input: string, 
    type: 'email' | 'phone' | 'name' | 'salon' | 'text'
  ): { value: string; isValid: boolean; error?: string } => {
    const sanitized = sanitizeInput(input);
    
    switch (type) {
      case 'email':
        return {
          value: sanitized,
          isValid: validateEmail(sanitized),
          error: validateEmail(sanitized) ? undefined : 'Email inválido'
        };
      case 'phone':
        return {
          value: sanitized,
          isValid: validatePhone(sanitized),
          error: validatePhone(sanitized) ? undefined : 'Telefone inválido'
        };
      case 'name':
        return {
          value: sanitized,
          isValid: validateName(sanitized),
          error: validateName(sanitized) ? undefined : 'Nome deve conter apenas letras e espaços'
        };
      case 'salon':
        return {
          value: sanitized,
          isValid: validateSalonName(sanitized),
          error: validateSalonName(sanitized) ? undefined : 'Nome do estabelecimento inválido'
        };
      default:
        return {
          value: sanitized,
          isValid: true
        };
    }
  };

  return {
    sanitizeInput,
    validateEmail,
    validatePhone,
    validateName,
    validateSalonName,
    validateUrl,
    sanitizeAndValidate
  };
};
