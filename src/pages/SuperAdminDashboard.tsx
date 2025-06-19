
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, MapPin, Phone, Crown, Scissors, Plus, Trash2, Edit, LogOut } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

const SuperAdminDashboard = () => {
  const { salons, fetchAllSalons, createSalon, deleteSalon, loading } = useSupabaseData();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSalon, setNewSalon] = useState({
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    plan: 'bronze' as 'bronze' | 'prata' | 'gold'
  });

  useEffect(() => {
    fetchAllSalons();
  }, []);

  const handleCreateSalon = async () => {
    if (!newSalon.name || !newSalon.owner_name || !newSalon.phone || !newSalon.address) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const result = await createSalon(newSalon);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Estabelecimento criado com sucesso!"
      });
      setShowCreateDialog(false);
      setNewSalon({
        name: '',
        owner_name: '',
        phone: '',
        address: '',
        plan: 'bronze'
      });
      fetchAllSalons();
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteSalon = async (salonId: string) => {
    const result = await deleteSalon(salonId);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Estabelecimento excluído com sucesso!"
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('adminData');
    window.location.href = '/';
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'bg-amber-100 text-amber-800';
      case 'prata': return 'bg-gray-100 text-gray-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanName = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'Bronze';
      case 'prata': return 'Prata';
      case 'gold': return 'Gold';
      default: return 'Bronze';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  Painel Super Admin
                </h1>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Gerenciar Estabelecimentos
            </h2>
            <p className="text-lg text-gray-600">
              Gerencie todos os estabelecimentos cadastrados no sistema
            </p>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Novo Estabelecimento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Estabelecimento</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo estabelecimento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salon-name">Nome do Estabelecimento *</Label>
                  <Input
                    id="salon-name"
                    value={newSalon.name}
                    onChange={(e) => setNewSalon({...newSalon, name: e.target.value})}
                    placeholder="Nome do salão"
                  />
                </div>
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
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={newSalon.address}
                    onChange={(e) => setNewSalon({...newSalon, address: e.target.value})}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateSalon}>
                  Criar Estabelecimento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {salons.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8 max-w-md mx-auto">
              <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum estabelecimento encontrado
              </h3>
              <p className="text-gray-600">
                Crie o primeiro estabelecimento clicando no botão acima.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <Card key={salon.id} className="bg-white/80 backdrop-blur-sm border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {salon.name}
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        {salon.owner_name}
                      </CardDescription>
                    </div>
                    <Badge className={`ml-2 ${getPlanColor(salon.plan)}`}>
                      <Crown className="h-3 w-3 mr-1" />
                      {getPlanName(salon.plan)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{salon.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{salon.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        localStorage.setItem('selectedSalonId', salon.id);
                        window.location.href = '/admin-dashboard';
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Gerenciar
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o estabelecimento "{salon.name}"? 
                            Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSalon(salon.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
