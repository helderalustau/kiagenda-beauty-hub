
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, FileText, Plus, AlertCircle } from "lucide-react";
import { PresetService } from '@/hooks/useSupabaseData';

interface ServicesStepProps {
  presetServices: PresetService[];
  selectedServices: { [key: string]: { selected: boolean; price: number } };
  onServiceToggle: (serviceId: string) => void;
  onServicePriceChange: (serviceId: string, price: number) => void;
}

const ServicesStep = ({ 
  presetServices, 
  selectedServices, 
  onServiceToggle, 
  onServicePriceChange 
}: ServicesStepProps) => {
  const groupedServices = presetServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, PresetService[]>);

  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      'cortes': 'Cortes',
      'tratamentos': 'Tratamentos Capilares',
      'coloracao': 'Coloração',
      'escova_penteado': 'Escova e Penteados',
      'estetica': 'Estética',
      'manicure_pedicure': 'Manicure e Pedicure'
    };
    return names[category] || category;
  };

  // Validar se todos os serviços selecionados têm preço
  const getValidSelectedServices = () => {
    return Object.entries(selectedServices).filter(([_, serviceData]) => {
      const service = serviceData as { selected: boolean; price: number };
      return service.selected && service.price > 0;
    });
  };

  const validSelectedServices = getValidSelectedServices();
  const selectedWithoutPrice = Object.entries(selectedServices).filter(([_, serviceData]) => {
    const service = serviceData as { selected: boolean; price: number };
    return service.selected && (!service.price || service.price <= 0);
  });

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecione os Serviços</h3>
        <p className="text-gray-600 mb-4">
          Escolha os serviços que você oferece e defina os <strong>preços</strong>. 
          O preço é obrigatório para cada serviço selecionado.
        </p>
        
        {/* Informações sobre edições futuras */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="font-medium text-blue-900">Você poderá editar depois:</h4>
              <div className="grid md:grid-cols-3 gap-3 text-sm text-blue-800">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Tempo de duração</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Descrições detalhadas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Novos serviços</span>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Após finalizar esta configuração, você terá acesso completo ao gerenciamento de serviços.
              </p>
            </div>
          </div>
        </div>

        {/* Alerta para serviços sem preço */}
        {selectedWithoutPrice.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Atenção: Preços obrigatórios</h4>
                <p className="text-sm text-red-800 mb-2">
                  Os seguintes serviços estão selecionados mas não possuem preço definido:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {selectedWithoutPrice.map(([serviceId]) => {
                    const service = presetServices.find(s => s.id === serviceId);
                    return service ? (
                      <li key={serviceId}>{service.name}</li>
                    ) : null;
                  })}
                </ul>
                <p className="text-sm text-red-800 mt-2">
                  <strong>Defina um preço para cada serviço selecionado antes de continuar.</strong>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {Object.entries(groupedServices).map(([category, services]) => (
        <div key={category} className="border rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <span>{getCategoryName(category)}</span>
            <Badge variant="outline" className="text-xs">
              {services.length} serviços
            </Badge>
          </h4>
          <div className="grid md:grid-cols-2 gap-3">
            {services.map((service) => {
              const isSelected = selectedServices[service.id]?.selected || false;
              const currentPrice = selectedServices[service.id]?.price || '';
              // Fix: Convert to number for comparison
              const numericPrice = typeof currentPrice === 'string' ? parseFloat(currentPrice) || 0 : currentPrice;
              const hasValidPrice = isSelected && numericPrice > 0;
              
              return (
                <div key={service.id} className={`flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                  isSelected && !hasValidPrice ? 'border-red-300 bg-red-50' : ''
                }`}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onServiceToggle(service.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-500 flex items-center space-x-2">
                      <span className="truncate">{service.description}</span>
                      <span className="flex items-center space-x-1 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        <span>{service.default_duration_minutes} min</span>
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-24 flex-shrink-0">
                      <Input
                        type="number"
                        placeholder="R$ 0,00"
                        value={currentPrice}
                        onChange={(e) => onServicePriceChange(service.id, Number(e.target.value))}
                        className={`text-sm h-8 ${!hasValidPrice ? 'border-red-300' : ''}`}
                        min="0.01"
                        step="0.01"
                        required
                      />
                      {isSelected && !hasValidPrice && (
                        <p className="text-xs text-red-600 mt-1">Preço obrigatório</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Resumo da seleção */}
      <div className={`border rounded-lg p-4 ${
        validSelectedServices.length > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          <div className={`h-2 w-2 rounded-full ${
            validSelectedServices.length > 0 ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <h4 className={`font-medium ${
            validSelectedServices.length > 0 ? 'text-green-900' : 'text-gray-700'
          }`}>Resumo da Seleção</h4>
        </div>
        <p className={`text-sm ${
          validSelectedServices.length > 0 ? 'text-green-800' : 'text-gray-600'
        }`}>
          <strong>{validSelectedServices.length}</strong> serviços selecionados com preços definidos
          {selectedWithoutPrice.length > 0 && (
            <span className="text-red-600 ml-2">
              • <strong>{selectedWithoutPrice.length}</strong> serviços precisam de preço
            </span>
          )}
        </p>
        {validSelectedServices.length === 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Selecione pelo menos um serviço com preço para continuar
          </p>
        )}
      </div>
    </div>
  );
};

export default ServicesStep;
