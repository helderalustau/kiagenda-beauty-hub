
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove tudo que não é número
  const digits = phone.replace(/\D/g, '');
  
  // Se tem 11 dígitos (celular): (XX)XXXXX-XXXX
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)})${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  
  // Se tem 10 dígitos (fixo): (XX)XXXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  
  // Retorna o número original se não tem formato padrão
  return phone;
};

export const unformatPhone = (phone: string): string => {
  return phone.replace(/\D/g, '');
};
