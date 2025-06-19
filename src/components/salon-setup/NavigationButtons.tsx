
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { setupSteps } from './SetupSteps';

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
  isFinishing?: boolean;
}

const NavigationButtons = ({ currentStep, onPrevious, onNext, onFinish, isFinishing = false }: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isFinishing}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>

      {currentStep < setupSteps.length - 1 ? (
        <Button onClick={onNext} disabled={isFinishing}>
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onFinish} disabled={isFinishing}>
          {isFinishing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Finalizando...
            </>
          ) : (
            <>
              Finalizar Configuração
              <CheckCircle className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
