
import { useSetupNavigation } from './navigation/SetupNavigation';
import { useSetupCompletion } from './completion/SetupCompletion';
import { useSetupValidation } from './validation/SetupValidation';

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
  
  const { validateCurrentStep } = useSetupValidation();
  
  const { handleNext, handlePrevious } = useSetupNavigation({
    currentStep,
    setCurrentStep,
    formData,
    salon,
    updateSalon,
    toast,
    selectedServices
  });

  const { handleFinishSetup } = useSetupCompletion({
    salon,
    formData,
    selectedServices,
    completeSalonSetup,
    createServicesFromPresets,
    setIsFinishing,
    toast
  });

  return {
    handleNext,
    handlePrevious,
    handleFinishSetup,
    validateCurrentStep: (step: number, data: any, services: any, toastFn: any) => 
      validateCurrentStep(step, data, services, toastFn)
  };
};
