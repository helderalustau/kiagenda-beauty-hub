
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

interface CustomServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  salonId: string;
  onServiceCreated: (service: any) => void;
}

const CustomServiceModal = ({ isOpen, onClose, salonId, onServiceCreated }: CustomServiceModalProps) => {
  const { createService } = useSupabaseData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '60'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '60'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.price || parseFloat(formData.price) <= 0) {
      toast({
        title: "Erro",
        description: "Nome do serviço e preço são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = {
        salon_id: salonId,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        active: true
      };

      console.log('Creating custom service:', serviceData);
      const result = await createService(serviceData);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Serviço personalizado criado com sucesso!"
        });
        
        // Adicionar o serviço criado aos serviços selecionados
        onServiceCreated({
          id: result.service.id,
          name: result.service.name,
          description: result.service.description,
          price: result.service.price,
          duration_minutes: result.service.duration_minutes
        });
        
        resetForm();
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao criar serviço",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar serviço personalizado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar serviço",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
            Criar Serviço Personalizado
          </DialogTitle>
          <DialogDescription>
            Crie um novo serviço personalizado para seu estabelecimento
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="custom-service-name">Nome do Serviço *</Label>
            <Input
              id="custom-service-name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Corte Especial"
              required
            />
          </div>

          <div>
            <Label htmlFor="custom-service-description">Descrição</Label>
            <Textarea
              id="custom-service-description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descrição do serviço"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-service-price">Preço (R$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="custom-service-price"
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
              <Label htmlFor="custom-service-duration">Duração *</Label>
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

export default CustomServiceModal;
