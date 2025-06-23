
export const useSetupValidation = () => {
  const validateCurrentStep = (currentStep: number, formData: any, selectedServices: any, toast: any) => {
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

  const validateServicesBeforeFinish = (selectedServices: any, toast: any) => {
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

  return {
    validateCurrentStep,
    validateServicesBeforeFinish
  };
};
