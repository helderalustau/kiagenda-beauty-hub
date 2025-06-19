
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Star, Zap } from "lucide-react";

const PlanSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState<'bronze' | 'prata' | 'gold'>('bronze');

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'Gratuito',
      description: 'Ideal para começar',
      icon: <Star className="h-8 w-8" />,
      color: 'from-amber-400 to-amber-600',
      features: [
        'Até 4 serviços',
        '1 atendente (administrador)',
        'Até 50 atendimentos/mês',
        'Suporte básico'
      ],
      limitations: [
        'Popup de upgrade a cada 7 dias',
        'Migração obrigatória após limite'
      ]
    },
    {
      id: 'prata',
      name: 'Prata',
      price: 'R$ 50/mês',
      description: 'Para salões em crescimento',
      icon: <Zap className="h-8 w-8" />,
      color: 'from-gray-400 to-gray-600',
      features: [
        'Até 10 serviços',
        'Até 2 atendentes',
        '300 atendimentos/mês',
        'Relatórios básicos',
        'Suporte prioritário'
      ],
      limitations: []
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 'R$ 75/mês',
      description: 'Solução completa',
      icon: <Crown className="h-8 w-8" />,
      color: 'from-yellow-400 to-yellow-600',
      features: [
        'Atendimentos ilimitados',
        'Serviços ilimitados',
        'Até 50 atendentes',
        'Relatórios avançados',
        'Suporte premium 24/7',
        'Integração com pagamentos'
      ],
      limitations: []
    }
  ];

  const handleSelectPlan = () => {
    localStorage.setItem('selectedPlan', selectedPlan);
    window.location.href = '/admin-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Escolha o plano ideal para seu salão
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece gratuitamente e escale conforme seu negócio cresce
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedPlan === plan.id 
                  ? 'ring-4 ring-blue-500 shadow-2xl' 
                  : 'hover:shadow-xl'
              }`}
              onClick={() => setSelectedPlan(plan.id as 'bronze' | 'prata' | 'gold')}
            >
              {plan.id === 'prata' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Mais Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} p-4 text-white mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {plan.price}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Incluído:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Limitações:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="h-2 w-2 bg-amber-500 rounded-full flex-shrink-0" />
                          <span className="text-gray-600 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  className={`w-full mt-6 ${
                    selectedPlan === plan.id
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlan(plan.id as 'bronze' | 'prata' | 'gold');
                  }}
                >
                  {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            onClick={handleSelectPlan}
            className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white px-8 py-3 text-lg"
          >
            Continuar com Plano {plans.find(p => p.id === selectedPlan)?.name}
          </Button>
        </div>

        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-lg p-8 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Funcionalidades por Plano
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-amber-100 p-4 rounded-lg mb-4">
                <Star className="h-8 w-8 text-amber-600 mx-auto" />
              </div>
              <h4 className="font-semibold mb-2">Bronze - Gratuito</h4>
              <p className="text-gray-600 text-sm">
                Perfeito para testar a plataforma e pequenos salões que estão começando
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <Zap className="h-8 w-8 text-gray-600 mx-auto" />
              </div>
              <h4 className="font-semibold mb-2">Prata - R$ 50/mês</h4>
              <p className="text-gray-600 text-sm">
                Ideal para salões estabelecidos que precisam de mais recursos e capacidade
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-lg mb-4">
                <Crown className="h-8 w-8 text-yellow-600 mx-auto" />
              </div>
              <h4 className="font-semibold mb-2">Gold - R$ 75/mês</h4>
              <p className="text-gray-600 text-sm">
                Solução completa para grandes salões com múltiplos atendentes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
