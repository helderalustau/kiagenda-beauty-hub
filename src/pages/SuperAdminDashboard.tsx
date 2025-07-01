
import React, { useEffect, useCallback, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, Settings } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import SuperAdminDashboardHeader from '@/components/SuperAdminDashboardHeader';
import SuperAdminOverviewTab from '@/components/super-admin/SuperAdminOverviewTab';
import SuperAdminSalonsTab from '@/components/super-admin/SuperAdminSalonsTab';
import SuperAdminSettingsTab from '@/components/super-admin/SuperAdminSettingsTab';
import { useSuperAdminActions } from '@/hooks/super-admin/useSuperAdminActions';
import SuperAdminProtection from '@/components/SuperAdminProtection';

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

  // Memoize the data loading functions to prevent unnecessary re-renders
  const loadInitialData = useCallback(() => {
    console.log('SuperAdminDashboard - Loading initial data...');
    Promise.all([
      fetchAllSalons(),
      fetchDashboardStats(),
      fetchPlanConfigurations()
    ]).then(() => {
      console.log('SuperAdminDashboard - Initial data loaded');
    }).catch(error => {
      console.error('SuperAdminDashboard - Error loading initial data:', error);
    });
  }, [fetchAllSalons, fetchDashboardStats, fetchPlanConfigurations]);

  // Load data only once on mount
  useEffect(() => {
    loadInitialData();
  }, []); // Remove dependencies to prevent re-loading

  // Memoize the dashboard stats and salons to prevent unnecessary re-renders
  const memoizedStats = useMemo(() => dashboardStats, [dashboardStats]);
  const memoizedSalons = useMemo(() => salons, [salons]);
  const memoizedPlanConfigurations = useMemo(() => planConfigurations, [planConfigurations]);

  const DashboardContent = () => {
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
                dashboardStats={memoizedStats}
                loading={loading}
                onRefresh={handleRefresh}
              />
            </TabsContent>

            <TabsContent value="salons">
              <SuperAdminSalonsTab 
                salons={memoizedSalons}
                loading={loading}
                onRefresh={handleRefresh}
                onCreateSalon={handleCreateSalon}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="settings">
              <SuperAdminSettingsTab 
                planConfigurations={memoizedPlanConfigurations}
                onRefreshPlanConfigurations={fetchPlanConfigurations}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <SuperAdminProtection fallbackPath="/admin-login">
      <DashboardContent />
    </SuperAdminProtection>
  );
};

export default SuperAdminDashboard;
