
export const formatCep = (cep: string): string => {
  if (!cep) return '';
  
  // Remove tudo que não é número
  const digits = cep.replace(/\D/g, '');
  
  // Aplica a máscara: 99999-999
  if (digits.length <= 5) {
    return digits;
  }
  
  return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
};

export const unformatCep = (cep: string): string => {
  return cep.replace(/\D/g, '');
};
