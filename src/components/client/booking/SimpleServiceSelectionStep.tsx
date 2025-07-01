
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, X, Clock, DollarSign, Loader2, Scissors } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';

interface SimpleServiceSelectionStepProps {
  services: Service[];
  selectedService: Service | null;
  loadingServices: boolean;
  onServiceSelect: (service: Service) => void;
  onNext: () => void;
  onCancel: () => void;
}

const SimpleServiceSelectionStep = ({
  services,
  selectedService,
  loadingServices,
  onServiceSelect,
  onNext,
  onCancel
}: SimpleServiceSelectionStepProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  console.log('SimpleServiceSelectionStep - Props:', { 
    servicesCount: services?.length || 0, 
    loadingServices, 
    selectedService: selectedService?.name || 'none',
    allServices: services
  });

  // Filter only active services
  const activeServices = services.filter(service => service.active === true);
  console.log('SimpleServiceSelectionStep - Active services:', activeServices.length);

  if (loadingServices) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando serviços disponíveis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex items-center"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        <Badge variant="outline" className="text-sm">
          Passo 1 de 3
        </Badge>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-center mb-2">Escolha o Serviço</h3>
        <p className="text-gray-600 text-center mb-6">
          Selecione o serviço que deseja agendar
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-8">
          <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
          <p className="text-gray-600">Este estabelecimento ainda não possui serviços cadastrados.</p>
        </div>
      ) : activeServices.length === 0 ? (
        <div className="text-center py-8">
          <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço disponível</h3>
          <p className="text-gray-600">Este estabelecimento não possui serviços ativos no momento.</p>
          <p className="text-sm text-gray-500 mt-2">
            Total: {services.length} serviços | Ativos: {activeServices.length}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {activeServices.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedService?.id === service.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onServiceSelect(service)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{service.name}</span>
                  {selectedService?.id === service.id && (
                    <Badge className="bg-blue-600">
                      Selecionado
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
          ))}
        </div>
      )}

      {selectedService && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <h4 className="font-semibold text-green-900 mb-2">Serviço Selecionado</h4>
              <p className="text-green-800">
                <strong>{selectedService.name}</strong> - {formatCurrency(selectedService.price)}
              </p>
              <p className="text-sm text-green-700">
                Duração: {selectedService.duration_minutes} minutos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button
          disabled={!selectedService}
          onClick={onNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center px-8"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleServiceSelectionStep;
