
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ArrowUp, Check } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface PlanUpgradeCardProps {
  currentPlan: string;
}

const PlanUpgradeCard = ({ currentPlan }: PlanUpgradeCardProps) => {
  const navigate = useNavigate();

  const plans = {
    bronze: { name: 'Bronze', color: 'bg-amber-100 text-amber-800', order: 1 },
    prata: { name: 'Prata', color: 'bg-gray-100 text-gray-800', order: 2 },
    gold: { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', order: 3 }
  };

  const currentPlanInfo = plans[currentPlan as keyof typeof plans] || plans.bronze;
  
  const availableUpgrades = Object.entries(plans).filter(
    ([key, plan]) => plan.order > currentPlanInfo.order
  );

  const handleUpgrade = () => {
    navigate('/plan-upgrade');
  };

  if (availableUpgrades.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
        <CardContent className="p-6 text-center">
          <Crown className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
          <h3 className="font-semibold text-yellow-800 mb-2">Plano Premium Ativo</h3>
          <p className="text-sm text-yellow-700 mb-3">
            Você já possui o plano mais avançado disponível!
          </p>
          <Badge className="bg-yellow-200 text-yellow-800">
            <Crown className="h-3 w-3 mr-1" />
            {currentPlanInfo.name}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ArrowUp className="h-5 w-5 text-blue-600" />
          Upgrade de Plano
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Plano Atual:</p>
            <Badge className={currentPlanInfo.color}>
              <Crown className="h-3 w-3 mr-1" />
              {currentPlanInfo.name}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Upgrades Disponíveis:</p>
            <p className="font-semibold text-blue-600">{availableUpgrades.length}</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-gray-700">Benefícios do upgrade:</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Mais funcionalidades
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Suporte prioritário
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3 w-3 text-green-500" />
              Recursos avançados
            </li>
          </ul>
        </div>
        
        <Button 
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <ArrowUp className="h-4 w-4 mr-2" />
          Ver Planos Disponíveis
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlanUpgradeCard;
