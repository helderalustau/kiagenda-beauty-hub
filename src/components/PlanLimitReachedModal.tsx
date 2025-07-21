import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Crown, TrendingUp } from "lucide-react";
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';

interface PlanLimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  currentAppointments: number;
  maxAppointments: number;
  onUpgrade?: () => void;
}

const PlanLimitReachedModal = ({ 
  isOpen, 
  onClose, 
  currentPlan, 
  currentAppointments, 
  maxAppointments,
  onUpgrade 
}: PlanLimitReachedModalProps) => {
  const { getAllPlansInfo } = usePlanConfigurations();
  const plans = getAllPlansInfo();
  
  const getNextPlan = () => {
    const currentIndex = plans.findIndex(p => p.plan_type === currentPlan);
    return currentIndex < plans.length - 1 ? plans[currentIndex + 1] : null;
  };

  const nextPlan = getNextPlan();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-red-600 flex items-center justify-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Limite de Agendamentos Atingido
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">
                Você atingiu o limite de <strong>{maxAppointments} agendamentos</strong> do plano {currentPlan.toUpperCase()}.
              </p>
              <p className="text-red-700 text-sm mt-2">
                Agendamentos utilizados: {currentAppointments}/{maxAppointments}
              </p>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-amber-800">
                <strong>Seu estabelecimento foi automaticamente fechado</strong> para novos agendamentos.
              </p>
            </div>

            {nextPlan && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Solução: Upgrade para {nextPlan.name}</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• Até {nextPlan.max_appointments} agendamentos/mês</p>
                  <p>• {nextPlan.max_attendants} atendentes</p>
                  <p>• Por apenas {nextPlan.price}/mês</p>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {onUpgrade && nextPlan && (
            <Button 
              onClick={onUpgrade} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Fazer Upgrade para {nextPlan.name}
            </Button>
          )}
          
          <Button onClick={onClose} variant="outline" className="w-full">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanLimitReachedModal;