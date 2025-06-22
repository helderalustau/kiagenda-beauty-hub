
export const usePhoneFormatter = () => {
  // Format phone number with mask
  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    
    // Apply Brazilian phone mask
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
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
