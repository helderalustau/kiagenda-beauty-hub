
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { useSalonData } from '@/hooks/useSalonData';
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

      // Criar estabelecimento temporário para o administrador
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
        console.error('Erro ao criar estabelecimento:', salonResult);
        const errorMessage = 'message' in salonResult && salonResult.message 
          ? salonResult.message 
          : 'Erro desconhecido ao criar estabelecimento';
        throw new Error(errorMessage);
      }

      if (!('salon' in salonResult) || !salonResult.salon) {
        throw new Error('Dados do estabelecimento não retornados');
      }

      console.log('Estabelecimento criado com sucesso:', salonResult.salon.id);

      // Criar administrador vinculado ao estabelecimento
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

      console.log('Administrador criado com sucesso:', adminResult.admin.id);

      // Preparar dados para armazenamento local
      const adminAuthData = {
        id: adminResult.admin.id,
        name: adminResult.admin.name,
        email: adminResult.admin.email,
        role: adminResult.admin.role,
        salon_id: salonResult.salon.id,
        isFirstAccess: true,
        loginTime: new Date().toISOString()
      };

      // Armazenar dados no localStorage
      console.log('Armazenando dados de autenticação:', adminAuthData);
      localStorage.setItem('adminAuth', JSON.stringify(adminAuthData));
      localStorage.setItem('selectedSalonId', salonResult.salon.id);
      
      toast({
        title: "Cadastro Realizado com Sucesso!",
        description: "Redirecionando para configuração do estabelecimento..."
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

      // Callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }

      // Redirecionar para configuração do estabelecimento
      console.log('Redirecionando para /salon-setup');
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
      window.location.href = '/admin-login';
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
