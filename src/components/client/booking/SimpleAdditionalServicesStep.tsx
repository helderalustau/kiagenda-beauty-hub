
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Plus, X, Clock, DollarSign, Loader2, Scissors } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';

interface SimpleAdditionalServicesStepProps {
  services: Service[];
  selectedService: Service | null;
  selectedAdditionalServices: Service[];
  loadingServices: boolean;
  onAdditionalServiceToggle: (service: Service) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const SimpleAdditionalServicesStep = ({
  services,
  selectedService,
  selectedAdditionalServices,
  loadingServices,
  onAdditionalServiceToggle,
  onNext,
  onBack,
  onSkip
}: SimpleAdditionalServicesStepProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  console.log('SimpleAdditionalServicesStep - Props:', { 
    servicesCount: services?.length || 0, 
    loadingServices, 
    selectedService: selectedService?.name || 'none',
    selectedAdditionalServices: selectedAdditionalServices.length,
    allServices: services
  });

  // Filter services excluding the main selected service and only active ones
  const availableAdditionalServices = services.filter(service => 
    service.active === true && service.id !== selectedService?.id
  );

  console.log('Available additional services:', availableAdditionalServices.length);

  if (loadingServices) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando serviços adicionais...</p>
      </div>
    );
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedAdditionalServices.some(s => s.id === serviceId);
  };

  const totalAdditionalPrice = selectedAdditionalServices.reduce((total, service) => total + service.price, 0);
  const totalTime = selectedAdditionalServices.reduce((total, service) => total + service.duration_minutes, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Badge variant="outline" className="text-sm">
          Passo 2 de 4
        </Badge>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-center mb-2">Serviços Adicionais</h3>
        <p className="text-gray-600 text-center mb-2">
          Deseja adicionar algum serviço extra? (Opcional)
        </p>
        <p className="text-sm text-blue-600 text-center">
          Você pode pular esta etapa se não desejar serviços adicionais
        </p>
      </div>

      {/* Serviço Principal Selecionado */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-blue-900">Serviço Principal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">{selectedService?.name}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center text-green-600">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">{formatCurrency(selectedService?.price || 0)}</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{selectedService?.duration_minutes} min</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {availableAdditionalServices.length === 0 ? (
        <div className="text-center py-8">
          <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço adicional disponível</h3>
          <p className="text-gray-600">Não há outros serviços ativos para adicionar.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {availableAdditionalServices.map((service) => {
            const isSelected = isServiceSelected(service.id);
            
            return (
              <Card
                key={service.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-green-500 bg-green-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onAdditionalServiceToggle(service)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{service.name}</span>
                    {isSelected ? (
                      <Badge className="bg-green-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        Remover
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center">
                        <Plus className="h-3 w-3 mr-1" />
                        Adicionar
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-green-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span className="font-semibold">{formatCurrency(service.price)}</span>
                      </div>
                      <div className="flex items-center text-blue-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                    </div>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-3">
                      {service.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resumo dos Serviços Adicionais Selecionados */}
      {selectedAdditionalServices.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <h4 className="font-semibold text-green-900 mb-3">
                {selectedAdditionalServices.length} Serviço(s) Adicional(is)
              </h4>
              <div className="space-y-2 text-sm">
                {selectedAdditionalServices.map((service) => (
                  <div key={service.id} className="flex justify-between text-green-800">
                    <span>{service.name}</span>
                    <span>{formatCurrency(service.price)}</span>
                  </div>
                ))}
                <div className="border-t border-green-200 pt-2 flex justify-between font-semibold">
                  <span className="text-green-700">Total Adicional:</span>
                  <span className="text-green-900">{formatCurrency(totalAdditionalPrice)}</span>
                </div>
                <div className="flex justify-between text-green-700">
                  <span>Tempo Adicional:</span>
                  <span>{totalTime} minutos</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onSkip}
          className="flex-1"
        >
          Pular
        </Button>
        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center flex-1"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleAdditionalServicesStep;
