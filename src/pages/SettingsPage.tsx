import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings, Bell, Users, Plus, Edit, Trash2, Play, AlertCircle } from "lucide-react";
import { Salon, AdminUser } from '@/hooks/useSupabaseData';
import { useSalonData } from '@/hooks/useSalonData';
import { useAuthData } from '@/hooks/useAuthData';
import { useToast } from "@/components/ui/use-toast";

interface SettingsPageProps {
  salon: Salon | null;
  onRefresh: () => void;
}

const SettingsPage = ({ salon, onRefresh }: SettingsPageProps) => {
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [salonData, setSalonData] = useState(salon || {
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    notification_sound: 'default',
    plan: 'bronze' as 'bronze' | 'prata' | 'gold',
    max_attendants: 1
  });
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'collaborator' as 'admin' | 'manager' | 'collaborator'
  });
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const { updateSalon } = useSalonData();
  const { registerAdmin, updateAdminUser, deleteAdminUser } = useAuthData();
  const { toast } = useToast();

  const notificationSounds = [
    { value: 'default', label: 'Padrão', file: '/sounds/default.mp3' },
    { value: 'bell', label: 'Sino', file: '/sounds/bell.mp3' },
    { value: 'chime', label: 'Carrilhão', file: '/sounds/chime.mp3' },
    { value: 'notification', label: 'Notificação', file: '/sounds/notification.mp3' }
  ];

  const handleSaveSalon = async () => {
    if (!salon?.id) return;
    
    setIsSaving(true);
    
    const dataToUpdate = {
      ...salonData,
      id: salon.id
    };
    
    const result = await updateSalon(dataToUpdate);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Alterações salvas com sucesso!"
      });
      // Aplicar alterações imediatamente
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
    
    setIsSaving(false);
  };

  const handlePlayNotification = (soundFile: string) => {
    // Simular preview do som de notificação
    toast({
      title: "Preview",
      description: `Reproduzindo som: ${soundFile}`,
    });
    
    // Aqui você poderia reproduzir o arquivo de áudio real
    // if (audioRef.current) {
    //   audioRef.current.src = soundFile;
    //   audioRef.current.play();
    // }
  };

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificar limite baseado no plano
    const maxUsers = salon?.max_attendants || 1;
    if (adminUsers.length >= maxUsers) {
      setShowUserDialog(false);
      setShowUpgradeDialog(true);
      return;
    }

    const result = await registerAdmin(
      salon?.id || '',
      newUserData.name,
      newUserData.password,
      newUserData.email,
      newUserData.phone,
      newUserData.role
    );

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Usuário criado com sucesso!"
      });
      setShowUserDialog(false);
      setNewUserData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'collaborator'
      });
      onRefresh();
    } else if (result.message && result.message.includes('limite')) {
      setShowUserDialog(false);
      setShowUpgradeDialog(true);
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const result = await updateAdminUser({
      userId: editingUser.id,
      userData: {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role
      }
    });

    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso!"
      });
      setEditingUser(null);
      onRefresh();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const result = await deleteAdminUser(userId);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso!"
        });
        onRefresh();
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const roles = {
      admin: { label: 'Administrador', variant: 'default' as const },
      manager: { label: 'Gerente', variant: 'secondary' as const },
      collaborator: { label: 'Colaborador', variant: 'outline' as const }
    };
    return roles[role as keyof typeof roles] || roles.collaborator;
  };

  const handleUpgrade = () => {
    setShowUpgradeDialog(false);
    window.location.href = '/plan-selection';
  };

  // Atualizar salonData quando salon prop mudar
  useEffect(() => {
    if (salon) {
      setSalonData(salon);
    }
  }, [salon]);

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
          <Button onClick={handleSaveSalon} disabled={isSaving}>
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
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
              <div className="flex gap-2">
                <Select 
                  value={salonData.notification_sound} 
                  onValueChange={(value) => setSalonData({...salonData, notification_sound: value})}
                >
                  <SelectTrigger className="flex-1">
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
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const selectedSound = notificationSounds.find(s => s.value === salonData.notification_sound);
                    if (selectedSound) {
                      handlePlayNotification(selectedSound.file);
                    }
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={handleSaveSalon} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
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
              <Badge variant="secondary">
                {adminUsers.length}/{salon?.max_attendants || 1}
              </Badge>
            </CardTitle>
            <Button onClick={() => setShowUserDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminUsers.map((user) => (
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600"
                      onClick={() => handleDeleteUser(user.id)}
                    >
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
              <label className="block text-sm font-medium mb-2">Nome *</label>
              <Input 
                placeholder="Nome completo" 
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">E-mail *</label>
              <Input 
                type="email" 
                placeholder="email@exemplo.com" 
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Telefone</label>
              <Input 
                type="tel" 
                placeholder="(11) 99999-9999" 
                value={newUserData.phone}
                onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Senha *</label>
              <Input 
                type="password" 
                placeholder="Senha temporária" 
                value={newUserData.password}
                onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cargo</label>
              <Select value={newUserData.role} onValueChange={(value: 'admin' | 'manager' | 'collaborator') => setNewUserData({...newUserData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
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
              <Button onClick={handleCreateUser} className="flex-1">
                Criar Usuário
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Usuário */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <Input 
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <Input 
                  type="email" 
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <Input 
                  type="tel" 
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cargo</label>
                <Select value={editingUser.role} onValueChange={(value: 'admin' | 'manager' | 'collaborator') => setEditingUser({...editingUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="collaborator">Colaborador</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleUpdateUser} className="flex-1">
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Upgrade de Plano */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span>Limite de Atendentes Atingido</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Você não tem permissão para criar novos atendentes. 
              Seu plano atual permite apenas {salon?.max_attendants || 1} atendente(s).
            </p>
            <p className="text-sm text-gray-500">
              Faça upgrade para um plano superior para adicionar mais atendentes.
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                Fechar
              </Button>
              <Button onClick={handleUpgrade} className="flex-1">
                Fazer Upgrade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <audio ref={audioRef} />
    </div>
  );
};

export default SettingsPage;
