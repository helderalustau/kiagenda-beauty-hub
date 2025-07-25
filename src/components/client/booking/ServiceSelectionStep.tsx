
import React from 'react';
import { Scissors, Loader2 } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';
import ServiceCard from '../ServiceCard';

interface ServiceSelectionStepProps {
  services: Service[];
  loadingServices: boolean;
  selectedService: Service | null;
  onServiceSelect: (service: Service) => void;
}

const ServiceSelectionStep = ({ 
  services, 
  loadingServices, 
  selectedService, 
  onServiceSelect 
}: ServiceSelectionStepProps) => {
  console.log('ServiceSelectionStep - Rendering with props:', { 
    servicesCount: services?.length || 0, 
    loadingServices, 
    selectedService: selectedService?.name || 'none',
    allServices: services
  });

  // Filter only active services for client selection
  const activeServices = services.filter(service => {
    const isActive = service.active === true;
    console.log('Service filter check:', { 
      name: service.name, 
      active: service.active, 
      isActive,
      price: service.price 
    });
    return isActive;
  });

  console.log('Active services for client:', activeServices);

  if (loadingServices) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Carregando serviços disponíveis...</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-8">
        <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
        <p className="text-gray-600">Este estabelecimento ainda não possui serviços cadastrados.</p>
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-8">
        <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum serviço disponível</h3>
        <p className="text-gray-600">Este estabelecimento não possui serviços ativos no momento.</p>
        <p className="text-sm text-gray-500 mt-2">
          Total de serviços: {services.length} | Ativos: {activeServices.length}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Escolha um Serviço</h3>
        <p className="text-gray-600">Selecione o serviço que deseja agendar</p>
        <p className="text-sm text-blue-600 mt-1">
          {activeServices.length} serviços disponíveis
        </p>
      </div>
      
      <div className="grid gap-3 max-h-96 overflow-y-auto">
        {activeServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onSelect={onServiceSelect}
            isSelected={selectedService?.id === service.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceSelectionStep;
