
interface AdminFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
}

export const validateAdminForm = (formData: AdminFormData): Partial<AdminFormData> => {
  const newErrors: Partial<AdminFormData> = {};

  // Validar nome
  if (!formData.name.trim()) {
    newErrors.name = 'Usuário é obrigatório';
  } else if (formData.name.trim().length < 2) {
    newErrors.name = 'Usuário deve ter pelo menos 2 caracteres';
  }

  // Validar senha
  if (!formData.password) {
    newErrors.password = 'Senha é obrigatória';
  } else if (formData.password.length < 6) {
    newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email.trim()) {
    newErrors.email = 'Email é obrigatório';
  } else if (!emailRegex.test(formData.email)) {
    newErrors.email = 'Email deve ter um formato válido';
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
