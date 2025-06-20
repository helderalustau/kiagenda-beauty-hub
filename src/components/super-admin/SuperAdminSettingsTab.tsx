
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PlanConfigurationManager from '@/components/PlanConfigurationManager';
import { PlanConfiguration } from '@/hooks/useSupabaseData';

interface SuperAdminSettingsTabProps {
  planConfigurations: PlanConfiguration[];
  onRefreshPlanConfigurations: () => Promise<void>;
}

const SuperAdminSettingsTab = ({ 
  planConfigurations, 
  onRefreshPlanConfigurations 
}: SuperAdminSettingsTabProps) => {
  return (
    <div className="space-y-6">
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
            onRefresh={onRefreshPlanConfigurations}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminSettingsTab;
