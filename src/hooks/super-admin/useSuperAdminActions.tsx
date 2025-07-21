
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';

export const useSuperAdminActions = () => {
  const { toast } = useToast();
  const { 
    createSalon, 
    cleanupSalonsWithoutAdmins,
    cleanupIncompleteSalons,
    fetchAllSalons,
    fetchDashboardStats,
    fetchPlanConfigurations
  } = useSupabaseData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (salonData: any) => {
    const errors = [];
    
    if (!salonData.owner_name.trim()) {
      errors.push('Nome do responsável é obrigatório');
    }
    if (!salonData.phone.trim()) {
      errors.push('Telefone é obrigatório');
    }

    return errors;
  };

  const handleCreateSalon = async (salonData: any, bannerFile: File | null) => {
    const validationErrors = validateForm(salonData);
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting salon creation process...');

    try {
      const result = await createSalon(salonData);
      console.log('Create salon result:', result);
      
      if (result.success && 'salon' in result && result.salon) {
        console.log('Salon created successfully, ID:', result.salon.id);

        toast({
          title: "Sucesso",
          description: "Estabelecimento criado com sucesso! Configure-o na próxima etapa."
        });
        
        // Refresh data
        fetchAllSalons();
        fetchDashboardStats();
      } else {
        // Handle error case - check if message exists
        const errorMessage = 'message' in result && result.message 
          ? result.message 
          : 'Erro desconhecido';
        console.error('Failed to create salon:', errorMessage);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Unexpected error in handleCreateSalon:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCleanupSalons = async () => {
    const result = await cleanupSalonsWithoutAdmins();
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `${result.deletedCount} estabelecimento(s) sem administradores foram removidos`
      });
      fetchAllSalons();
      fetchDashboardStats();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleCleanupIncompleteSalons = async () => {
    const result = await cleanupIncompleteSalons();
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `${result.deletedCount} estabelecimento(s) sem configuração completa foram removidos`
      });
      fetchAllSalons();
      fetchDashboardStats();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  const handleRefresh = () => {
    fetchAllSalons();
    fetchDashboardStats();
    fetchPlanConfigurations();
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return {
    isSubmitting,
    handleCreateSalon,
    handleCleanupSalons,
    handleCleanupIncompleteSalons,
    handleLogout,
    handleRefresh,
    handleBackToHome
  };
};
