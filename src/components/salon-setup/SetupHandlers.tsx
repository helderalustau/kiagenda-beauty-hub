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
      case 1: // Basic Salon Info - apenas nome obrigatório
        if (!formData.salon_name?.trim()) {
          toast({
            title: "Erro",
            description: "Nome do estabelecimento é obrigatório",
            variant: "destructive"
          });
          return false;
        }
        break;
        
      case 4: // Services - Validação apenas dos preços dos serviços selecionados
        const selectedServicesList = Object.entries(selectedServices).filter(([_, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return service.selected;
        });
        
        // Se há serviços selecionados, todos devem ter preço válido
        if (selectedServicesList.length > 0) {
          const servicesWithoutPrice = selectedServicesList.filter(([_, serviceData]) => {
            const service = serviceData as { selected: boolean; price: number };
            return !service.price || service.price <= 0;
          });
          
          if (servicesWithoutPrice.length > 0) {
            toast({
              title: "Erro",
              description: `Defina um preço válido para todos os ${servicesWithoutPrice.length} serviços selecionados.`,
              variant: "destructive"
            });
            return false;
          }
        }
        break;
        
      // Todos os outros passos passam sem validação obrigatória
      default:
        break;
    }
    return true;
  };

  const validateServicesBeforeFinish = () => {
    const selectedServicesList = Object.entries(selectedServices).filter(([_, serviceData]) => {
      const service = serviceData as { selected: boolean; price: number };
      return service.selected;
    });

    // Se há serviços selecionados, todos devem ter preço válido
    if (selectedServicesList.length > 0) {
      const servicesWithValidPrice = selectedServicesList.filter(([_, serviceData]) => {
        const service = serviceData as { selected: boolean; price: number };
        return service.price && service.price > 0;
      });

      if (servicesWithValidPrice.length !== selectedServicesList.length) {
        const invalidCount = selectedServicesList.length - servicesWithValidPrice.length;
        toast({
          title: "Erro",
          description: `${invalidCount} serviços selecionados não possuem preço válido. Defina um preço maior que R$ 0,00 para todos os serviços selecionados.`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleNext = async () => {
    console.log('Setup - Navegando para próximo passo...');
    
    // Validate current step
    if (!validateCurrentStep()) {
      return;
    }
    
    // Para o passo de horários (4), não salvar automaticamente - deixar que o próprio componente gerencie
    if (currentStep === 4) {
      console.log('Setup - Passo de horários, não salvando automaticamente');
      setCurrentStep(currentStep + 1);
      return;
    }
    
    // Update salon data only if there are changes and we have a salon (exceto horários)
    if (salon && currentStep > 0 && currentStep !== 4) {
      console.log('Setup - Verificando se há mudanças para salvar...');
      
      const hasChanges = (
        salon.name !== formData.salon_name ||
        salon.street_number !== formData.street_number ||
        salon.city !== formData.city ||
        salon.state !== formData.state ||
        salon.contact_phone !== formData.contact_phone
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

    // Validação apenas do nome do estabelecimento e serviços selecionados
    if (!formData.salon_name?.trim()) {
      toast({
        title: "Erro",
        description: "Nome do estabelecimento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validação dos serviços antes de finalizar
    if (!validateServicesBeforeFinish()) {
      return;
    }

    setIsFinishing(true);

    try {
      console.log('Setup - Finalizando configuração do estabelecimento...');
      
      // Prepare setup data - incluindo admin_setup_completed
      const setupData = {
        name: formData.salon_name,
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        contact_phone: formData.contact_phone,
        address: `${formData.street_number}, ${formData.city}, ${formData.state}`,
        opening_hours: formData.opening_hours,
        admin_setup_completed: true // Marcar que o admin completou a configuração
      };
      
      // Complete salon setup
      const setupResult = await completeSalonSetup(salon.id, setupData);

      if (!setupResult.success) {
        throw new Error(setupResult.message || 'Erro ao finalizar configuração');
      }

      console.log('Setup - Configuração do estabelecimento finalizada com sucesso');

      // Process selected services - apenas serviços com preço válido
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

      console.log('Setup - Serviços válidos para criação:', selectedServicesList);

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
        console.log('Setup - Nenhum serviço válido foi selecionado para criação');
        toast({
          title: "Aviso",
          description: "Estabelecimento configurado sem serviços. Adicione serviços na aba Serviços para começar a receber agendamentos.",
          variant: "default"
        });
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
    handleFinishSetup,
    validateCurrentStep
  };
};
