
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { useSalonData } from '@/hooks/useSalonData';
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

  const generateSequentialSalonName = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EST-${timestamp}-${random}`;
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
      console.log('Criando estabelecimento temporário para o administrador...');

      // Primeiro, criar um estabelecimento temporário para o administrador
      const temporarySalonData = {
        name: generateSequentialSalonName(),
        owner_name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: 'Endereço será preenchido na configuração',
        plan: 'bronze' // Plano padrão inicial
      };

      console.log('Criando estabelecimento temporário:', temporarySalonData);
      const salonResult = await createSalon(temporarySalonData);

      if (!salonResult.success) {
        const errorMessage = 'message' in salonResult && salonResult.message 
          ? salonResult.message 
          : 'Erro desconhecido';
        throw new Error('Erro ao criar estabelecimento: ' + errorMessage);
      }

      if (!('salon' in salonResult) || !salonResult.salon) {
        throw new Error('Erro ao criar estabelecimento: dados do estabelecimento não retornados');
      }

      console.log('Estabelecimento criado com sucesso:', salonResult.salon);

      // Agora criar o administrador vinculado ao estabelecimento
      const result = await registerAdmin(
        salonResult.salon.id,
        formData.name.trim(),
        formData.password,
        formData.email.trim(),
        formData.phone.replace(/\D/g, ''),
        formData.role
      );

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Administrador criado com sucesso! Redirecionando para configuração do estabelecimento..."
        });
        
        // Armazenar dados do administrador e estabelecimento para uso na configuração
        localStorage.setItem('adminData', JSON.stringify({
          ...result.admin,
          salon_id: salonResult.salon.id
        }));
        localStorage.setItem('selectedSalonId', salonResult.salon.id);
        
        // Reset form
        setFormData({
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'admin',
          setDateadm: new Date().toISOString()
        });
        
        // Redirecionar para configuração do estabelecimento
        setTimeout(() => {
          window.location.href = '/salon-setup';
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
    // Redirecionar para homepage
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
