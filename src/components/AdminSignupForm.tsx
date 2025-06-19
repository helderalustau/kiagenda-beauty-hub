
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { AdminSignupData, validateAdminForm, formatPhone } from '@/utils/adminFormValidation';
import AdminSignupHeader from './admin-signup/AdminSignupHeader';
import AdminCreationDateInfo from './admin-signup/AdminCreationDateInfo';
import AdminFormFields from './admin-signup/AdminFormFields';
import AdminFormActions from './admin-signup/AdminFormActions';
import AdminInfoSection from './admin-signup/AdminInfoSection';

interface AdminSignupFormProps {
  onSuccess?: (adminData: any) => void;
  onCancel?: () => void;
}

const AdminSignupForm = ({ onSuccess, onCancel }: AdminSignupFormProps) => {
  const { toast } = useToast();
  const { registerAdmin, loading } = useAuthData();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AdminSignupData>({
    name: '',
    password: '',
    email: '',
    phone: '',
    role: 'admin',
    avatar_url: ''
  });

  const [errors, setErrors] = useState<Partial<AdminSignupData>>({});

  const handleInputChange = (field: keyof AdminSignupData, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      console.log('Criando conta de administrador com dados:', formData);

      const result = await registerAdmin(
        null, // salon_id removido
        formData.name.trim(),
        formData.password,
        formData.email.trim(),
        formData.phone.replace(/\D/g, ''),
        formData.role
      );

      if (result.success) {
        toast({
          title: "Conta Criada com Sucesso!",
          description: "Sua conta de administrador foi criada. Você pode fazer login agora."
        });
        
        // Limpar formulário
        setFormData({
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'admin',
          avatar_url: ''
        });
        
        onSuccess?.(result.admin);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar conta de administrador",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <AdminSignupHeader />
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AdminCreationDateInfo />
            
            <AdminFormFields
              formData={formData}
              errors={errors}
              showPassword={showPassword}
              submitting={submitting}
              onInputChange={handleInputChange}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <AdminFormActions
              onCancel={onCancel}
              submitting={submitting}
              loading={loading}
            />
          </form>

          <AdminInfoSection />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignupForm;
