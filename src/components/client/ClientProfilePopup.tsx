
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useClientData } from '@/hooks/useClientData';
import { useToast } from "@/components/ui/use-toast";

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
    street_address: '',
    house_number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: ''
  });

  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  useEffect(() => {
    if (client && isOpen) {
      console.log('Loading client data into form:', client);
      setFormData({
        username: client.username || '',
        full_name: client.full_name || '',
        email: client.email || '',
        phone: client.phone || '',
        street_address: client.street_address || '',
        house_number: client.house_number || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
        zip_code: client.zip_code || ''
      });
      setUsernameError('');
    }
  }, [client, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'username') {
      setUsernameError('');
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
          name: result.client.username // Garantir que o name seja atualizado
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
              <Label htmlFor="street_address">Endereço</Label>
              <Input
                id="street_address"
                value={formData.street_address}
                onChange={(e) => handleInputChange('street_address', e.target.value)}
                placeholder="Rua/Avenida"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="house_number">Número</Label>
              <Input
                id="house_number"
                value={formData.house_number}
                onChange={(e) => handleInputChange('house_number', e.target.value)}
                placeholder="Número"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              placeholder="Digite o bairro"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Digite a cidade"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Digite o estado"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zip_code">CEP</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => handleInputChange('zip_code', e.target.value)}
              placeholder="Digite o CEP"
              disabled={loading}
            />
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
