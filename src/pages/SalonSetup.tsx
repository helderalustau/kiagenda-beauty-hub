
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { setupSteps } from '@/components/salon-setup/SetupSteps';
import ProgressIndicator from '@/components/salon-setup/ProgressIndicator';
import BasicInfoStep from '@/components/salon-setup/BasicInfoStep';
import AddressStep from '@/components/salon-setup/AddressStep';
import ContactStep from '@/components/salon-setup/ContactStep';
import HoursStep from '@/components/salon-setup/HoursStep';
import ServicesStep from '@/components/salon-setup/ServicesStep';
import NavigationButtons from '@/components/salon-setup/NavigationButtons';

const SalonSetup = () => {
  const { 
    salon, 
    presetServices, 
    fetchPresetServices,
    completeSalonSetup, 
    createServicesFromPresets,
    loading 
  } = useSupabaseData();
  
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    street_number: '',
    city: '',
    state: '',
    contact_phone: '',
    opening_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    }
  });
  
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: { selected: boolean; price: number } }>({});

  useEffect(() => {
    fetchPresetServices();
  }, []);

  useEffect(() => {
    if (salon) {
      setFormData(prev => ({
        ...prev,
        street_number: salon.street_number || '',
        city: salon.city || '',
        state: salon.state || '',
        contact_phone: salon.contact_phone || '',
        opening_hours: salon.opening_hours || prev.opening_hours
      }));
    }
  }, [salon]);

  const handleNext = () => {
    if (currentStep < setupSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const handleFinishSetup = async () => {
    if (!salon) return;

    const setupResult = await completeSalonSetup(salon.id, formData);
    
    if (!setupResult.success) {
      toast({
        title: "Erro",
        description: setupResult.message,
        variant: "destructive"
      });
      return;
    }

    const servicesToCreate = Object.entries(selectedServices)
      .filter(([_, data]) => data.selected && data.price > 0)
      .map(([presetId, data]) => ({ presetId, price: data.price }));

    if (servicesToCreate.length > 0) {
      const servicesResult = await createServicesFromPresets(salon.id, servicesToCreate);
      
      if (!servicesResult.success) {
        toast({
          title: "Aviso",
          description: "Configuração salva, mas houve erro ao criar alguns serviços",
          variant: "destructive"
        });
      }
    }

    toast({
      title: "Sucesso",
      description: "Configuração do estabelecimento finalizada!"
    });

    // Redirecionar para o Dashboard do Administrador
    window.location.href = '/admin-dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep salon={salon} />;
      case 1:
        return <AddressStep formData={formData} setFormData={setFormData} />;
      case 2:
        return <ContactStep formData={formData} setFormData={setFormData} />;
      case 3:
        return <HoursStep formData={formData} setFormData={setFormData} />;
      case 4:
        return (
          <ServicesStep
            presetServices={presetServices}
            selectedServices={selectedServices}
            onServiceToggle={handleServiceToggle}
            onServicePriceChange={handleServicePriceChange}
          />
        );
      default:
        return null;
    }
  };

  // Store the icon component in a variable before using it in JSX
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
              {renderCurrentStep()}

              <NavigationButtons
                currentStep={currentStep}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onFinish={handleFinishSetup}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalonSetup;
