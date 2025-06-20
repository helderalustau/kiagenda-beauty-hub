
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import AdminRegistrationHeader from './admin-registration/AdminRegistrationHeader';
import AdminCreationInfo from './admin-registration/AdminCreationInfo';
import AdminFormFields from './admin-registration/AdminFormFields';
import AdminFormActions from './admin-registration/AdminFormActions';
import { validateAdminForm, formatPhone } from './admin-registration/AdminFormValidation';

interface AdminFormData {
  name: string;
  password: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'collaborator';
  setDateadm: string;
}

interface AdminRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AdminRegistrationForm = ({ 
  onSuccess, 
  onCancel
}: AdminRegistrationFormProps) => {
  const { toast } = useToast();
  const { registerAdmin, loading } = useAuthData();
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
    // Atualizar data sempre que o componente renderizar
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
      setDateadm: new Date().toISOString() // Atualizar data sempre que houver mudança
    }));

    // Limpar erro do campo quando começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      console.log('Criando administrador sem estabelecimento inicial...');

      // Criar administrador sem estabelecimento - será vinculado após seleção de plano
      const result = await registerAdmin(
        null, // Sem salon_id inicial
        formData.name.trim(),
        formData.password,
        formData.email.trim(),
        formData.phone.replace(/\D/g, ''),
        formData.role
      );

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Administrador criado com sucesso! Redirecionando para seleção de plano..."
        });
        
        // Armazenar dados do administrador para uso posterior
        localStorage.setItem('pendingAdminData', JSON.stringify({
          ...result.admin,
          createdAt: new Date().toISOString()
        }));
        
        // Reset form
        setFormData({
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'admin',
          setDateadm: new Date().toISOString()
        });
        
        // Redirecionar para seleção de plano
        setTimeout(() => {
          window.location.href = '/plan-selection';
        }, 2000);
        
        onSuccess?.();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erro ao criar administrador:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar administrador",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    //Redirecionar para homepage
    window.location.href = '/';
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <AdminRegistrationHeader />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <AdminCreationInfo />
          
          <AdminFormFields
            formData={formData}
            errors={errors}
            showPassword={showPassword}
            submitting={submitting}
            onInputChange={handleInputChange}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />

          <AdminFormActions
            onCancel={handleCancel}
            submitting={submitting}
            loading={loading}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminRegistrationForm;
