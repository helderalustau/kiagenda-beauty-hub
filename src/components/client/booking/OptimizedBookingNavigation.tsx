
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface OptimizedBookingNavigationProps {
  currentStep: number;
  isSubmitting: boolean;
  loadingServices: boolean;
  canProceedToStep2: () => boolean;
  onClose: () => void;
  onNextStep: () => void;
}

const OptimizedBookingNavigation = ({
  currentStep,
  isSubmitting,
  loadingServices,
  canProceedToStep2,
  onClose,
  onNextStep
}: OptimizedBookingNavigationProps) => {
  if (currentStep !== 1) return null;

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        disabled={isSubmitting}
        className="flex items-center"
      >
        Cancelar
      </Button>

      <Button
        disabled={!canProceedToStep2() || isSubmitting}
        onClick={onNextStep}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center"
      >
        {loadingServices ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <>
            Próximo
            <ArrowRight className="h-4 w-4 ml-2" />
          </>
        )}
      </Button>
    </div>
  );
};

export default OptimizedBookingNavigation;
