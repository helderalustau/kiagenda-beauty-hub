
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Info, Clock, FileText, Plus } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Selecione os Serviços</h3>
        <p className="text-gray-600 mb-4">
          Escolha os serviços que você oferece e defina apenas os <strong>preços</strong>. 
          Esta é uma configuração inicial básica.
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
            {services.map((service) => (
              <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <Checkbox
                  checked={selectedServices[service.id]?.selected || false}
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
                {selectedServices[service.id]?.selected && (
                  <div className="w-20 flex-shrink-0">
                    <Input
                      type="number"
                      placeholder="R$"
                      value={selectedServices[service.id]?.price || ''}
                      onChange={(e) => onServicePriceChange(service.id, Number(e.target.value))}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Resumo da seleção */}
      {Object.values(selectedServices).some(service => service.selected) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <h4 className="font-medium text-green-900">Resumo da Seleção</h4>
          </div>
          <p className="text-sm text-green-800">
            <strong>{Object.values(selectedServices).filter(service => service.selected && service.price > 0).length}</strong> serviços 
            selecionados com preços definidos
          </p>
        </div>
      )}
    </div>
  );
};

export default ServicesStep;
