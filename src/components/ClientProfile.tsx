
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Edit } from "lucide-react";
import { Client } from '@/types/supabase-entities';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface ClientProfileProps {
  client: Client;
  onUpdate: (updatedClient: Client) => void;
}

const ClientProfile = ({ client, onUpdate }: ClientProfileProps) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(client);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const { data, error } = await supabase
        .from('client_auth')
        .update({
          username: editingClient.username,
          name: editingClient.name,
          phone: editingClient.phone,
          email: editingClient.email,
          full_name: editingClient.full_name,
          street_address: editingClient.street_address,
          house_number: editingClient.house_number,
          neighborhood: editingClient.neighborhood,
          city: editingClient.city,
          state: editingClient.state,
          zip_code: editingClient.zip_code
        })
        .eq('id', client.id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!"
      });
      onUpdate(data);
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Meu Perfil</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingClient(client);
                setShowEditDialog(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-600">Nome de Usuário</Label>
              <p className="text-gray-900">{client.username}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
              <p className="text-gray-900">{client.full_name || client.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Telefone</Label>
              <p className="text-gray-900">{client.phone || 'Não informado'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">E-mail</Label>
              <p className="text-gray-900">{client.email || 'Não informado'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Endereço</Label>
              <p className="text-gray-900">
                {client.street_address && client.house_number 
                  ? `${client.street_address}, ${client.house_number}`
                  : 'Não informado'
                }
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Bairro</Label>
              <p className="text-gray-900">{client.neighborhood || 'Não informado'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-600">Cidade/Estado</Label>
              <p className="text-gray-900">
                {client.city && client.state 
                  ? `${client.city}, ${client.state}`
                  : 'Não informado'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Nome de Usuário *</Label>
              <Input
                id="username"
                value={editingClient.username}
                onChange={(e) => setEditingClient({...editingClient, username: e.target.value})}
                placeholder="Nome de usuário"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={editingClient.full_name || ''}
                onChange={(e) => setEditingClient({...editingClient, full_name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={editingClient.phone || ''}
                onChange={(e) => setEditingClient({...editingClient, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={editingClient.email || ''}
                onChange={(e) => setEditingClient({...editingClient, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Endereço</Label>
                <Input
                  id="street"
                  value={editingClient.street_address || ''}
                  onChange={(e) => setEditingClient({...editingClient, street_address: e.target.value})}
                  placeholder="Rua, Avenida..."
                />
              </div>
              <div>
                <Label htmlFor="house_number">Número</Label>
                <Input
                  id="house_number"
                  value={editingClient.house_number || ''}
                  onChange={(e) => setEditingClient({...editingClient, house_number: e.target.value})}
                  placeholder="123"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                value={editingClient.neighborhood || ''}
                onChange={(e) => setEditingClient({...editingClient, neighborhood: e.target.value})}
                placeholder="Nome do bairro"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={editingClient.city || ''}
                  onChange={(e) => setEditingClient({...editingClient, city: e.target.value})}
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={editingClient.state || ''}
                  onChange={(e) => setEditingClient({...editingClient, state: e.target.value})}
                  placeholder="SP"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                value={editingClient.zip_code || ''}
                onChange={(e) => setEditingClient({...editingClient, zip_code: e.target.value})}
                placeholder="00000-000"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClientProfile;
