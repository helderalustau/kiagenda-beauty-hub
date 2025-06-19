
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { setupSteps } from './SetupSteps';

interface NavigationButtonsProps {
  currentStep: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

const NavigationButtons = ({ currentStep, onPrevious, onNext, onFinish }: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between pt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Anterior
      </Button>

      {currentStep < setupSteps.length - 1 ? (
        <Button onClick={onNext}>
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      ) : (
        <Button onClick={onFinish}>
          Finalizar Configuração
          <CheckCircle className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
