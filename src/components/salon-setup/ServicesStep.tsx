
import React from 'react';
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
                  onCheckedChange={() => onServiceToggle(service.id)}
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
                      onChange={(e) => onServicePriceChange(service.id, Number(e.target.value))}
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
  );
};

export default ServicesStep;
