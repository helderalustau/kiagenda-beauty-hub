import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePlanLimitsChecker } from '@/hooks/usePlanLimitsChecker';
import { RefreshCw, Bug } from "lucide-react";

interface PlanLimitDebugPanelProps {
  salonId: string;
  salonName: string;
  currentPlan: string;
  isOpen: boolean;
}

const PlanLimitDebugPanel = ({ salonId, salonName, currentPlan, isOpen }: PlanLimitDebugPanelProps) => {
  const { getSalonAppointmentStats, checkAndEnforcePlanLimits } = usePlanLimitsChecker();
  const [stats, setStats] = useState<any>(null);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const refreshStats = async () => {
    setChecking(true);
    try {
      const result = await getSalonAppointmentStats(salonId);
      console.log('🔍 Debug stats:', result);
      setStats(result);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
    } finally {
      setChecking(false);
    }
  };

  const testLimitEnforcement = async () => {
    setChecking(true);
    try {
      const result = await checkAndEnforcePlanLimits(salonId);
      console.log('🔒 Debug enforcement:', result);
      await refreshStats();
    } catch (error) {
      console.error('Erro ao testar enforcement:', error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      refreshStats();
    }
  }, [salonId]);

  if (!stats) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span>Carregando estatísticas de debug...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Debug - Limites de Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Salão:</strong> {salonName}
          </div>
          <div>
            <strong>Plano:</strong> {currentPlan.toUpperCase()}
          </div>
          <div>
            <strong>Status:</strong> 
            <Badge variant={isOpen ? "default" : "secondary"} className="ml-2">
              {isOpen ? 'Aberto' : 'Fechado'}
            </Badge>
          </div>
          <div>
            <strong>Última verificação:</strong> {lastCheck?.toLocaleTimeString()}
          </div>
        </div>

        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium mb-2">Estatísticas de Agendamentos:</h4>
          <div className="space-y-1 text-sm">
            <div>Agendamentos: {stats.currentAppointments || 0}/{stats.maxAppointments || 0}</div>
            <div>Percentual: {stats.percentage || 0}%</div>
            <div>Limite atingido: {stats.limitReached ? '✅ SIM' : '❌ NÃO'}</div>
            <div>Próximo do limite: {stats.nearLimit ? '⚠️ SIM' : '✅ NÃO'}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={refreshStats} 
            disabled={checking}
            size="sm"
            variant="outline"
          >
            {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Atualizar Stats
          </Button>
          <Button 
            onClick={testLimitEnforcement} 
            disabled={checking}
            size="sm"
            variant="outline"
          >
            Testar Enforcement
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanLimitDebugPanel;