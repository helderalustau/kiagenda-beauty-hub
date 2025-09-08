
export interface AdminSignupData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  avatar_url?: string;
}

export const validateAdminForm = (formData: AdminSignupData): Partial<AdminSignupData> => {
  const errors: Partial<AdminSignupData> = {};

  // Validar nome
  if (!formData.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  // Validar senha
  if (!formData.password) {
    errors.password = 'Senha é obrigatória';
  } else if (formData.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    errors.email = 'Email é obrigatório';
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Email deve ter um formato válido';
  }

  // Validar telefone
  if (!formData.phone.trim()) {
    errors.phone = 'Telefone é obrigatório';
  } else if (formData.phone.replace(/\D/g, '').length < 10) {
    errors.phone = 'Telefone deve ter pelo menos 10 dígitos';
  }

  return errors;
};

export const formatPhone = (value: string) => {
  let digits = value.replace(/\D/g, '');
  
  // Remove o código do país se já estiver presente
  if (digits.startsWith('55') && digits.length > 11) {
    digits = digits.substring(2);
  }
  
  // Limita a 11 dígitos
  digits = digits.substring(0, 11);
  
  if (digits.length <= 10) {
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  } else {
    return `+55 (${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
};

export const getCurrentDateTime = () => {
  const now = new Date();
  return now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};
