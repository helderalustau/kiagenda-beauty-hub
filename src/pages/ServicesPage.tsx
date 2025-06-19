
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Scissors } from "lucide-react";
import { Service, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface ServicesPageProps {
  services: Service[];
  onRefresh: () => void;
}

const ServicesPage = ({ services, onRefresh }: ServicesPageProps) => {
  const { salon, createService } = useSupabaseData();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado. Recarregue a página.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name || !formData.price || !formData.duration_minutes) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const serviceData = {
      salon_id: salon.id,
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      duration_minutes: parseInt(formData.duration_minutes),
      active: true
    };

    console.log('Criando serviço com dados:', serviceData);

    const result = await createService(serviceData);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!"
      });
      setShowAddDialog(false);
      setEditingService(null);
      setFormData({ name: '', description: '', price: '', duration_minutes: '' });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString()
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (serviceId: string) => {
    // TODO: Implementar função de deletar serviço
    console.log('Deletar serviço:', serviceId);
    toast({
      title: "Em desenvolvimento",
      description: "Função de deletar serviço será implementada em breve",
    });
  };

  const handleCloseDialog = () => {
    setShowAddDialog(false);
    setEditingService(null);
    setFormData({ name: '', description: '', price: '', duration_minutes: '' });
  };

  // Debug: Mostrar ID do salon no console
  useEffect(() => {
    console.log('ServicesPage - Salon atual:', salon);
  }, [salon]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gerenciar Serviços</h1>
          <p className="text-gray-600 text-sm sm:text-base">Cadastre e gerencie os serviços do seu salão</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 sm:py-12">
            <Scissors className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Comece adicionando os serviços que você oferece
            </p>
            <Button onClick={() => setShowAddDialog(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Serviço
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {services.map((service) => (
            <Card key={service.id}>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                    <Scissors className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    <span className="break-words">{service.name}</span>
                  </CardTitle>
                  <Badge variant={service.active ? "default" : "secondary"} className="text-xs">
                    {service.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  {service.description && (
                    <p className="text-gray-600 text-sm break-words">{service.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      R$ {service.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {service.duration_minutes} min
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(service)}
                      className="w-full sm:w-auto"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para Adicionar/Editar Serviço - Responsivo */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="mx-4 max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Editar Serviço' : 'Novo Serviço'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Serviço *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Corte Feminino"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva o serviço..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Preço (R$) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="45.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duração (min) *</label>
                <Input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  placeholder="60"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                {editingService ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;
