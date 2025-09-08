/**
 * Formatação internacional de telefone brasileiro
 * Converte qualquer número para o formato: +55 (XX) XXXXX-XXXX ou +55 (XX) XXXX-XXXX
 */

export const formatInternationalPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  let digits = phone.replace(/\D/g, '');
  
  // Remove o código do país se já estiver presente
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.substring(2);
  }
  
  // Se não tem DDD, não formata
  if (digits.length < 10) return phone;
  
  // Garante que tenha no máximo 11 dígitos
  digits = digits.substring(0, 11);
  
  // Formata baseado no número de dígitos
  if (digits.length === 11) {
    // Celular: +55 (XX) XXXXX-XXXX
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    // Fixo: +55 (XX) XXXX-XXXX
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  return phone;
};

export const extractPhoneDigits = (phone: string): string => {
  if (!phone) return '';
  
  let digits = phone.replace(/\D/g, '');
  
  // Remove o código do país se já estiver presente
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.substring(2);
  }
  
  return digits;
};

export const validateInternationalPhone = (phone: string): boolean => {
  const digits = extractPhoneDigits(phone);
  return digits.length >= 10 && digits.length <= 11;
};

export const formatPhoneInput = (value: string): string => {
  // Remove caracteres não numéricos
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