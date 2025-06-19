import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader } from "@/components/ui/dialog";

interface Plan {
  id: string;
  name: string;
  price: string;
  color: string;
  popular?: boolean;
  features: string[];
  limitations: string;
}

const PlanSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'Gratuito',
      color: 'from-amber-400 to-amber-600',
      features: [
        'Até 4 serviços',
        '1 atendente (admin)',
        'Até 50 atendimentos/mês',
        'Suporte básico'
      ],
      limitations: 'Limite de 50 atendimentos mensais'
    },
    {
      id: 'prata',
      name: 'Prata',
      price: 'R$ 50/mês',
      color: 'from-gray-400 to-gray-600',
      popular: true,
      features: [
        'Até 10 serviços',
        'Até 2 atendentes',
        '300 atendimentos mensais',
        'Relatórios detalhados',
        'Suporte prioritário'
      ],
      limitations: 'Limite de 300 atendimentos mensais'
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 'R$ 75/mês',
      color: 'from-yellow-400 to-yellow-600',
      features: [
        'Atendimentos ilimitados',
        'Serviços ilimitados',
        'Até 50 atendentes',
        'Relatórios avançados',
        'Suporte premium 24/7',
        'Integrações avançadas'
      ],
      limitations: 'Sem limitações'
    }
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmation(true);
  };

  const handleConfirmPlan = () => {
    console.log(`Plano ${selectedPlan} selecionado`);
    // Aqui seria implementada a lógica de atualização do plano no Supabase
    setShowConfirmation(false);
    window.location.href = '/admin-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  Escolha seu Plano
                </h1>
                <p className="text-sm text-gray-600">Selecione o plano ideal para seu salão</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
            >
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Planos que crescem com seu negócio
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Escolha o plano perfeito para as necessidades do seu salão. 
            Você pode fazer upgrade a qualquer momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-pink-500 text-white text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}
              
              <CardHeader className={`bg-gradient-to-r ${plan.color} text-white ${plan.popular ? 'pt-12' : ''}`}>
                <div className="text-center">
                  <Crown className="h-12 w-12 mx-auto mb-4" />
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold mt-2">{plan.price}</div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Limitações:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {plan.limitations}
                  </p>
                </div>

                <Button 
                  className="w-full"
                  size="lg"
                  onClick={() => handlePlanSelect(plan.id)}
                  variant={plan.popular ? "default" : "outline"}
                >
                  Selecionar {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparação de Recursos */}
        <div className="mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Comparação Detalhada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Recursos</th>
                      <th className="text-center p-4">Bronze</th>
                      <th className="text-center p-4">Prata</th>
                      <th className="text-center p-4">Gold</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Serviços cadastrados</td>
                      <td className="text-center p-4">4</td>
                      <td className="text-center p-4">10</td>
                      <td className="text-center p-4">Ilimitado</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Atendentes</td>
                      <td className="text-center p-4">1</td>
                      <td className="text-center p-4">2</td>
                      <td className="text-center p-4">50</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Atendimentos mensais</td>
                      <td className="text-center p-4">50</td>
                      <td className="text-center p-4">300</td>
                      <td className="text-center p-4">Ilimitado</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Relatórios</td>
                      <td className="text-center p-4">Básico</td>
                      <td className="text-center p-4">Detalhado</td>
                      <td className="text-center p-4">Avançado</td>
                    </tr>
                    <tr>
                      <td className="p-4">Suporte</td>
                      <td className="text-center p-4">Básico</td>
                      <td className="text-center p-4">Prioritário</td>
                      <td className="text-center p-4">Premium 24/7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Plano</DialogTitle>
            <DialogDescription>
              Você selecionou o plano {plans.find(p => p.id === selectedPlan)?.name}. Deseja confirmar?
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPlan}
              className="flex-1"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanSelection;
