
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select,SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Bell, Users, Plus, Edit, Trash2 } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';

interface SettingsPageProps {
  salon: Salon | null;
  onRefresh: () => void;
}

const SettingsPage = ({ salon, onRefresh }: SettingsPageProps) => {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [salonData, setSalonData] = useState(salon || {
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    notification_sound: 'default'
  });

  const notificationSounds = [
    { value: 'default', label: 'Padrão' },
    { value: 'bell', label: 'Sino' },
    { value: 'chime', label: 'Carrilhão' },
    { value: 'notification', label: 'Notificação' }
  ];

  const mockUsers = [
    { id: '1', name: 'Maria Santos', email: 'maria@email.com', role: 'admin' },
    { id: '2', name: 'João Silva', email: 'joao@email.com', role: 'manager' },
    { id: '3', name: 'Ana Costa', email: 'ana@email.com', role: 'collaborator' }
  ];

  const handleSaveSalon = async () => {
    // Aqui seria implementada a lógica de salvar no Supabase
    console.log('Salvar dados do salão:', salonData);
    onRefresh();
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      admin: { label: 'Administrador', variant: 'default' as const },
      manager: { label: 'Gerente', variant: 'secondary' as const },
      collaborator: { label: 'Colaborador', variant: 'outline' as const }
    };
    return roles[role as keyof typeof roles] || roles.collaborator;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie as configurações do seu salão</p>
      </div>

      {/* Dados do Salão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Dados do Salão</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Salão</label>
              <Input
                value={salonData.name}
                onChange={(e) => setSalonData({...salonData, name: e.target.value})}
                placeholder="Nome do salão"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nome do Responsável</label>
              <Input
                value={salonData.owner_name}
                onChange={(e) => setSalonData({...salonData, owner_name: e.target.value})}
                placeholder="Nome do responsável"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <Input
                value={salonData.phone}
                onChange={(e) => setSalonData({...salonData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Endereço</label>
              <Input
                value={salonData.address}
                onChange={(e) => setSalonData({...salonData, address: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
          </div>
          <Button onClick={handleSaveSalon}>
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Som de Notificação</label>
              <Select 
                value={salonData.notification_sound} 
                onValueChange={(value) => setSalonData({...salonData, notification_sound: value})}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {notificationSounds.map(sound => (
                    <SelectItem key={sound.value} value={sound.value}>
                      {sound.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveSalon}>
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciar Usuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gerenciar Usuários</span>
            </CardTitle>
            <Button onClick={() => setShowUserDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={getRoleBadge(user.role).variant}>
                    {getRoleBadge(user.role).label}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Novo Usuário */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome</label>
              <Input placeholder="Nome completo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-mail</label>
              <Input type="email" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cargo</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collaborator">Colaborador</SelectItem>
                  <SelectItem value="manager">Gerente</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowUserDialog(false)} className="flex-1">
                Cancelar
              </Button>
              <Button className="flex-1">
                Criar Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
