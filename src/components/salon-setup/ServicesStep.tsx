
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Info, Clock, FileText, Plus } from "lucide-react";
import { PresetService } from '@/hooks/useSupabaseData';
import CustomServiceModal from './CustomServiceModal';
import { ServicesValidation } from './ServicesValidation';
import { ServicesSelectionSummary } from './ServicesSelectionSummary';
import { ServiceCategory } from './ServiceCategory';

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
  onServicePriceChange,
  salonId 
}: ServicesStepProps) => {
  const [showCustomServiceModal, setShowCustomServiceModal] = useState(false);
  const [customServices, setCustomServices] = useState<any[]>([]);

  // Ensure both arrays are valid before concatenating
  const validPresetServices = Array.isArray(presetServices) ? presetServices : [];
  const validCustomServices = Array.isArray(customServices) ? customServices : [];
  const allServices = [...validPresetServices, ...validCustomServices];
  
  const groupedServices = allServices.reduce((acc: Record<string, any[]>, service) => {
    const category = service.category || 'personalizado';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {} as Record<string, any[]>);

  const handleCustomServiceCreated = (service: any) => {
    // Adicionar o serviço personalizado à lista
    setCustomServices(prev => [...prev, {
      ...service,
      category: 'personalizado',
      default_duration_minutes: service.duration_minutes
    }]);

    // Automaticamente selecionar o serviço criado com o preço definido
    onServiceToggle(service.id);
    onServicePriceChange(service.id, service.price);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Selecione os Serviços (Opcional)</h3>
          <Button
            onClick={() => setShowCustomServiceModal(true)}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Serviço</span>
          </Button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Escolha os serviços que você oferece. Se selecionar um serviço, o <strong>preço é obrigatório</strong>. 
          Você pode pular esta etapa e adicionar serviços depois.
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
        <ServicesValidation 
          selectedServices={selectedServices}
          allServices={allServices}
        />
      </div>

      {Object.entries(groupedServices).map(([category, services]) => (
        <ServiceCategory
          key={category}
          category={category}
          services={services}
          selectedServices={selectedServices}
          onServiceToggle={onServiceToggle}
          onServicePriceChange={onServicePriceChange}
        />
      ))}

      {/* Resumo da seleção */}
      <ServicesSelectionSummary selectedServices={selectedServices} />

      {/* Modal para criar serviço personalizado */}
      {salonId && (
        <CustomServiceModal
          isOpen={showCustomServiceModal}
          onClose={() => setShowCustomServiceModal(false)}
          salonId={salonId}
          onServiceCreated={handleCustomServiceCreated}
        />
      )}
    </div>
  );
};

export default ServicesStep;
