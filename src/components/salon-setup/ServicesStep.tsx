
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Scissors, Clock, DollarSign } from "lucide-react";
import { PresetService } from '@/hooks/useSupabaseData';

interface ServicesStepProps {
  presetServices: PresetService[];
  selectedServices: { [key: string]: { selected: boolean; price: number } };
  onServiceToggle: (serviceId: string) => void;
  onServicePriceChange: (serviceId: string, price: number) => void;
  salonId?: string;
}

const ServicesStep = ({
  presetServices,
  selectedServices,
  onServiceToggle,
  onServicePriceChange
}: ServicesStepProps) => {
  console.log('ServicesStep - Props:', { presetServices, selectedServices });

  if (!presetServices || presetServices.length === 0) {
    return (
      <div className="text-center py-8">
        <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Carregando serviços disponíveis...</p>
      </div>
    );
  }

  // Agrupar serviços por categoria com tipagem correta
  const servicesByCategory = presetServices.reduce<Record<string, PresetService[]>>((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {});

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSelectedCount = () => {
    return Object.values(selectedServices).filter(service => service.selected).length;
  };

  const getTotalValue = () => {
    return Object.values(selectedServices)
      .filter(service => service.selected)
      .reduce((total, service) => total + (service.price || 0), 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Escolha os Serviços do seu Estabelecimento
        </h3>
        <p className="text-gray-600 mb-4">
          Selecione os serviços que você oferece e defina os preços
        </p>
        
        {getSelectedCount() > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                <strong>{getSelectedCount()}</strong> serviços selecionados
              </span>
              <span className="text-blue-700 font-semibold">
                Valor total: {formatCurrency(getTotalValue())}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {Object.entries(servicesByCategory).map(([category, services]) => (
          <Card key={category} className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Scissors className="h-5 w-5 mr-2 text-blue-600" />
                {category}
                <Badge variant="secondary" className="ml-2">
                  {services.length} serviços
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {services.map((service) => {
                  const isSelected = selectedServices[service.id]?.selected || false;
                  const currentPrice = selectedServices[service.id]?.price || 0;
                  
                  return (
                    <div
                      key={service.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isSelected 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={service.id}
                          checked={isSelected}
                          onCheckedChange={() => onServiceToggle(service.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <Label
                              htmlFor={service.id}
                              className="text-base font-medium text-gray-900 cursor-pointer"
                            >
                              {service.name}
                            </Label>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.default_duration_minutes} min
                            </div>
                          </div>
                          
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {service.description}
                            </p>
                          )}
                          
                          {isSelected && (
                            <div className="flex items-center space-x-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <Label htmlFor={`price-${service.id}`} className="text-sm font-medium">
                                Preço:
                              </Label>
                              <Input
                                id={`price-${service.id}`}
                                type="number"
                                placeholder="0,00"
                                value={currentPrice || ''}
                                onChange={(e) => onServicePriceChange(service.id, Number(e.target.value))}
                                className="w-24 text-center"
                                min="0"
                                step="0.01"
                              />
                              <span className="text-sm text-gray-500">
                                = {formatCurrency(currentPrice || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {getSelectedCount() === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>Você pode pular esta etapa e adicionar serviços depois no painel administrativo.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesStep;
