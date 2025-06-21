
import React from 'react';
import { cn } from "@/lib/utils";

interface BookingProgressIndicatorProps {
  currentStep: number;
}

const BookingProgressIndicator = ({ currentStep }: BookingProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep >= step 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-600"
            )}>
              {step}
            </div>
            {step < 3 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                currentStep > step ? "bg-blue-600" : "bg-gray-200"
              )} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingProgressIndicator;
