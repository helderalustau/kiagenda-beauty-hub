
import { setupSteps } from './SetupSteps';

interface SetupHandlersProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: any;
  salon: any;
  updateSalon: any;
  toast: any;
  completeSalonSetup: any;
  createServicesFromPresets: any;
  selectedServices: any;
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
    if (currentStep === 1) {
      if (!formData.salon_name?.trim()) {
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

      if (salon) {
        const updateResult = await updateSalon({
          id: salon.id,
          name: formData.salon_name,
          category_id: formData.category_id
        });

        if (!updateResult.success) {
          toast({
            title: "Erro",
            description: "Erro ao atualizar informações do estabelecimento",
            variant: "destructive"
          });
          return;
        }
      }
    }

    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishSetup = async () => {
    if (!salon) {
      console.error('Salon não encontrado no state!');
      toast({
        title: "Erro",
        description: "Dados do estabelecimento não encontrados. Por favor, tente novamente.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsFinishing(true);
      console.log('Iniciando finalização da configuração...');

      if (!formData.street_number?.trim()) {
        toast({
          title: "Erro",
          description: "Nome da Rua e Número é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (!formData.city?.trim()) {
        toast({
          title: "Erro",
          description: "Cidade é obrigatória",
          variant: "destructive"
        });
        return;
      }

      if (!formData.state?.trim()) {
        toast({
          title: "Erro",
          description: "Estado é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (!formData.contact_phone?.trim()) {
        toast({
          title: "Erro",
          description: "Telefone para contato é obrigatório",
          variant: "destructive"
        });
        return;
      }

      const setupData = {
        street_number: formData.street_number,
        city: formData.city,
        state: formData.state,
        contact_phone: formData.contact_phone,
        opening_hours: formData.opening_hours,
        address: `${formData.street_number}, ${formData.city}, ${formData.state}`
      };

      const setupResult = await completeSalonSetup(salon.id, setupData);
      
      if (!setupResult.success) {
        toast({
          title: "Erro",
          description: setupResult.message || "Erro ao finalizar configuração",
          variant: "destructive"
        });
        return;
      }

      const servicesToCreate = Object.entries(selectedServices)
        .filter(([_, data]) => data.selected && data.price > 0)
        .map(([presetId, data]) => ({ presetId, price: data.price }));

      if (servicesToCreate.length > 0) {
        const servicesResult = await createServicesFromPresets(salon.id, servicesToCreate);
        
        if (!servicesResult.success) {
          toast({
            title: "Aviso",
            description: "Configuração salva, mas houve erro ao criar alguns serviços",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Sucesso",
        description: "Configuração do estabelecimento finalizada com sucesso!"
      });

      setTimeout(() => {
        window.location.href = '/admin-dashboard';
      }, 1000);

    } catch (error) {
      console.error('Erro ao finalizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao finalizar configuração",
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
