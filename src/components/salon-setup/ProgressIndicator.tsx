
import React from 'react';
import { Progress } from "@/components/ui/progress";
import { setupSteps } from './SetupSteps';

interface ProgressIndicatorProps {
  currentStep: number;
}

const ProgressIndicator = ({ currentStep }: ProgressIndicatorProps) => {
  const progress = ((currentStep + 1) / setupSteps.length) * 100;

  return (
    <div className="mb-8">
      <Progress value={progress} className="mb-4" />
      <div className="flex justify-between">
        {setupSteps.map((step, index) => (
          <div key={index} className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`rounded-full p-2 mb-2 ${index <= currentStep ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <step.icon className="h-5 w-5" />
            </div>
            <span className="text-xs text-center">{step.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
