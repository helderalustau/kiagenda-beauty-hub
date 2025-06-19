
import React from 'react';
import { setupSteps } from './SetupSteps';

interface StepNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onFinish: () => void;
  isFinishing: boolean;
}

export const StepNavigation = ({ 
  currentStep, 
  onNext, 
  onPrevious, 
  onFinish, 
  isFinishing 
}: StepNavigationProps) => {
  const handleNext = async () => {
    if (currentStep < setupSteps.length - 1) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onPrevious();
    }
  };

  const handleFinish = () => {
    onFinish();
  };

  return { handleNext, handlePrevious, handleFinish };
};
