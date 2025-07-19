import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Star, Check, Crown, Diamond, ArrowUp } from "lucide-react";

interface PlanUpgradeModalProps {
  currentPlan: string;
  salonId: string;
  salonName: string;
  onUpgradeRequest: () => void;
}

const plans = {
  bronze: { 
    name: "Bronze", 
    price: 49.90, 
    appointments: 100, 
    features: ["100 agendamentos/mês", "1 usuário", "Suporte básico"],
    icon: Star,
    color: "text-amber-600 bg-amber-50"
  },
  silver: { 
    name: "Prata", 
    price: 89.90, 
    appointments: 300, 
    features: ["300 agendamentos/mês", "3 usuários", "Relatórios básicos", "Suporte prioritário"],
    icon: Crown,
    color: "text-gray-600 bg-gray-50"
  },
  gold: { 
    name: "Ouro", 
    price: 149.90, 
    appointments: 1000, 
    features: ["1000 agendamentos/mês", "5 usuários", "Relatórios avançados", "API de integração", "Suporte VIP"],
    icon: Crown,
    color: "text-yellow-600 bg-yellow-50"
  },
  platinum: { 
    name: "Platinum", 
    price: 299.90, 
    appointments: 99999, 
    features: ["Agendamentos ilimitados", "Usuários ilimitados", "Relatórios completos", "API completa", "Suporte 24/7", "Personalização avançada"],
    icon: Diamond,
    color: "text-purple-600 bg-purple-50"
  }
};

const PlanUpgradeModal = ({ currentPlan, salonId, salonName, onUpgradeRequest }: PlanUpgradeModalProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const currentPlanIndex = Object.keys(plans).indexOf(currentPlan);
  const availablePlans = Object.entries(plans).slice(currentPlanIndex + 1);

  const handleSubmitUpgrade = async () => {
    if (!selectedPlan || !justification.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um plano e forneça uma justificativa.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Criar solicitação de upgrade no banco
      const { error } = await supabase
        .from('plan_upgrade_requests')
        .insert({
          salon_id: salonId,
          salon_name: salonName,
          current_plan: currentPlan,
          requested_plan: selectedPlan,
          justification: justification.trim(),
          status: 'pending',
          requested_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "✅ Solicitação Enviada!",
        description: "Sua solicitação de upgrade foi enviada para análise do superadministrador.",
        duration: 5000
      });

      setIsOpen(false);
      setSelectedPlan('');
      setJustification('');
      onUpgradeRequest();

    } catch (error) {
      console.error('Error submitting upgrade request:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full mt-4 border-primary text-primary hover:bg-primary/10"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Solicitar Upgrade de Plano
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade de Plano</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Plano atual: <Badge className={plans[currentPlan as keyof typeof plans].color}>
              {plans[currentPlan as keyof typeof plans].name}
            </Badge>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Planos disponíveis */}
          <div>
            <Label className="text-base font-semibold">Escolha o novo plano:</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              {availablePlans.map(([planKey, plan]) => {
                const Icon = plan.icon;
                return (
                  <Card 
                    key={planKey}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedPlan === planKey 
                        ? 'border-primary bg-primary/5 shadow-lg' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlan(planKey)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-primary" />
                          {plan.name}
                        </div>
                        <Badge className={plan.color}>
                          {formatCurrency(plan.price)}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {plan.appointments === 99999 ? 'Ilimitados' : plan.appointments} agendamentos/mês
                        </p>
                        <ul className="text-xs space-y-1">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {selectedPlan === planKey && (
                        <div className="mt-3 p-2 bg-primary/10 rounded-lg">
                          <p className="text-xs text-primary font-medium">✓ Plano selecionado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Justificativa */}
          <div>
            <Label htmlFor="justification" className="text-base font-semibold">
              Justificativa para o upgrade:
            </Label>
            <Textarea
              id="justification"
              placeholder="Explique por que precisa fazer o upgrade do plano (crescimento do negócio, mais clientes, necessidades específicas, etc.)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              className="mt-2 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {justification.length}/500 caracteres
            </p>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitUpgrade}
              disabled={!selectedPlan || !justification.trim() || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                'Solicitar Upgrade'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlanUpgradeModal;