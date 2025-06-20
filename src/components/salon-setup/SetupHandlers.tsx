
import { useToast } from "@/components/ui/use-toast";

interface SetupHandlersProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: any;
  salon: any;
  updateSalon: (data: any) => Promise<any>;
  toast: any;
  completeSalonSetup: (salonId: string, data: any) => Promise<any>;
  createServicesFromPresets: (salonId: string, services: any) => Promise<any>;
  selectedServices: { [key: string]: { selected: boolean; price: number } };
  setIsFinishing: (finishing: boolean) => void;
}

export const useSetupHandlers = ({
  currentStep,
  setCurrentStep,
  formData,
  salon,
  updateSalon,
  toast,
  completeSalonSetup,
  createServicesFromPresets,
  selectedServices,
  setIsFinishing
}: SetupHandlersProps) => {
  
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1: // Basic Salon Info
        if (!formData.salon_name?.trim()) {
          toast({
            title: "Erro",
            description: "Nome do estabelecimento é obrigatório",
            variant: "destructive"
          });
          return false;
        }
        break;
        
      case 2: // Address
        if (!formData.street_number?.trim() || !formData.city?.trim() || !formData.state?.trim()) {
          toast({
            title: "Erro",
            description: "Todos os campos de endereço são obrigatórios",
            variant: "destructive"
          });
          return false;
        }
        break;
        
      case 3: // Contact
        if (!formData.contact_phone?.trim()) {
          toast({
            title: "Erro",
            description: "Telefone de contato é obrigatório",
            variant: "destructive"
          });
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = async () => {
    console.log('Setup - Navegando para próximo passo...');
    
    // Validate current step
    if (!validateCurrentStep()) {
      return;
    }
    
    // Update salon data only if there are changes and we have a salon
    if (salon && currentStep > 0) {
      console.log('Setup - Verificando se há mudanças para salvar...');
      
      const hasChanges = (
        salon.name !== formData.salon_name ||
        salon.street_number !== formData.street_number ||
        salon.city !== formData.city ||
        salon.state !== formData.state ||
        salon.contact_phone !== formData.contact_phone ||
        JSON.stringify(salon.opening_hours) !== JSON.stringify(formData.opening_hours)
      );
      
      if (hasChanges) {
        console.log('Setup - Salvando alterações...');
        
        const updateData = {
          id: salon.id,
          name: formData.salon_name,
          street_number: formData.street_number,
          city: formData.city,
          state: formData.state,
          contact_phone: formData.contact_phone,
          opening_hours: formData.opening_hours,
          address: `${formData.street_number}, ${formData.city}, ${formData.state}`
        };
        
        const updateResult = await updateSalon(updateData);
        
        if (!updateResult.success) {
          toast({
            title: "Erro",
            description: "Erro ao salvar dados: " + (updateResult.message || 'Erro desconhecido'),
            variant: "destructive"
          });
          return;
        }
        
        console.log('Setup - Dados salvos com sucesso');
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishSetup = async () => {
    if (!salon) {
      toast({
        title: "Erro",
        description: "Dados do estabelecimento não encontrados",
        variant: "destructive"
      });
      return;
    }

    setIsFinishing(true);

    try {
      console.log('Setup - Finalizando configuração do estabelecimento...');
      
      // Prepare setup data
      const setupData = {
        name: formData.salon_name,
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        contact_phone: formData.contact_phone,
        address: `${formData.street_number}, ${formData.city}, ${formData.state}`,
        opening_hours: formData.opening_hours
      };
      
      // Complete salon setup
      const setupResult = await completeSalonSetup(salon.id, setupData);

      if (!setupResult.success) {
        throw new Error(setupResult.message || 'Erro ao finalizar configuração');
      }

      console.log('Setup - Configuração do estabelecimento finalizada com sucesso');

      // Process selected services
      const selectedServicesList = Object.entries(selectedServices)
        .filter(([_, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return service.selected && service.price > 0;
        })
        .map(([serviceId, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return {
            id: serviceId,
            price: Number(service.price)
          };
        });

      console.log('Setup - Serviços selecionados para criação:', selectedServicesList);

      if (selectedServicesList.length > 0) {
        console.log('Setup - Criando serviços selecionados...');
        
        const servicesResult = await createServicesFromPresets(salon.id, selectedServicesList);
        
        if (!servicesResult.success) {
          console.warn('Setup - Aviso: Alguns serviços podem não ter sido criados:', servicesResult.message);
          toast({
            title: "Aviso",
            description: "Estabelecimento configurado, mas alguns serviços podem não ter sido criados. Você pode adicioná-los manualmente na aba Serviços.",
            variant: "default"
          });
        } else {
          console.log('Setup - Serviços criados com sucesso:', servicesResult.services?.length || 0, 'serviços');
        }
      } else {
        console.log('Setup - Nenhum serviço foi selecionado para criação');
      }

      // Update localStorage with correct salon data
      const adminAuth = localStorage.getItem('adminAuth');
      if (adminAuth) {
        try {
          const admin = JSON.parse(adminAuth);
          admin.salon_id = salon.id;
          localStorage.setItem('adminAuth', JSON.stringify(admin));
          localStorage.setItem('selectedSalonId', salon.id);
          console.log('Setup - Dados do admin atualizados no localStorage');
        } catch (error) {
          console.error('Setup - Erro ao atualizar localStorage:', error);
        }
      }

      toast({
        title: "Sucesso!",
        description: "Estabelecimento configurado com sucesso! Redirecionando para o painel...",
      });

      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 1500);

    } catch (error) {
      console.error('Setup - Erro ao finalizar configuração:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao finalizar configuração",
        variant: "destructive"
      });
    } finally {
      setIsFinishing(false);
    }
  };

  return {
    handleNext,
    handlePrevious,
    handleFinishSetup
  };
};
