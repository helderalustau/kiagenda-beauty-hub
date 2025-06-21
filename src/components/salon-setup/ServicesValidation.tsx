
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ServicesValidationProps {
  selectedServices: { [key: string]: { selected: boolean; price: number } };
  allServices: any[];
}

export const ServicesValidation: React.FC<ServicesValidationProps> = ({
  selectedServices,
  allServices
}) => {
  // Get services that are selected but don't have valid prices
  const getServicesWithoutPrice = () => {
    return Object.entries(selectedServices)
      .filter(([_, serviceData]) => {
        const service = serviceData as { selected: boolean; price: number };
        return service.selected && (!service.price || service.price <= 0);
      })
      .map(([serviceId, serviceData]) => ({
        serviceId,
        serviceData: serviceData as { selected: boolean; price: number }
      }));
  };

  const servicesWithoutPrice = getServicesWithoutPrice();

  if (servicesWithoutPrice.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-medium text-amber-900 mb-2">Preços necessários para serviços selecionados</h4>
          <p className="text-sm text-amber-800 mb-2">
            Os seguintes serviços estão selecionados mas não possuem preço definido:
          </p>
          <ul className="text-sm text-amber-700 list-disc list-inside">
            {servicesWithoutPrice.map(({ serviceId }) => {
              const service = allServices.find(s => s.id === serviceId);
              return service ? (
                <li key={serviceId}>{service.name}</li>
              ) : null;
            })}
          </ul>
          <p className="text-sm text-amber-800 mt-2">
            <strong>Defina um preço para cada serviço selecionado ou desmarque-os para continuar.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
