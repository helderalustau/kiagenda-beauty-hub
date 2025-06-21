
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Clock, DollarSign, Eye, EyeOff, Save } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { Service } from '@/hooks/useSupabaseData';

interface ServiceManagerProps {
  salon: any;
  onRefresh: () => void;
}

const ServiceManager = ({ salon, onRefresh }: ServiceManagerProps) => {
  const { 
    services, 
    fetchSalonServices, 
    createService, 
    updateService, 
    deleteService, 
    toggleServiceStatus 
  } = useSupabaseData();
  
  const { toast } = useToast();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '60'
  });

  useEffect(() => {
    if (salon?.id) {
      console.log('ServiceManager - Loading services for salon:', salon.id);
      fetchSalonServices(salon.id);
    }
  }, [salon?.id, fetchSalonServices]);

  const handleCreateService = async () => {
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (!newService.name.trim() || !newService.price) {
      toast({
        title: "Erro",
        description: "Nome e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const result = await createService({
      salon_id: salon.id,
      name: newService.name.trim(),
      description: newService.description.trim() || null,
      price: Number(newService.price),
      duration_minutes: Number(newService.duration_minutes) || 60,
      active: true
    });

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Serviço criado com sucesso",
      });
      setNewService({ name: '', description: '', price: '', duration_minutes: '60' });
      setIsCreateModalOpen(false);
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao criar serviço",
        variant: "destructive"
      });
    }
  };

  const handleUpdateService = async (service: Service) => {
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (!service.name.trim() || !service.price || service.price <= 0) {
      toast({
        title: "Erro",
        description: "Nome e preço válido são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const result = await updateService(service.id, {
      name: service.name.trim(),
      description: service.description?.trim() || null,
      price: Number(service.price),
      duration_minutes: Number(service.duration_minutes) || 60
    });

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Serviço atualizado com sucesso",
      });
      setEditingService(null);
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao atualizar serviço",
        variant: "destructive"
      });
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    const result = await deleteService(serviceId);
    
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Serviço excluído com sucesso",
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

  const handleToggleStatus = async (service: Service) => {
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    const result = await toggleServiceStatus(service.id, service.active);
    
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: `Serviço ${service.active ? 'desativado' : 'ativado'} com sucesso`,
      });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao alterar status do serviço",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!salon) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Estabelecimento não encontrado. Recarregue a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Serviços</h2>
          <p className="text-gray-600">Adicione e gerencie os serviços do seu estabelecimento</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Serviço</DialogTitle>
              <DialogDescription>
                Adicione um novo serviço ao seu estabelecimento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Serviço *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Corte Feminino"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o serviço..."
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Preço (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Duração (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    min="1"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration_minutes: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateService}>
                  Criar Serviço
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {services.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhum serviço cadastrado ainda</p>
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Serviço
              </Button>
            </CardContent>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className={`${!service.active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {editingService?.id === service.id ? (
                        <Input
                          value={editingService.name}
                          onChange={(e) => setEditingService(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                      )}
                      <Badge variant={service.active ? "default" : "secondary"}>
                        {service.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {editingService?.id === service.id ? (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateService(editingService)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(service)}
                    >
                      {service.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {editingService?.id === service.id ? (
                    <Textarea
                      value={editingService.description || ''}
                      onChange={(e) => setEditingService(prev => prev ? { ...prev, description: e.target.value } : null)}
                      placeholder="Descrição do serviço..."
                      rows={2}
                    />
                  ) : (
                    service.description && (
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    )
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        {editingService?.id === service.id ? (
                          <Input
                            type="number"
                            value={editingService.price}
                            onChange={(e) => setEditingService(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                            className="w-24"
                            min="0"
                            step="0.01"
                          />
                        ) : (
                          <span className="font-semibold">{formatCurrency(service.price)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Clock className="h-4 w-4" />
                        {editingService?.id === service.id ? (
                          <Input
                            type="number"
                            value={editingService.duration_minutes}
                            onChange={(e) => setEditingService(prev => prev ? { ...prev, duration_minutes: Number(e.target.value) } : null)}
                            className="w-16"
                            min="1"
                          />
                        ) : (
                          <span>{service.duration_minutes} min</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceManager;
