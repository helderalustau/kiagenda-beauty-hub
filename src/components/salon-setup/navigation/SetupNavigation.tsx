
import { useSetupValidation } from '../validation/SetupValidation';

interface SetupNavigationProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: any;
  salon: any;
  updateSalon: (data: any) => Promise<any>;
  toast: any;
  selectedServices: any;
}

export const useSetupNavigation = ({
  currentStep,
  setCurrentStep,
  formData,
  salon,
  updateSalon,
  toast,
  selectedServices
}: SetupNavigationProps) => {
  const { validateCurrentStep } = useSetupValidation();

  const handleNext = async () => {
    console.log('Setup - Navegando para próximo passo...');
    
    // Validate current step
    if (!validateCurrentStep(currentStep, formData, selectedServices, toast)) {
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

  return {
    handleNext,
    handlePrevious
  };
};
