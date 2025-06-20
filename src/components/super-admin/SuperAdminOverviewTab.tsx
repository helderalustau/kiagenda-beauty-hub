
import React from 'react';
import { Button } from "@/components/ui/button";
import SuperAdminStats from '@/components/SuperAdminStats';
import { DashboardStats } from '@/hooks/useSupabaseData';

interface SuperAdminOverviewTabProps {
  dashboardStats: DashboardStats;
  loading: boolean;
  onRefresh: () => void;
}

const SuperAdminOverviewTab = ({ dashboardStats, loading, onRefresh }: SuperAdminOverviewTabProps) => {
  return (
    <div className="space-y-6">
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
          onClick={onRefresh}
          variant="outline"
        >
          Atualizar Dados
        </Button>
      </div>
      
      <SuperAdminStats stats={dashboardStats} loading={loading} />
    </div>
  );
};

export default SuperAdminOverviewTab;
