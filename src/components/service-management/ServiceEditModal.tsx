
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Scissors, DollarSign, Clock, FileText, ToggleLeft } from "lucide-react";
import { Service } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface ServiceEditModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceId: string, data: Partial<Service>) => Promise<{ success: boolean; message?: string }>;
}

const ServiceEditModal = ({ service, isOpen, onClose, onSave }: ServiceEditModalProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration_minutes: 60,
    active: true
  });

  // Resetar dados quando o serviço mudar
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: Number(service.price) || 0,
        duration_minutes: Number(service.duration_minutes) || 60,
        active: service.active !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration_minutes: 60,
        active: true
      });
    }
  }, [service]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceChange = (value: string) => {
    const numericValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      price: numericValue
    }));
  };

  const handleDurationChange = (value: string) => {
    const numericValue = parseInt(value) || 60;
    setFormData(prev => ({
      ...prev,
      duration_minutes: numericValue
    }));
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

  const handleSave = async () => {
    if (!service) {
      toast({
        title: "Erro",
        description: "Serviço não encontrado",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do serviço é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Erro",
        description: "Preço deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (formData.duration_minutes <= 0) {
      toast({
        title: "Erro",
        description: "Duração deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      console.log('ServiceEditModal - Salvando serviço:', service.id, formData);

      const updateData = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: Number(formData.price),
        duration_minutes: Number(formData.duration_minutes),
        active: formData.active
      };

      const result = await onSave(service.id, updateData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Serviço atualizado com sucesso"
        });
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar serviço",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('ServiceEditModal - Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar serviço",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!service) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-center space-x-2">
            <Scissors className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-xl">Editar Serviço</DialogTitle>
          </div>
          <DialogDescription>
            Modifique as informações do serviço abaixo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status do Serviço */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <ToggleLeft className="h-4 w-4 text-gray-600" />
              <span className="font-medium">Status do Serviço</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant={formData.active ? "default" : "secondary"}>
                {formData.active ? 'Ativo' : 'Inativo'}
              </Badge>
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange('active', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Nome do Serviço */}
          <div className="space-y-2">
            <Label htmlFor="service-name" className="text-base font-medium">
              Nome do Serviço *
            </Label>
            <Input
              id="service-name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Corte Feminino"
              className="text-base"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="service-description" className="text-base font-medium flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span>Descrição</span>
            </Label>
            <Textarea
              id="service-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o serviço oferecido..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Preço e Duração */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service-price" className="text-base font-medium flex items-center space-x-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Preço *</span>
              </Label>
              <div className="space-y-1">
                <Input
                  id="service-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="0,00"
                  min="0"
                  step="0.01"
                  className="text-base"
                />
                <p className="text-sm text-green-600 font-medium">
                  {formatCurrency(formData.price)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service-duration" className="text-base font-medium flex items-center space-x-1">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Duração *</span>
              </Label>
              <div className="space-y-1">
                <Input
                  id="service-duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  placeholder="60"
                  min="1"
                  className="text-base"
                />
                <p className="text-sm text-blue-600 font-medium">
                  {formatDuration(formData.duration_minutes)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Resumo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Resumo do Serviço</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nome:</strong> {formData.name || 'Não informado'}</p>
              <p><strong>Preço:</strong> {formatCurrency(formData.price)}</p>
              <p><strong>Duração:</strong> {formatDuration(formData.duration_minutes)}</p>
              <p><strong>Status:</strong> {formData.active ? 'Ativo' : 'Inativo'}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex space-x-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="flex-1"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Salvando...</span>
              </div>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditModal;
