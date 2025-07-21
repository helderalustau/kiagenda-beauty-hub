
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Edit2 } from "lucide-react";
import { Salon, useSupabaseData } from '@/hooks/useSupabaseData';

interface SalonEditModalProps {
  salon: Salon | null;
  isOpen: boolean;
  onClose: () => void;
  onSalonUpdated: () => void;
}

const SalonEditModal = ({ salon, isOpen, onClose, onSalonUpdated }: SalonEditModalProps) => {
  const { updateSalon } = useSupabaseData();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: salon?.name || '',
    plan: salon?.plan || 'bronze'
  });

  React.useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name,
        plan: salon.plan
      });
    }
  }, [salon]);

  if (!salon) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Nome do estabelecimento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await updateSalon({
        id: salon.id,
        name: formData.name.trim(),
        plan: formData.plan as 'bronze' | 'prata' | 'gold'
      });
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Estabelecimento atualizado com sucesso!"
        });
        onSalonUpdated();
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar estabelecimento",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating salon:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Editar Estabelecimento
          </DialogTitle>
          <DialogDescription>
            Edite as informações do estabelecimento
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Estabelecimento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome do estabelecimento"
              required
            />
          </div>

          <div>
            <Label htmlFor="plan">Plano *</Label>
            <Select
              value={formData.plan}
              onValueChange={(value) => handleInputChange('plan', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="prata">Prata</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SalonEditModal;
