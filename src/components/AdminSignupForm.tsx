
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { AdminSignupData, validateAdminForm, formatPhone } from '@/utils/adminFormValidation';
import AdminSignupHeader from './admin-signup/AdminSignupHeader';
import AdminCreationDateInfo from './admin-signup/AdminCreationDateInfo';
import AdminFormFields from './admin-signup/AdminFormFields';
import AdminFormActions from './admin-signup/AdminFormActions';
import AdminInfoSection from './admin-signup/AdminInfoSection';
import { useSalonData } from '@/hooks/useSalonData';
import { useLocation } from 'react-router-dom';

interface AdminSignupFormProps {
  onSuccess?: (adminData: any) => void;
  onCancel?: () => void;
}

const AdminSignupForm = ({ onSuccess, onCancel }: AdminSignupFormProps) => {
  const { toast } = useToast();
  const { registerAdmin, loading } = useAuthData();
  const { createSalon } = useSalonData();
  const location = useLocation();
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

  const [selectedPlan, setSelectedPlan] = useState('bronze');
  const [errors, setErrors] = useState<Partial<AdminSignupData>>({});

  // Check if a plan was pre-selected from the homepage
  useEffect(() => {
    if (location.state?.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan);
    }
  }, [location.state]);

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
      console.log('Criando conta de administrador com dados:', formData);

      // Primeiro, criar um estabelecimento temporário para o administrador
      const temporarySalonData = {
        name: generateSequentialSalonName(),
        owner_name: formData.name.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        address: 'Endereço será preenchido na configuração',
        plan: selectedPlan // Use the selected plan
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
          title: "Conta Criada com Sucesso!",
          description: "Sua conta foi criada. Você será redirecionado para configurar seu estabelecimento."
        });
        
        // Armazenar dados do admin e salon para a configuração
        localStorage.setItem('adminData', JSON.stringify({
          ...result.admin,
          salon_id: salonResult.salon.id
        }));
        localStorage.setItem('selectedSalonId', salonResult.salon.id);
        
        // Limpar formulário
        setFormData({
          name: '',
          password: '',
          email: '',
          phone: '',
          role: 'admin',
          avatar_url: ''
        });
        
        // Redirecionar para configuração do estabelecimento após sucesso
        setTimeout(() => {
          window.location.href = '/salon-setup';
        }, 2000);
        
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
            
            {/* Show selected plan */}
            {selectedPlan && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">Plano Selecionado:</h3>
                <p className="text-blue-800 capitalize">
                  {selectedPlan === 'bronze' && 'Bronze - GRÁTIS/limitado'}
                  {selectedPlan === 'prata' && 'Prata - R$ 50/mês'}
                  {selectedPlan === 'gold' && 'Gold - R$ 199/mês'}
                </p>
              </div>
            )}
            
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
