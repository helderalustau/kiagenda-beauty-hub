
import React from 'react';
import { PlanConfiguration } from '@/hooks/useSupabaseData';
import PlanConfigurationManager from '@/components/PlanConfigurationManager';
import SuperAdminSupportSettings from './SuperAdminSupportSettings';

interface SuperAdminSettingsTabProps {
  planConfigurations: PlanConfiguration[];
  onRefreshPlanConfigurations: () => void;
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
        <p className="text-lg text-gray-600">
          Gerencie as configurações globais do sistema
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SuperAdminSupportSettings />
        
        <div className="md:col-span-2">
          <PlanConfigurationManager 
            planConfigurations={planConfigurations}
            onRefresh={onRefreshPlanConfigurations}
          />
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettingsTab;
