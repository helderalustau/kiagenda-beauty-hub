
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Service } from '@/types/supabase-entities';
import { useServiceData } from '@/hooks/useServiceData';
import { useToast } from "@/components/ui/use-toast";
import ServiceCreationModal from './service-management/ServiceCreationModal';
import ServiceEditModal from './service-management/ServiceEditModal';
import ServiceToggle from './service-management/ServiceToggle';

interface ServiceManagerProps {
  salonId: string;
  onRefresh: () => void;
}

const ServiceManager = ({ salonId, onRefresh }: ServiceManagerProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const { fetchSalonServices, updateService, deleteService, toggleServiceStatus } = useServiceData();
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
  }, [salonId]);

  const loadServices = async () => {
    if (!salonId) return;
    
    try {
      const fetchedServices = await fetchSalonServices(salonId);
      setServices(fetchedServices || []);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    }
  };

  const handleToggleStatus = async (serviceId: string, currentStatus: boolean) => {
    setUpdating(serviceId);
    
    const result = await toggleServiceStatus(serviceId, !currentStatus);
    
    if (result.success) {
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, active: !currentStatus }
          : service
      ));
      
      toast({
        title: "Sucesso",
        description: `Serviço ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`
      });
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao atualizar status do serviço",
        variant: "destructive"
      });
    }
    
    setUpdating(null);
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    const result = await deleteService(serviceId);
    
    if (result.success) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso!"
      });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao excluir serviço",
        variant: "destructive"
      });
    }
  };

  const handleServiceCreated = async () => {
    await loadServices();
    setShowCreateModal(false);
    onRefresh();
  };

  const handleServiceUpdated = async (serviceId: string, updateData: Partial<Service>) => {
    const result = await updateService(serviceId, updateData);
    
    if (result.success && result.service) {
      setServices(prev => prev.map(service => 
        service.id === serviceId ? result.service! : service
      ));
      setEditingService(null);
      onRefresh();
      
      toast({
        title: "Sucesso",
        description: "Serviço atualizado com sucesso!"
      });
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao atualizar serviço",
        variant: "destructive"
      });
    }
    
    return result;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Gerenciar Serviços</h2>
          <p className="text-gray-600">Configure os serviços oferecidos pelo estabelecimento</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-gray-500 mb-4">Nenhum serviço cadastrado</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className={`${!service.active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`${service.active ? 'text-gray-900' : 'text-gray-500'}`}>
                    {service.name}
                  </CardTitle>
                  <ServiceToggle
                    isActive={service.active}
                    onToggle={() => handleToggleStatus(service.id, service.active)}
                    disabled={updating === service.id}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {service.description && (
                    <p className={`text-sm ${service.active ? 'text-gray-600' : 'text-gray-400'}`}>
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className={`font-semibold ${service.active ? 'text-green-600' : 'text-gray-500'}`}>
                        {formatCurrency(service.price)}
                      </span>
                      <span className={`text-sm ${service.active ? 'text-gray-500' : 'text-gray-400'}`}>
                        {service.duration_minutes}min
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteService(service.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ServiceCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        salonId={salonId}
        onSuccess={handleServiceCreated}
      />

      {editingService && (
        <ServiceEditModal
          isOpen={true}
          onClose={() => setEditingService(null)}
          service={editingService}
          onSave={handleServiceUpdated}
        />
      )}
    </div>
  );
};

export default ServiceManager;
