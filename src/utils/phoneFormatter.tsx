
export const formatPhone = (phone: string): string => {
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
  
  // Retorna o número original se não tem formato padrão
  return phone;
};

export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
