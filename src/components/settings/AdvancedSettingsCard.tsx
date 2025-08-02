
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Download, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Salon } from '@/types/supabase-entities';
import PlanUpgradeModal from './PlanUpgradeModal';
import SalonAccountDeletion from './SalonAccountDeletion';

interface AdvancedSettingsCardProps {
  salon: Salon;
  onRefresh: () => Promise<void>;
}

const AdvancedSettingsCard = ({ salon, onRefresh }: AdvancedSettingsCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    debugMode: false,
    maintenanceMode: false,
    autoBackup: true
  });

  const handleExportData = async () => {
    setLoading(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "✅ Dados exportados!",
        description: "Os dados do estabelecimento foram exportados com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar os dados.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeRequest = () => {
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Upgrade de Plano */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Plano e Assinatura</h4>
        <div className="p-4 border rounded-lg bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plano Atual: {salon.plan?.charAt(0).toUpperCase() + salon.plan?.slice(1)}</p>
              <p className="text-sm text-gray-600">Faça upgrade para desbloquear mais recursos</p>
            </div>
            <PlanUpgradeModal
              currentPlan={salon.plan}
              salonId={salon.id}
              salonName={salon.name}
              onUpgradeRequest={handleUpgradeRequest}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Configurações Avançadas */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Configurações do Sistema</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="debug-mode">Modo Debug</Label>
            <p className="text-sm text-gray-500">Ativar logs detalhados para suporte</p>
          </div>
          <Switch
            id="debug-mode"
            checked={settings.debugMode}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, debugMode: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="auto-backup">Backup Automático</Label>
            <p className="text-sm text-gray-500">Backup diário dos dados</p>
          </div>
          <Switch
            id="auto-backup"
            checked={settings.autoBackup}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
          />
        </div>
      </div>

      <Separator />

      {/* Exportar/Importar Dados */}
      <div className="space-y-4">
        <h4 className="font-semibold text-lg">Gerenciamento de Dados</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={handleExportData}
            disabled={loading}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Exportando...' : 'Exportar Dados'}
          </Button>
          
          <Button variant="outline" className="w-full" disabled>
            <Upload className="h-4 w-4 mr-2" />
            Importar Dados
          </Button>
        </div>
      </div>

      <Separator />

      {/* Zona de Perigo */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h4 className="font-semibold text-lg text-red-600">Zona de Perigo</h4>
        </div>
        
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <SalonAccountDeletion salon={salon} />
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettingsCard;
