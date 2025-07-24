
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { User, Edit, Trash2, Save, X } from "lucide-react";
import { useClientData } from '@/hooks/useClientData';
import { Client } from '@/types/supabase-entities';

interface ClientProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onUpdate: (updatedClient: Client) => void;
}

const ClientProfilePopup = ({ isOpen, onClose, client, onUpdate }: ClientProfilePopupProps) => {
  const [isEditing, setIsEditing] = useState(false);
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
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const { toast } = useToast();
  const { updateClientProfile, clearClientHistory, checkUsernameAvailability } = useClientData();

  // Carregar dados do cliente quando o modal abrir ou quando o cliente mudar
  useEffect(() => {
    if (isOpen && client) {
      console.log('Loading client data:', client);
      setFormData({
        username: client.username || '',
        full_name: client.full_name || client.name || '',
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
  }, [isOpen, client]);

  const handleUsernameChange = async (newUsername: string) => {
    setFormData({ ...formData, username: newUsername });
    setUsernameError('');

    if (newUsername.trim() && newUsername !== client.username) {
      const result = await checkUsernameAvailability(newUsername, client.id);
      if (!result.available) {
        setUsernameError(result.error || 'Nome de usuário não disponível');
      }
    }
  };

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (usernameError) {
      toast({
        title: "Erro",
        description: usernameError,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateClientProfile(client.id, formData);
      
      if (result.success) {
        onUpdate(result.client);
        setIsEditing(false);
        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar perfil",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Tem certeza que deseja limpar todo o histórico de agendamentos? Esta ação não pode ser desfeita.")) {
      setIsLoading(true);
      try {
        const result = await clearClientHistory(client.id);
        
        if (result.success) {
          toast({
            title: "Histórico limpo",
            description: result.message || "Histórico de agendamentos removido com sucesso",
          });
        } else {
          toast({
            title: "Erro",
            description: result.message || "Erro ao limpar histórico",
            variant: "destructive"
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao limpar histórico",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    // Restaurar dados originais do cliente
    setFormData({
      username: client.username || '',
      full_name: client.full_name || client.name || '',
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
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'CL';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Meu Perfil</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Avatar */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              {getInitials(client.username || client.name)}
            </div>
            <div>
              <p className="font-medium text-lg">{client.username || client.name}</p>
              <p className="text-sm text-gray-500">{client.email || 'Email não informado'}</p>
            </div>
          </div>

          <Separator />

          {/* Profile Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="username">Nome de usuário *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Nome de usuário"
                  className={usernameError ? 'border-red-500' : ''}
                />
                {usernameError && (
                  <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="full_name">Nome completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Address Section */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Endereço</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <Input
                      value={formData.street_address}
                      onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Rua, Avenida..."
                    />
                  </div>
                  <div>
                    <Input
                      value={formData.house_number}
                      onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Número"
                    />
                  </div>
                </div>
                
                <Input
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Bairro"
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Cidade"
                  />
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Estado"
                  />
                </div>
                
                <Input
                  value={formData.zip_code}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  disabled={!isEditing}
                  placeholder="CEP"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            {!isEditing ? (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center space-x-2"
                  variant="outline"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar Perfil</span>
                </Button>
                
                <Button
                  onClick={handleClearHistory}
                  variant="outline"
                  disabled={isLoading}
                  className="w-full flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isLoading ? 'Limpando...' : 'Limpar Histórico'}</span>
                </Button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Button
                  onClick={handleSave}
                  disabled={isLoading || !!usernameError}
                  className="flex-1 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Salvando...' : 'Salvar'}</span>
                </Button>
                
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancelar</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientProfilePopup;
