import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, ArrowRight } from "lucide-react";
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface PlanUpgradeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  salonId: string;
  salonName: string;
}

const PlanUpgradeRequestModal = ({ 
  isOpen, 
  onClose, 
  currentPlan, 
  salonId, 
  salonName 
}: PlanUpgradeRequestModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [justification, setJustification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { getAllPlansInfo } = usePlanConfigurations();
  const { toast } = useToast();

  const plans = getAllPlansInfo();
  const availableUpgrades = plans.filter(plan => {
    const currentIndex = plans.findIndex(p => p.plan_type === currentPlan);
    const planIndex = plans.findIndex(p => p.plan_type === plan.plan_type);
    return planIndex > currentIndex;
  });

  const handleSubmitRequest = async () => {
    if (!selectedPlan || !justification.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um plano e adicione uma justificativa.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('create_plan_upgrade_request', {
        p_salon_id: salonId,
        p_salon_name: salonName,
        p_current_plan: currentPlan,
        p_requested_plan: selectedPlan,
        p_justification: justification.trim()
      });

      if (error) throw error;

      toast({
        title: "Solicitação Enviada",
        description: "Sua solicitação de upgrade foi enviada ao super administrador. Você receberá uma resposta em breve.",
      });

      onClose();
      setSelectedPlan('');
      setJustification('');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPlanInfo = plans.find(p => p.plan_type === selectedPlan);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Solicitar Upgrade de Plano
          </DialogTitle>
          <DialogDescription className="text-center">
            Selecione o plano desejado e justifique sua necessidade de upgrade.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Planos Disponíveis */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700">Planos Disponíveis para Upgrade:</h3>
            <div className="grid gap-3">
              {availableUpgrades.map((plan) => (
                <Card 
                  key={plan.plan_type}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedPlan === plan.plan_type 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.plan_type)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {plan.name}
                        {selectedPlan === plan.plan_type && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </CardTitle>
                      <Badge variant={plan.plan_type === 'gold' ? 'default' : 'secondary'}>
                        R$ {plan.price}/mês
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Até {plan.max_appointments} agendamentos/mês</p>
                      <p>• Até {plan.max_attendants} atendentes</p>
                      <p>• {plan.max_users} usuários no sistema</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Comparação com Plano Atual */}
          {selectedPlanInfo && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Benefícios do Upgrade
              </h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• Aumento de agendamentos: {selectedPlanInfo.max_appointments - plans.find(p => p.plan_type === currentPlan)!.max_appointments} a mais por mês</p>
                <p>• Mais atendentes: {selectedPlanInfo.max_attendants} (atual: {plans.find(p => p.plan_type === currentPlan)!.max_attendants})</p>
                <p>• Sem interrupções por limite atingido</p>
              </div>
            </div>
          )}

          {/* Justificativa */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Justificativa para o Upgrade *
            </label>
            <Textarea
              placeholder="Explique por que você precisa fazer o upgrade do seu plano..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500">
              Detalhe suas necessidades para acelerar a aprovação da solicitação.
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Processo de Aprovação:</strong> Sua solicitação será analisada pelo super administrador. 
              Após a aprovação, seu plano será atualizado automaticamente e sua loja poderá ser reaberta.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="flex-1"
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmitRequest}
            disabled={!selectedPlan || !justification.trim() || submitting}
            className="flex-1"
          >
            {submitting ? 'Enviando...' : 'Enviar Solicitação'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeRequestModal;