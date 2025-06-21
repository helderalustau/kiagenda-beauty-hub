
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { Service } from '@/hooks/useSupabaseData';
import ServiceCard from '@/components/service-management/ServiceCard';
import ServiceEditModal from '@/components/service-management/ServiceEditModal';

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
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
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
      await fetchSalonServices(salon.id);
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao criar serviço",
        variant: "destructive"
      });
    }
  };

  const handleUpdateService = async (serviceId: string, updateData: Partial<Service>) => {
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive"
      });
      return { success: false, message: "Estabelecimento não encontrado" };
    }

    console.log('ServiceManager - Atualizando serviço:', serviceId, updateData);

    const result = await updateService(serviceId, updateData);

    if (result.success) {
      // Atualizar a lista de serviços imediatamente
      await fetchSalonServices(salon.id);
      onRefresh();
    }

    return result;
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete || !salon?.id) {
      toast({
        title: "Erro",
        description: "Serviço ou estabelecimento não encontrado",
        variant: "destructive"
      });
      return;
    }

    console.log('ServiceManager - Deletando serviço:', serviceToDelete.id);

    const result = await deleteService(serviceToDelete.id);
    
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: "Serviço excluído com sucesso",
      });
      setServiceToDelete(null);
      await fetchSalonServices(salon.id);
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
      await fetchSalonServices(salon.id);
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message || "Erro ao alterar status do serviço",
        variant: "destructive"
      });
    }
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={setEditingService}
                onDelete={setServiceToDelete}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      <ServiceEditModal
        service={editingService}
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        onSave={handleUpdateService}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!serviceToDelete} onOpenChange={() => setServiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o serviço "{serviceToDelete?.name}"? 
              Esta ação não pode ser desfeita e todos os agendamentos relacionados a este serviço serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteService}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir Serviço
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceManager;
