
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuthData } from '@/hooks/useAuthData';
import { useHierarchyData } from '@/hooks/useHierarchyData';
import { AdminSignupData, validateAdminForm, formatPhone } from '@/utils/adminFormValidation';
import AdminSignupHeader from './admin-signup/AdminSignupHeader';
import AdminCreationDateInfo from './admin-signup/AdminCreationDateInfo';
import AdminFormFields from './admin-signup/AdminFormFields';
import AdminFormActions from './admin-signup/AdminFormActions';
import AdminInfoSection from './admin-signup/AdminInfoSection';
import { useSalonData } from '@/hooks/useSalonData';
import { useLocation } from 'react-router-dom';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Crown, Zap, Star } from "lucide-react";

interface AdminSignupFormProps {
  onSuccess?: (adminData: any) => void;
  onCancel?: () => void;
}

const AdminSignupForm = ({ onSuccess, onCancel }: AdminSignupFormProps) => {
  const { toast } = useToast();
  const { registerAdmin, loading } = useAuthData();
  const { createSalon } = useSalonData();
  const { createHierarchyLink } = useHierarchyData();
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

  // Get available plans from configurations
  const { getAllPlansInfo } = usePlanConfigurations();
  const availablePlans = getAllPlansInfo();

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
        console.log('Administrador criado com sucesso, criando vínculos hierárquicos...');
        
        // Criar vínculos hierárquicos usando a nova função
        const hierarchyResult = await createHierarchyLink(
          salonResult.salon.id,
          result.admin.id,
          salonResult.salon.name,
          formData.name.trim()
        );

        if (!hierarchyResult.success) {
          console.error('Erro ao criar vínculos hierárquicos:', hierarchyResult.message);
          toast({
            title: "Aviso",
            description: "Conta criada mas houve problema na configuração dos vínculos hierárquicos. Entre em contato com o suporte.",
            variant: "destructive"
          });
        } else {
          console.log('Vínculos hierárquicos criados:', hierarchyResult.data);
        }

        toast({
          title: "Conta Criada com Sucesso!",
          description: "Sua conta foi criada. Você será redirecionado para configurar seu estabelecimento."
        });
        
        // Armazenar dados do admin e salon para a configuração
        localStorage.setItem('adminData', JSON.stringify({
          ...result.admin,
          salon_id: salonResult.salon.id,
          hierarchy_codes: hierarchyResult.data
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

  const handleCancel = () => {
    // Redirecionar para tela inicial
    window.location.href = '/';
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'bronze': return <Star className="h-4 w-4" />;
      case 'prata': return <Zap className="h-4 w-4" />;
      case 'gold': return <Crown className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'bronze': return 'text-amber-600';
      case 'prata': return 'text-gray-600';
      case 'gold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <AdminSignupHeader />
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AdminCreationDateInfo />
            
            {/* Plan Selection */}
            <div className="space-y-2">
              <Label htmlFor="plan-select" className="flex items-center gap-2 text-sm font-medium">
                <Crown className="h-4 w-4 text-blue-600" />
                Selecionar Plano *
              </Label>
              <Select
                value={selectedPlan}
                onValueChange={setSelectedPlan}
                disabled={submitting}
              >
                <SelectTrigger className="focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.plan_type} value={plan.plan_type}>
                      <div className="flex items-center gap-3">
                        <span className={getPlanColor(plan.plan_type)}>
                          {getPlanIcon(plan.plan_type)}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium">{plan.name}</span>
                          <span className="text-xs text-gray-500">{plan.price}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Escolha o plano ideal para seu estabelecimento
              </p>
            </div>
            
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

          <AdminInfoSection />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSignupForm;
