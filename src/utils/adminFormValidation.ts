
export interface AdminSignupData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  avatar_url?: string;
}

export const validateAdminForm = (formData: AdminSignupData): Partial<AdminSignupData> => {
  const newErrors: Partial<AdminSignupData> = {};

  // Validar nome
  if (!formData.name.trim()) {
    newErrors.name = 'Nome é obrigatório';
  } else if (formData.name.trim().length < 2) {
    newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    newErrors.email = 'Email é obrigatório';
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = 'Email deve ter um formato válido';
  }

  // Validar senha
  if (!formData.password) {
    newErrors.password = 'Senha é obrigatória';
  } else if (formData.password.length < 6) {
    newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  // Validar telefone
  if (!formData.phone.trim()) {
    newErrors.phone = 'Telefone é obrigatório';
  } else if (formData.phone.replace(/\D/g, '').length < 10) {
    newErrors.phone = 'Telefone deve ter pelo menos 10 dígitos';
  }

  return newErrors;
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const getCurrentDateTime = (): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date());
};
