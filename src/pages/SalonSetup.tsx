
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { setupSteps } from '@/components/salon-setup/SetupSteps';
import ProgressIndicator from '@/components/salon-setup/ProgressIndicator';
import NavigationButtons from '@/components/salon-setup/NavigationButtons';
import { StepRenderer } from '@/components/salon-setup/StepRenderer';
import { useSalonSetup } from '@/hooks/useSalonSetup';
import { useSetupHandlers } from '@/components/salon-setup/SetupHandlers';

const SalonSetup = () => {
  const {
    salon,
    presetServices,
    loading,
    currentStep,
    setCurrentStep,
    isFinishing,
    setIsFinishing,
    formData,
    updateFormData,
    selectedServices,
    setSelectedServices,
    completeSalonSetup,
    createServicesFromPresets,
    updateSalon,
    toast
  } = useSalonSetup();

  const { handleNext, handlePrevious, handleFinishSetup } = useSetupHandlers({
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
  });

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        selected: !prev[serviceId]?.selected,
        price: prev[serviceId]?.price || 0
      }
    }));
  };

  const handleServicePriceChange = (serviceId: string, price: number) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId],
        price
      }
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configuração do estabelecimento...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do estabelecimento...</p>
        </div>
      </div>
    );
  }

  const Icon = setupSteps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Configuração do Estabelecimento
            </h1>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              Complete as informações do seu estabelecimento para começar a usar o sistema
            </p>
          </div>

          <ProgressIndicator currentStep={currentStep} />

          <Card className="mt-4 sm:mt-6">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>{setupSteps[currentStep].title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              <StepRenderer
                currentStep={currentStep}
                salon={salon}
                formData={formData}
                updateFormData={updateFormData}
                presetServices={presetServices}
                selectedServices={selectedServices}
                onServiceToggle={handleServiceToggle}
                onServicePriceChange={handleServicePriceChange}
              />

              <NavigationButtons
                currentStep={currentStep}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onFinish={handleFinishSetup}
                isFinishing={isFinishing}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalonSetup;
