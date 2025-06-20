
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Clock, Scissors } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';

interface ServiceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  onSuccess: () => void;
}

const ServiceCreationModal = ({ isOpen, onClose, salonId, onSuccess }: ServiceCreationModalProps) => {
  const { createService, presetServices, fetchPresetServices } = useSupabaseData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '60',
    category: ''
  });
  const [usePreset, setUsePreset] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchPresetServices();
    }
  }, [isOpen, fetchPresetServices]);

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presetServices.find(p => p.id === presetId);
    if (preset) {
      setFormData({
        name: preset.name,
        description: preset.description || '',
        price: '',
        duration_minutes: preset.default_duration_minutes.toString(),
        category: preset.category
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios com valores válidos",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = {
        salon_id: salonId,
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        active: true
      };

      const result = await createService(serviceData);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Serviço criado com sucesso!"
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          price: '',
          duration_minutes: '60',
          category: ''
        });
        setUsePreset(false);
        setSelectedPreset('');
        
        onSuccess();
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar serviço",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  const durationOptions = [
    { value: '15', label: '15 min' },
    { value: '30', label: '30 min' },
    { value: '45', label: '45 min' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1h 30min' },
    { value: '120', label: '2 horas' },
    { value: '150', label: '2h 30min' },
    { value: '180', label: '3 horas' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Scissors className="h-5 w-5 mr-2 text-blue-600" />
            Criar Novo Serviço
          </DialogTitle>
          <DialogDescription>
            Adicione um novo serviço para seu estabelecimento
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="usePreset"
              checked={usePreset}
              onChange={(e) => setUsePreset(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="usePreset" className="text-sm">
              Usar serviço pré-definido
            </Label>
          </div>

          {usePreset && (
            <div>
              <Label htmlFor="preset">Serviço Pré-definido</Label>
              <Select value={selectedPreset} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {presetServices.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{preset.name}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDuration(preset.default_duration_minutes)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="service-name">Nome do Serviço *</Label>
            <Input
              id="service-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Corte de Cabelo"
              required
            />
          </div>

          <div>
            <Label htmlFor="service-description">Descrição</Label>
            <Textarea
              id="service-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do serviço"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="service-price">Preço (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="service-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0,00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="service-duration">Duração *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Select
                  value={formData.duration_minutes}
                  onValueChange={(value) => setFormData({...formData, duration_minutes: value})}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
            >
              {isSubmitting ? 'Criando...' : 'Criar Serviço'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceCreationModal;
