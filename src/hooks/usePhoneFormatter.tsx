
export const usePhoneFormatter = () => {
  // Format phone number with International Brazilian mask - automatic formatting
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    let numbers = value.replace(/\D/g, '');
    
    // Remove o código do país se já estiver presente
    if (numbers.startsWith('55') && numbers.length > 11) {
      numbers = numbers.substring(2);
    }
    
    // Limita a 11 dígitos
    numbers = numbers.substring(0, 11);
    
    // Apply International Brazilian phone mask: +55 (XX) XXXXX-XXXX or +55 (XX) XXXX-XXXX
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `+55 (${numbers}`;
    if (numbers.length <= 6) return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    // For 11 digits (mobile): +55 (XX) XXXXX-XXXX
    return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  // Extract only numbers from phone
  const extractPhoneNumbers = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const validatePhone = (phone: string) => {
    const numbers = extractPhoneNumbers(phone);
    return numbers.length >= 10 && numbers.length <= 11;
  };

  return {
    formatPhoneNumber,
    extractPhoneNumbers,
    validatePhone
  };
};
