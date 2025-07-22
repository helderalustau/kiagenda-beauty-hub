
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { useSalonData } from '@/hooks/useSalonData';
import { useAuth } from '@/hooks/useAuth';
import { validateAdminForm, formatPhone } from '@/components/admin-registration/AdminFormValidation';

interface AdminFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  setDateadm: string;
}

interface UseAdminRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const useAdminRegistrationForm = ({ 
  onSuccess, 
  onCancel 
}: UseAdminRegistrationFormProps) => {
  const { toast } = useToast();
  const { registerAdmin, loading } = useAuthData();
  const { createSalon } = useSalonData();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    password: '',
    email: '',
    phone: '',
    role: 'admin',
    setDateadm: new Date().toISOString()
  });

  const [errors, setErrors] = useState<Partial<AdminFormData>>({});

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      setDateadm: new Date().toISOString()
    }));
  }, []);

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
      setDateadm: new Date().toISOString()
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const generateSequentialSalonName = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EST-${timestamp}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (submitting) {
      console.log('Já está processando, ignorando nova submissão');
      return;
    }

    console.log('Iniciando processo de cadastro de administrador');
    
    const validationErrors = validateAdminForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      console.log('Dados validados, criando estabelecimento temporário');

      const temporarySalonData = {
        name: generateSequentialSalonName(),
        owner_name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: 'Endereço será preenchido na configuração',
        plan: 'bronze'
      };

      console.log('Criando estabelecimento:', temporarySalonData);
      const salonResult = await createSalon(temporarySalonData);

      if (!salonResult.success) {
        const errorMessage = 'message' in salonResult ? salonResult.message : 'Erro ao criar estabelecimento';
        throw new Error(errorMessage);
      }

      if (!('salon' in salonResult) || !salonResult.salon) {
        throw new Error('Erro ao criar estabelecimento: dados não retornados');
      }

      console.log('Estabelecimento criado com sucesso:', salonResult.salon.id);

      console.log('Criando administrador');
      const adminResult = await registerAdmin(
        salonResult.salon.id,
        formData.name.trim(),
        formData.password,
        formData.email.trim(),
        formData.phone.replace(/\D/g, ''),
        formData.role
      );

      if (!adminResult.success) {
        console.error('Erro ao criar administrador:', adminResult);
        throw new Error(adminResult.message || 'Erro ao criar administrador');
      }

      if (!adminResult.admin) {
        throw new Error('Dados do administrador não retornados');
      }

      console.log('Administrador criado com sucesso:', adminResult.admin.id);

      // Fazer login automático do novo administrador
      const userData = {
        id: adminResult.admin.id,
        name: adminResult.admin.name,
        email: adminResult.admin.email,
        role: adminResult.admin.role,
        salon_id: salonResult.salon.id,
        isFirstAccess: true,
        loginTime: new Date().toISOString()
      };

      // Usar o contexto de autenticação para fazer login
      login(userData);

      console.log('Administrador autenticado automaticamente');

      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: "Redirecionando para configuração da loja..."
      });

      // Limpar formulário
      setFormData({
        name: '',
        password: '',
        email: '',
        phone: '',
        role: 'admin',
        setDateadm: new Date().toISOString()
      });

      // Redirecionar para configuração da loja
      setTimeout(() => {
        window.location.href = '/salon-setup';
      }, 1500);

    } catch (error) {
      console.error('Erro no processo de cadastro:', error);
      toast({
        title: "Erro no Cadastro",
        description: error instanceof Error ? error.message : "Erro ao criar administrador",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      // Redirecionar para tela inicial
      window.location.href = '/';
    }
  };

  return {
    formData,
    errors,
    showPassword,
    submitting,
    loading,
    handleInputChange,
    handleSubmit,
    handleCancel,
    setShowPassword
  };
};
