
export const useInputValidation = () => {
  const sanitizeAndValidate = (input: string, type: 'name' | 'email' | 'phone' | 'text' | 'password') => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, error: 'Entrada inválida', value: '' };
    }

    // Remove potentially dangerous characters and excessive whitespace
    let sanitized = input.trim().replace(/[<>\"'&]/g, '');
    
    // Length limits for security
    const maxLengths = {
      name: 100,
      email: 254,
      phone: 20,
      text: 1000,
      password: 128
    };

    if (sanitized.length > maxLengths[type]) {
      return { 
        isValid: false, 
        error: `Muito longo (máximo ${maxLengths[type]} caracteres)`, 
        value: sanitized 
      };
    }

    switch (type) {
      case 'name':
        // Only letters, spaces, and common name characters
        if (!/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,}$/.test(sanitized)) {
          return { 
            isValid: false, 
            error: 'Nome deve conter apenas letras e ter pelo menos 2 caracteres', 
            value: sanitized 
          };
        }
        // Prevent excessive spaces
        sanitized = sanitized.replace(/\s+/g, ' ');
        break;

      case 'email':
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailRegex.test(sanitized)) {
          return { 
            isValid: false, 
            error: 'Formato de email inválido', 
            value: sanitized 
          };
        }
        sanitized = sanitized.toLowerCase();
        break;

      case 'phone':
        // Remove all non-numeric characters for validation
        const numbersOnly = sanitized.replace(/\D/g, '');
        if (numbersOnly.length < 10 || numbersOnly.length > 15) {
          return { 
            isValid: false, 
            error: 'Telefone deve ter entre 10 e 15 dígitos', 
            value: sanitized 
          };
        }
        sanitized = numbersOnly;
        break;

      case 'password':
        if (sanitized.length < 8) {
          return { 
            isValid: false, 
            error: 'Senha deve ter pelo menos 8 caracteres', 
            value: sanitized 
          };
        }
        // Check for at least one number and one letter for basic security
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(sanitized)) {
          return { 
            isValid: false, 
            error: 'Senha deve conter pelo menos uma letra e um número', 
            value: sanitized 
          };
        }
        break;

      case 'text':
        // Basic text sanitization - remove script tags and similar
        sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        sanitized = sanitized.replace(/javascript:/gi, '');
        break;

      default:
        break;
    }

    return { isValid: true, value: sanitized };
  };

  const validateRequired = (value: any, fieldName: string) => {
    if (value === null || value === undefined || value === '') {
      return { isValid: false, error: `${fieldName} é obrigatório` };
    }
    return { isValid: true };
  };

  const validateLength = (value: string, min: number, max: number, fieldName: string) => {
    if (value.length < min) {
      return { isValid: false, error: `${fieldName} deve ter pelo menos ${min} caracteres` };
    }
    if (value.length > max) {
      return { isValid: false, error: `${fieldName} deve ter no máximo ${max} caracteres` };
    }
    return { isValid: true };
  };

  // Enhanced XSS protection
  const sanitizeHtml = (input: string): string => {
    const entityMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    };
    
    return String(input).replace(/[&<>"'\/]/g, (char) => entityMap[char]);
  };

  // SQL injection prevention (basic)
  const sanitizeForDatabase = (input: string): string => {
    // Remove common SQL injection patterns
    const sqlPatterns = [
      /('|(\\')|('')|(\-\-)|(;)|(\||(\*)|(%)))/gi,
      /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
      /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(;))/gi,
      /union.*select/gi,
      /select.*from/gi,
      /insert.*into/gi,
      /delete.*from/gi,
      /update.*set/gi,
      /drop.*table/gi,
      /exec(ute){0,1}[^a-z]/gi
    ];

    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized;
  };

  return {
    sanitizeAndValidate,
    validateRequired,
    validateLength,
    sanitizeHtml,
    sanitizeForDatabase
  };
};
