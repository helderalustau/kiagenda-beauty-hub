
import React from 'react';

interface ServicesSelectionSummaryProps {
  selectedServices: { [key: string]: { selected: boolean; price: number } };
}

export const ServicesSelectionSummary: React.FC<ServicesSelectionSummaryProps> = ({
  selectedServices
}) => {
  // Get valid selected services (with price > 0)
  const getValidSelectedServices = () => {
    return Object.entries(selectedServices).filter(([_, serviceData]) => {
      const service = serviceData as { selected: boolean; price: number };
      return service.selected && service.price > 0;
    });
  };

  // Get services without valid price
  const getServicesWithoutPrice = () => {
    return Object.entries(selectedServices).filter(([_, serviceData]) => {
      const service = serviceData as { selected: boolean; price: number };
      return service.selected && (!service.price || service.price <= 0);
    });
  };

  const validSelectedServices = getValidSelectedServices();
  const servicesWithoutPrice = getServicesWithoutPrice();

  return (
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
        {servicesWithoutPrice.length > 0 && (
          <span className="text-amber-600 ml-2">
            • <strong>{servicesWithoutPrice.length}</strong> serviços precisam de preço
          </span>
        )}
      </p>
      {validSelectedServices.length === 0 && servicesWithoutPrice.length === 0 && (
        <p className="text-xs text-gray-500 mt-1">
          Nenhum serviço selecionado. Você pode adicionar serviços depois na aba Serviços.
        </p>
      )}
    </div>
  );
};
