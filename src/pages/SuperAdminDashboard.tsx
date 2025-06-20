import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Settings } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import SuperAdminStats from '@/components/SuperAdminStats';
import SuperAdminSalonManager from '@/components/SuperAdminSalonManager';
import PlanConfigurationManager from '@/components/PlanConfigurationManager';
import SuperAdminCreateSalonDialog from '@/components/SuperAdminCreateSalonDialog';
import SuperAdminDashboardHeader from '@/components/SuperAdminDashboardHeader';

const SuperAdminDashboard = () => {
  const { 
    salons, 
    dashboardStats, 
    planConfigurations,
    fetchAllSalons, 
    fetchDashboardStats, 
    fetchPlanConfigurations,
    createSalon, 
    uploadSalonBanner,
    cleanupSalonsWithoutAdmins,
    loading 
  } = useSupabaseData();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log('SuperAdminDashboard - Carregando dados iniciais...');
    fetchAllSalons();
    fetchDashboardStats();
    fetchPlanConfigurations();
  }, []);

  const validateForm = (salonData: any) => {
    const errors = [];
    
    if (!salonData.owner_name.trim()) {
      errors.push('Nome do responsável é obrigatório');
    }
    if (!salonData.phone.trim()) {
      errors.push('Telefone é obrigatório');
    }

    return errors;
  };

  const handleCreateSalon = async (salonData: any, bannerFile: File | null) => {
    const validationErrors = validateForm(salonData);
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    console.log('Starting salon creation process...');

    try {
      const result = await createSalon(salonData);
      console.log('Create salon result:', result);
      
      if (result.success && 'salon' in result && result.salon) {
        console.log('Salon created successfully, ID:', result.salon.id);

        toast({
          title: "Sucesso",
          description: "Estabelecimento criado com sucesso! Configure-o na próxima etapa."
        });
        
        // Refresh data
        fetchAllSalons();
        fetchDashboardStats();
      } else {
        const errorMessage = 'message' in result ? result.message : 'Erro desconhecido';
        console.error('Failed to create salon:', errorMessage);
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Unexpected error in handleCreateSalon:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCleanupSalons = async () => {
    const result = await cleanupSalonsWithoutAdmins();
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: `${result.deletedCount} estabelecimento(s) sem administradores foram removidos`
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
    fetchPlanConfigurations();
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (loading && !salons.length) {
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
      <SuperAdminDashboardHeader 
        onBackToHome={handleBackToHome}
        onCleanupSalons={handleCleanupSalons}
        onLogout={handleLogout}
      />

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

              <SuperAdminCreateSalonDialog
                onCreateSalon={handleCreateSalon}
                isSubmitting={isSubmitting}
              />
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
                  Edite os valores, nomes e descrições dos planos de assinatura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanConfigurationManager 
                  configurations={planConfigurations}
                  onRefresh={fetchPlanConfigurations}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
