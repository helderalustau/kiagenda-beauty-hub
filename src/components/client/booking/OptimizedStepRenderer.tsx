
import React from 'react';
import { Service, Salon } from '@/hooks/useSupabaseData';
import ServiceSelectionStep from './ServiceSelectionStep';
import OptimizedDateTimeStep from './OptimizedDateTimeStep';
import ClientDataStep from './ClientDataStep';

interface ClientData {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface OptimizedStepRendererProps {
  currentStep: number;
  services: Service[];
  loadingServices: boolean;
  selectedService: Service | null;
  selectedDate: Date | undefined;
  selectedTime: string;
  availableSlots: string[];
  slotsLoading: boolean;
  clientData: ClientData;
  salon: Salon;
  onServiceSelect: (service: Service) => void;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  onClientDataChange: (data: ClientData) => void;
  setCurrentStep: (step: number) => void;
  formatCurrency: (value: number) => string;
  handleNextStep: () => void;
  handleFormSubmit: (e: React.FormEvent) => Promise<void>;
}

const OptimizedStepRenderer = ({
  currentStep,
  services,
  loadingServices,
  selectedService,
  selectedDate,
  selectedTime,
  availableSlots,
  slotsLoading,
  clientData,
  salon,
  onServiceSelect,
  onDateSelect,
  onTimeSelect,
  onClientDataChange,
  setCurrentStep,
  formatCurrency,
  handleNextStep,
  handleFormSubmit
}: OptimizedStepRendererProps) => {
  switch (currentStep) {
    case 1:
      return (
        <ServiceSelectionStep
          services={services}
          loadingServices={loadingServices}
          selectedService={selectedService}
          onServiceSelect={onServiceSelect}
        />
      );

    case 2:
      return (
        <OptimizedDateTimeStep
          selectedService={selectedService}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          availableTimes={availableSlots}
          loading={slotsLoading}
          onDateSelect={onDateSelect}
          onTimeSelect={onTimeSelect}
          onBack={() => setCurrentStep(1)}
          formatCurrency={formatCurrency}
          onContinue={handleNextStep}
        />
      );

    case 3:
      return (
        <ClientDataStep
          salon={salon}
          selectedService={selectedService}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          clientData={clientData}
          onClientDataChange={onClientDataChange}
          onBack={() => setCurrentStep(2)}
          formatCurrency={formatCurrency}
          onSubmit={handleFormSubmit}
        />
      );

    default:
      return null;
  }
};

export default OptimizedStepRenderer;
