
import React from 'react';

interface SimpleBookingProgressIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

const SimpleBookingProgressIndicator = ({ currentStep, totalSteps = 3 }: SimpleBookingProgressIndicatorProps) => {
  return (
    <div className="flex justify-center space-x-2">
      {Array.from({ length: totalSteps }, (_, index) => {
        const step = index + 1;
        return (
          <div
            key={step}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? 'bg-blue-600 text-white'
                : step < currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
        );
      })}
    </div>
  );
};

export default SimpleBookingProgressIndicator;
