
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Clock, MapPin, Phone, Store, CheckCircle } from "lucide-react";
import { useSupabaseData, PresetService } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

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
  
  const steps = [
    { title: 'Informações Básicas', icon: Store },
    { title: 'Endereço', icon: MapPin },
    { title: 'Contato', icon: Phone },
    { title: 'Horários', icon: Clock },
    { title: 'Serviços', icon: CheckCircle }
  ];

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
    if (currentStep < steps.length - 1) {
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

    // Finalizar configuração do salão
    const setupResult = await completeSalonSetup(salon.id, formData);
    
    if (!setupResult.success) {
      toast({
        title: "Erro",
        description: setupResult.message,
        variant: "destructive"
      });
      return;
    }

    // Criar serviços selecionados
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

    // Redirecionar para dashboard do admin
    window.location.href = '/admin-dashboard';
  };

  const groupedServices = presetServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, PresetService[]>);

  const getCategoryName = (category: string) => {
    const names = {
      'cortes': 'Cortes',
      'tratamentos': 'Tratamentos Capilares',
      'coloracao': 'Coloração',
      'escova_penteado': 'Escova e Penteados',
      'estetica': 'Estética',
      'manicure_pedicure': 'Manicure e Pedicure'
    };
    return names[category as keyof typeof names] || category;
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuração do Estabelecimento
            </h1>
            <p className="text-gray-600">
              Complete as informações do seu estabelecimento para começar a usar o sistema
            </p>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="mb-4" />
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full p-2 mb-2 ${index <= currentStep ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <steps[currentStep].icon className="h-6 w-6" />
                <span>{steps[currentStep].title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      Bem-vindo, {salon?.owner_name}!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Vamos configurar o seu estabelecimento "{salon?.name}" passo a passo.
                      Isso levará apenas alguns minutos.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-700">
                        Essas informações são importantes para que seus clientes possam 
                        encontrar e agendar serviços no seu estabelecimento.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street_number">Número da Rua</Label>
                    <Input
                      id="street_number"
                      value={formData.street_number}
                      onChange={(e) => setFormData({...formData, street_number: e.target.value})}
                      placeholder="Ex: 123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="Ex: São Paulo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({...formData, state: e.target.value})}
                      placeholder="Ex: SP"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contact_phone">Telefone para Contato</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Este telefone será exibido para os clientes entrarem em contato
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
                  {Object.entries(formData.opening_hours).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <div className="w-20">
                        <span className="font-medium capitalize">
                          {day === 'monday' ? 'Segunda' :
                           day === 'tuesday' ? 'Terça' :
                           day === 'wednesday' ? 'Quarta' :
                           day === 'thursday' ? 'Quinta' :
                           day === 'friday' ? 'Sexta' :
                           day === 'saturday' ? 'Sábado' : 'Domingo'}
                        </span>
                      </div>
                      <Checkbox
                        checked={!hours.closed}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            opening_hours: {
                              ...formData.opening_hours,
                              [day]: { ...hours, closed: !checked }
                            }
                          });
                        }}
                      />
                      <span className="text-sm">Aberto</span>
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                opening_hours: {
                                  ...formData.opening_hours,
                                  [day]: { ...hours, open: e.target.value }
                                }
                              });
                            }}
                            className="w-32"
                          />
                          <span>às</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                opening_hours: {
                                  ...formData.opening_hours,
                                  [day]: { ...hours, close: e.target.value }
                                }
                              });
                            }}
                            className="w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Selecione os Serviços</h3>
                    <p className="text-gray-600 mb-6">
                      Escolha os serviços que você oferece e defina os preços. 
                      Você pode adicionar mais serviços depois.
                    </p>
                  </div>

                  {Object.entries(groupedServices).map(([category, services]) => (
                    <div key={category} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {getCategoryName(category)}
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {services.map((service) => (
                          <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              checked={selectedServices[service.id]?.selected || false}
                              onCheckedChange={() => handleServiceToggle(service.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">{service.name}</div>
                              <div className="text-sm text-gray-500">
                                {service.description} • {service.default_duration_minutes} min
                              </div>
                            </div>
                            {selectedServices[service.id]?.selected && (
                              <div className="w-24">
                                <Input
                                  type="number"
                                  placeholder="Preço"
                                  value={selectedServices[service.id]?.price || ''}
                                  onChange={(e) => handleServicePriceChange(service.id, Number(e.target.value))}
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext}>
                    Próximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleFinishSetup}>
                    Finalizar Configuração
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalonSetup;
