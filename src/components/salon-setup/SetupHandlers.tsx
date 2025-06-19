
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
  const handleNext = async () => {
    console.log('Navegando para próximo passo...');
    
    // Validate current step
    switch (currentStep) {
      case 1: // Basic Salon Info
        if (!formData.salon_name.trim()) {
          toast({
            title: "Erro",
            description: "Nome do estabelecimento é obrigatório",
            variant: "destructive"
          });
          return;
        }
        if (!formData.category_id) {
          toast({
            title: "Erro",
            description: "Categoria é obrigatória",
            variant: "destructive"
          });
          return;
        }
        break;
        
      case 2: // Address
        if (!formData.street_number.trim() || !formData.city.trim() || !formData.state.trim()) {
          toast({
            title: "Erro",
            description: "Todos os campos de endereço são obrigatórios",
            variant: "destructive"
          });
          return;
        }
        break;
        
      case 3: // Contact
        if (!formData.contact_phone.trim()) {
          toast({
            title: "Erro",
            description: "Telefone de contato é obrigatório",
            variant: "destructive"
          });
          return;
        }
        break;
    }
    
    // Update salon data for the current step
    if (salon && currentStep > 0) {
      console.log('Atualizando dados do estabelecimento...');
      const updateResult = await updateSalon({
        id: salon.id,
        name: formData.salon_name,
        category_id: formData.category_id,
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        contact_phone: formData.contact_phone,
        opening_hours: formData.opening_hours
      });
      
      if (!updateResult.success) {
        toast({
          title: "Erro",
          description: "Erro ao salvar dados: " + updateResult.message,
          variant: "destructive"
        });
        return;
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
      console.log('Finalizando configuração...');
      
      // First, complete the salon setup
      const setupResult = await completeSalonSetup(salon.id, {
        name: formData.salon_name,
        category_id: formData.category_id,
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        contact_phone: formData.contact_phone,
        address: `${formData.street_number}, ${formData.city}, ${formData.state}`,
        opening_hours: formData.opening_hours
      });

      if (!setupResult.success) {
        throw new Error(setupResult.message || 'Erro ao finalizar configuração');
      }

      // Then create services from selected presets
      const selectedServicesList = Object.entries(selectedServices)
        .filter(([_, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return service.selected;
        })
        .map(([serviceId, serviceData]) => {
          const service = serviceData as { selected: boolean; price: number };
          return {
            preset_service_id: serviceId,
            price: service.price
          };
        });

      if (selectedServicesList.length > 0) {
        console.log('Criando serviços...', selectedServicesList);
        const servicesResult = await createServicesFromPresets(salon.id, selectedServicesList);
        
        if (!servicesResult.success) {
          console.warn('Erro ao criar serviços:', servicesResult.message);
          // Don't fail the entire process if services creation fails
        }
      }

      toast({
        title: "Sucesso!",
        description: "Configuração do estabelecimento finalizada com sucesso!"
      });

      // Redirect to admin dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 2000);

    } catch (error) {
      console.error('Erro ao finalizar configuração:', error);
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
