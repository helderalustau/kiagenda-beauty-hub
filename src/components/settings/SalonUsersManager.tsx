
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useSalonUsers } from '@/hooks/useSalonUsers';
import { useToast } from "@/components/ui/use-toast";

interface SalonUsersManagerProps {
  salonId: string;
  maxUsers: number;
  onUpgrade: () => void;
}

const SalonUsersManager = ({ salonId, maxUsers, onUpgrade }: SalonUsersManagerProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });

  const { salonUsers, loading, fetchSalonUsers, createSalonUser, updateSalonUser, deleteSalonUser } = useSalonUsers();
  const { toast } = useToast();

  useEffect(() => {
    if (salonId) {
      fetchSalonUsers(salonId);
    }
  }, [salonId]);

  const handleCreateUser = async () => {
    if (!newUserData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!newUserData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória",
        variant: "destructive"
      });
      return;
    }

    if (salonUsers.length >= maxUsers) {
      setShowCreateDialog(false);
      setShowUpgradeDialog(true);
      return;
    }

    const result = await createSalonUser(salonId, newUserData);

    if (result.success) {
      setShowCreateDialog(false);
      setNewUserData({ name: '', email: '', phone: '', password: '', role: 'user' });
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    const result = await updateSalonUser(editingUser.id, {
      name: editingUser.name,
      email: editingUser.email,
      phone: editingUser.phone,
      role: editingUser.role
    });

    if (result.success) {
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string, isOwner: boolean) => {
    if (isOwner) {
      toast({
        title: "Erro",
        description: "Não é possível excluir o proprietário",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      await deleteSalonUser(userId);
    }
  };

  const getRoleBadge = (role: string, isOwner: boolean) => {
    if (isOwner) {
      return { label: 'Proprietário', variant: 'default' as const };
    }
    
    const roles = {
      admin: { label: 'Administrador', variant: 'secondary' as const },
      manager: { label: 'Gerente', variant: 'outline' as const },
      user: { label: 'Usuário', variant: 'outline' as const }
    };
    return roles[role as keyof typeof roles] || roles.user;
  };

  const canEditOrDelete = (role: string, isOwner: boolean) => {
    // Apenas administradores podem editar/excluir outros usuários
    // Proprietário não pode ser excluído
    return role === 'admin' && !isOwner;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Gerenciar Usuários</span>
            <Badge variant="secondary">
              {salonUsers.length}/{maxUsers}
            </Badge>
          </CardTitle>
          <Button onClick={() => setShowCreateDialog(true)} disabled={salonUsers.length >= maxUsers}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Apenas usuários com cargo de <strong>Administrador</strong> podem cadastrar e editar outros usuários.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Carregando usuários...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salonUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email || '-'}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadge(user.role, user.is_owner).variant}>
                        {getRoleBadge(user.role, user.is_owner).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          disabled={user.is_owner}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id, user.is_owner)}
                          className="text-red-600"
                          disabled={user.is_owner}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Dialog para Novo Usuário */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
                <label className="block text-sm font-medium mb-2">Email</label>
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
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite uma senha"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cargo</label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData({...newUserData, role: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Importante:</strong> Apenas usuários com cargo de <strong>Administrador</strong> podem cadastrar e editar outros usuários.
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
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
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={editingUser.email || ''}
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
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Usuário</SelectItem>
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
                <span>Limite de Usuários Atingido</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Você atingiu o limite de {maxUsers} usuários do seu plano atual.
              </p>
              <p className="text-sm text-gray-500">
                Faça upgrade para um plano superior para adicionar mais usuários.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowUpgradeDialog(false)} className="flex-1">
                  Fechar
                </Button>
                <Button onClick={onUpgrade} className="flex-1">
                  Fazer Upgrade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SalonUsersManager;
