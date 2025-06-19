
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Scissors, Clock, DollarSign } from "lucide-react";
import { Service, useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface ServiceManagerProps {
  salonId: string;
  services: Service[];
  onRefresh: () => void;
}

const ServiceManager = ({ salonId, services, onRefresh }: ServiceManagerProps) => {
  const { createService } = useSupabaseData();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 60
  });

  const handleCreateService = async () => {
    if (!newService.name || newService.price <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const result = await createService({
      salon_id: salonId,
      ...newService
    });
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Serviço criado com sucesso!"
      });
      setShowCreateDialog(false);
      setNewService({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 60
      });
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Serviços do Estabelecimento</h3>
          <p className="text-sm text-gray-600">Gerencie os serviços oferecidos</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Serviço</DialogTitle>
              <DialogDescription>
                Adicione um novo serviço para este estabelecimento
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="service-name">Nome do Serviço *</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="Ex: Corte de Cabelo"
                />
              </div>
              <div>
                <Label htmlFor="service-description">Descrição</Label>
                <Textarea
                  id="service-description"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Descrição do serviço"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-price">Preço (R$) *</Label>
                  <Input
                    id="service-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newService.price}
                    onChange={(e) => setNewService({...newService, price: parseFloat(e.target.value) || 0})}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label htmlFor="service-duration">Duração (min) *</Label>
                  <Input
                    id="service-duration"
                    type="number"
                    min="15"
                    step="15"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({...newService, duration_minutes: parseInt(e.target.value) || 60})}
                    placeholder="60"
                  />
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateService}>
                Criar Serviço
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="bg-white/80 backdrop-blur-sm border-0 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                    <Scissors className="h-4 w-4 mr-2 text-blue-600" />
                    {service.name}
                  </CardTitle>
                  {service.description && (
                    <CardDescription className="mt-1 text-gray-600">
                      {service.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={service.active ? "default" : "secondary"}>
                  {service.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                    <span>Preço:</span>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(service.price)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-blue-600" />
                    <span>Duração:</span>
                  </div>
                  <span className="font-semibold text-blue-600">
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <div className="col-span-full">
            <Card className="bg-white/60 backdrop-blur-sm border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Scissors className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum serviço cadastrado
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  Adicione serviços para que os clientes possam fazer agendamentos
                </p>
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Serviço
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceManager;
