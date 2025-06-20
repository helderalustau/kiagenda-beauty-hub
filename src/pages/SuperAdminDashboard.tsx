
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Settings } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SuperAdminDashboardHeader from '@/components/SuperAdminDashboardHeader';
import SuperAdminOverviewTab from '@/components/super-admin/SuperAdminOverviewTab';
import SuperAdminSalonsTab from '@/components/super-admin/SuperAdminSalonsTab';
import SuperAdminSettingsTab from '@/components/super-admin/SuperAdminSettingsTab';
import { useSuperAdminActions } from '@/hooks/super-admin/useSuperAdminActions';

const SuperAdminDashboard = () => {
  const { 
    salons, 
    dashboardStats, 
    planConfigurations,
    fetchAllSalons, 
    fetchDashboardStats, 
    fetchPlanConfigurations,
    loading 
  } = useSupabaseData();

  const {
    isSubmitting,
    handleCreateSalon,
    handleCleanupSalons,
    handleLogout,
    handleRefresh,
    handleBackToHome
  } = useSuperAdminActions();

  useEffect(() => {
    console.log('SuperAdminDashboard - Carregando dados iniciais...');
    fetchAllSalons();
    fetchDashboardStats();
    fetchPlanConfigurations();
  }, []);

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

          <TabsContent value="overview">
            <SuperAdminOverviewTab 
              dashboardStats={dashboardStats}
              loading={loading}
              onRefresh={handleRefresh}
            />
          </TabsContent>

          <TabsContent value="salons">
            <SuperAdminSalonsTab 
              salons={salons}
              loading={loading}
              onRefresh={handleRefresh}
              onCreateSalon={handleCreateSalon}
              isSubmitting={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SuperAdminSettingsTab 
              planConfigurations={planConfigurations}
              onRefreshPlanConfigurations={fetchPlanConfigurations}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
