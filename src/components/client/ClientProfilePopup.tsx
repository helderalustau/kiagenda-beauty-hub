
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClientData } from '@/hooks/useClientData';
import { useToast } from "@/components/ui/use-toast";
import { StateSelect } from "@/components/ui/state-select";
import { CitySelect } from "@/components/ui/city-select";

interface ClientProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  client: any;
  onUpdate: (updatedClient: any) => void;
}

const ClientProfilePopup = ({ isOpen, onClose, client, onUpdate }: ClientProfilePopupProps) => {
  const { updateClientProfile, loading } = useClientData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    city: '',
    state: ''
  });

  const [usernameError, setUsernameError] = useState('');

  useEffect(() => {
    if (client && isOpen) {
      console.log('Loading client data into form:', client);
      
      setFormData({
        username: client.username || client.name || '',
        full_name: client.full_name || '',
        email: client.email || '',
        phone: client.phone || '',
        city: client.city || '',
        state: client.state || ''
      });
      setUsernameError('');
    }
  }, [client, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      setUsernameError('');
    }
    
    // Limpar cidade quando estado mudar
    if (field === 'state') {
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setUsernameError('Nome é obrigatório');
      return;
    }

    try {
      const result = await updateClientProfile(client.id, formData);
      
      if (result.success) {
        // Atualizar o localStorage com os novos dados
        const updatedClient = {
          ...client,
          ...result.client,
          name: result.client.username, // Garantir que o name seja atualizado
          username: result.client.username
        };
        
        localStorage.setItem('clientAuth', JSON.stringify(updatedClient));
        
        // Chamar callback para atualizar o estado do componente pai
        onUpdate(updatedClient);
        
        toast({
          title: "Sucesso!",
          description: "Perfil atualizado com sucesso.",
        });
        
        onClose();
      } else {
        setUsernameError(result.message || 'Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUsernameError('Erro ao atualizar perfil');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Meu Perfil</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Nome *</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Digite seu nome"
              className={usernameError ? 'border-red-500' : ''}
              disabled={loading}
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          <div>
            <Label htmlFor="full_name">Nome Completo</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              placeholder="Digite seu nome completo"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Digite seu email"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Digite seu telefone"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="state">Estado *</Label>
              <StateSelect
                value={formData.state}
                onValueChange={(value) => handleInputChange('state', value)}
                placeholder="Selecione o estado"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <CitySelect
                value={formData.city}
                onValueChange={(value) => handleInputChange('city', value)}
                state={formData.state}
                placeholder="Digite a cidade"
                disabled={!formData.state}
              />
            </div>
          </div>

          <div className="flex space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !!usernameError}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientProfilePopup;
