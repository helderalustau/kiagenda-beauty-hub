
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Scissors, Plus, LogOut, BarChart3, Users, Settings } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import SuperAdminStats from '@/components/SuperAdminStats';
import SuperAdminSalonManager from '@/components/SuperAdminSalonManager';

const SuperAdminDashboard = () => {
  const { salons, dashboardStats, fetchAllSalons, fetchDashboardStats, createSalon, loading } = useSupabaseData();
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
    fetchDashboardStats();
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
      fetchDashboardStats();
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

  const handleRefresh = () => {
    fetchAllSalons();
    fetchDashboardStats();
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
                  Super Admin Dashboard
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="salons" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Estabelecimentos</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Visão Geral do Negócio
                </h2>
                <p className="text-lg text-gray-600">
                  Acompanhe as métricas e performance de todos os estabelecimentos
                </p>
              </div>
              <Button 
                onClick={handleRefresh}
                variant="outline"
              >
                Atualizar Dados
              </Button>
            </div>
            
            <SuperAdminStats stats={dashboardStats} loading={loading} />
          </TabsContent>

          <TabsContent value="salons" className="space-y-6">
            <div className="flex items-center justify-between">
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

            <SuperAdminSalonManager 
              salons={salons} 
              loading={loading} 
              onRefresh={handleRefresh} 
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Configurações do Sistema
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Configure as opções globais do sistema
              </p>
            </div>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0">
              <CardHeader>
                <CardTitle>Configurações de Planos</CardTitle>
                <CardDescription>
                  Valores e configurações dos planos de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-amber-800">Plano Bronze</h4>
                    <p className="text-sm text-gray-600">Básico</p>
                    <p className="text-lg font-bold text-amber-800">R$ 29,90/mês</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-800">Plano Prata</h4>
                    <p className="text-sm text-gray-600">Intermediário</p>
                    <p className="text-lg font-bold text-gray-800">R$ 59,90/mês</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-yellow-800">Plano Gold</h4>
                    <p className="text-sm text-gray-600">Premium</p>
                    <p className="text-lg font-bold text-yellow-800">R$ 99,90/mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
