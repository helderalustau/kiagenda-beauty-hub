
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Zap, Star, Check, ArrowUp } from "lucide-react";

interface PlanUpgradeButtonProps {
  currentPlan: 'bronze' | 'prata' | 'gold';
  onUpgrade?: (newPlan: string) => void;
}

const PlanUpgradeButton = ({ currentPlan, onUpgrade }: PlanUpgradeButtonProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'R$ 29,90',
      icon: <Star className="h-6 w-6" />,
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      features: [
        'Até 1 atendente',
        'Agendamentos básicos',
        'Suporte por email'
      ]
    },
    {
      id: 'prata',
      name: 'Prata',
      price: 'R$ 59,90',
      icon: <Zap className="h-6 w-6" />,
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      popular: true,
      features: [
        'Até 3 atendentes',
        'Notificações em tempo real',
        'Relatórios avançados',
        'Suporte prioritário'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 'R$ 99,90',
      icon: <Crown className="h-6 w-6" />,
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      features: [
        'Atendentes ilimitados',
        'Personalização completa',
        'API integrations',
        'Suporte 24/7',
        'Relatórios personalizados'
      ]
    }
  ];

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) {
      toast({
        title: "Plano Atual",
        description: "Você já está no plano " + planId.charAt(0).toUpperCase() + planId.slice(1),
      });
      return;
    }

    // Aqui você implementaria a lógica de upgrade real
    toast({
      title: "🚀 Upgrade Solicitado!",
      description: `Solicitação de upgrade para o plano ${planId.charAt(0).toUpperCase() + planId.slice(1)} enviada. Entraremos em contato em breve.`,
      duration: 5000
    });

    onUpgrade?.(planId);
    setIsDialogOpen(false);
  };

  const canUpgrade = currentPlan !== 'gold';

  if (!canUpgrade) {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Crown className="h-3 w-3 mr-1" />
        Plano Premium
      </Badge>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        className="text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        <ArrowUp className="h-4 w-4 mr-1" />
        Upgrade
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              Escolha seu Plano
            </DialogTitle>
            <p className="text-center text-gray-600">
              Faça upgrade e desbloqueie recursos avançados para seu estabelecimento
            </p>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative transition-all cursor-pointer hover:shadow-lg ${
                  plan.id === currentPlan ? 'ring-2 ring-blue-500' : ''
                } ${plan.popular ? 'ring-2 ring-green-500' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                {plan.id === currentPlan && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-blue-600 text-white">
                      Plano Atual
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${plan.color}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-blue-600">{plan.price}</div>
                  <p className="text-sm text-gray-500">por mês</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    className="w-full"
                    variant={plan.id === currentPlan ? "outline" : "default"}
                    disabled={plan.id === currentPlan}
                  >
                    {plan.id === currentPlan ? 'Plano Atual' : 'Escolher Plano'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Dúvidas sobre os planos?</strong><br />
              Entre em contato conosco pelo WhatsApp: <strong>(11) 99999-9999</strong>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlanUpgradeButton;
