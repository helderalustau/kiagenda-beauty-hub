
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SuperAdminCreateSalonDialogProps {
  onCreateSalon: (salonData: any, bannerFile: File | null) => Promise<void>;
  isSubmitting: boolean;
}

const SuperAdminCreateSalonDialog = ({ onCreateSalon, isSubmitting }: SuperAdminCreateSalonDialogProps) => {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSalon, setNewSalon] = useState({
    owner_name: '',
    phone: '',
    plan: 'bronze' as 'bronze' | 'prata' | 'gold'
  });

  const generateSequentialSalonName = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EST-${timestamp}-${random}`;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!newSalon.owner_name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do responsável é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!newSalon.phone.trim()) {
      toast({
        title: "Erro",
        description: "Telefone é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Create salon with sequential name and temporary address
    const salonData = {
      name: generateSequentialSalonName(),
      owner_name: newSalon.owner_name,
      phone: newSalon.phone,
      plan: newSalon.plan,
      address: 'Endereço será preenchido na configuração',
      category_id: null, // Permitir null para estabelecimentos temporários
      is_open: false,
      setup_completed: false
    };

    console.log('Enviando dados do estabelecimento:', salonData);

    await onCreateSalon(salonData, null);
    
    // Reset form and close dialog
    setShowCreateDialog(false);
    setNewSalon({
      owner_name: '',
      phone: '',
      plan: 'bronze'
    });
  };

  const resetForm = () => {
    setShowCreateDialog(false);
    setNewSalon({
      owner_name: '',
      phone: '',
      plan: 'bronze'
    });
  };

  return (
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Novo Estabelecimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Criar Novo Estabelecimento</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos do responsável. O estabelecimento receberá um código sequencial temporário e o responsável configurará as informações completas posteriormente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="owner-name">Nome do Responsável *</Label>
            <Input
              id="owner-name"
              value={newSalon.owner_name}
              onChange={(e) => setNewSalon({...newSalon, owner_name: e.target.value})}
              placeholder="Nome do proprietário"
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={newSalon.phone}
              onChange={(e) => setNewSalon({...newSalon, phone: e.target.value})}
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div>
            <Label htmlFor="plan">Plano</Label>
            <select
              id="plan"
              value={newSalon.plan}
              onChange={(e) => setNewSalon({...newSalon, plan: e.target.value as 'bronze' | 'prata' | 'gold'})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="bronze">Bronze</option>
              <option value="prata">Prata</option>
              <option value="gold">Gold</option>
            </select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Nota:</strong> O estabelecimento receberá um código sequencial temporário (ex: EST-123456789-001). 
              O responsável poderá configurar o nome definitivo e categoria durante a configuração inicial.
            </p>
          </div>
        </div>
        <div className="flex space-x-2 mt-6">
          <Button 
            variant="outline" 
            onClick={resetForm}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Criando..." : "Criar Estabelecimento"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuperAdminCreateSalonDialog;
