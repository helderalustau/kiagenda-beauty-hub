
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';
import ServiceCard from '../ServiceCard';

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
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Escolha um Serviço</h3>
        <p className="text-gray-600">Selecione o serviço desejado</p>
      </div>

      {loadingServices ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando serviços...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Nenhum serviço disponível</p>
        </div>
      ) : (
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={onServiceSelect}
              isSelected={selectedService?.id === service.id}
            />
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={!selectedService}
          onClick={onNext}
          className="flex items-center"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleServiceSelectionStep;
