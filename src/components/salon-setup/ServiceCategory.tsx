
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Scissors } from "lucide-react";
import { ServiceItem } from './ServiceItem';

interface ServiceCategoryProps {
  category: string;
  services: any[];
  selectedServices: { [key: string]: { selected: boolean; price: number } };
  onServiceToggle: (serviceId: string) => void;
  onServicePriceChange: (serviceId: string, price: number) => void;
}

export const ServiceCategory: React.FC<ServiceCategoryProps> = ({
  category,
  services,
  selectedServices,
  onServiceToggle,
  onServicePriceChange
}) => {
  const getCategoryName = (category: string) => {
    const names: { [key: string]: string } = {
      'cortes': 'Cortes',
      'tratamentos': 'Tratamentos Capilares',
      'coloracao': 'Coloração',
      'escova_penteado': 'Escova e Penteados',
      'estetica': 'Estética',
      'manicure_pedicure': 'Manicure e Pedicure',
      'personalizado': 'Serviços Personalizados'
    };
    return names[category] || category;
  };

  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
        <span>{getCategoryName(category)}</span>
        <Badge variant="outline" className="text-xs">
          {services.length} serviços
        </Badge>
        {category === 'personalizado' && (
          <Scissors className="h-4 w-4 text-blue-600" />
        )}
      </h4>
      <div className="grid md:grid-cols-2 gap-3">
        {services.map((service) => {
          const isSelected = selectedServices[service.id]?.selected || false;
          const currentPrice = selectedServices[service.id]?.price || '';
          
          return (
            <ServiceItem
              key={service.id}
              service={service}
              isSelected={isSelected}
              currentPrice={currentPrice}
              onServiceToggle={onServiceToggle}
              onServicePriceChange={onServicePriceChange}
              isCustomService={category === 'personalizado'}
            />
          );
        })}
      </div>
    </div>
  );
};
