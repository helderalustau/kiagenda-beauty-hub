
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Crown, ArrowLeft, Send, Check, Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

const PlanUpgrade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [clientData, setClientData] = useState<any>(null);
  const [currentPlan, setCurrentPlan] = useState('bronze');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'bronze',
      name: 'Bronze',
      price: 'R$ 29,90/mês',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      features: [
        'Agendamentos básicos',
        'Suporte por email',
        'Dashboard básico',
        'Até 50 agendamentos/mês'
      ]
    },
    {
      id: 'prata',
      name: 'Prata',
      price: 'R$ 59,90/mês',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      popular: true,
      features: [
        'Agendamentos avançados',
        'Suporte prioritário',
        'Dashboard completo',
        'Até 200 agendamentos/mês',
        'Relatórios básicos',
        'Integração WhatsApp'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: 'R$ 99,90/mês',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      features: [
        'Agendamentos ilimitados',
        'Suporte 24/7',
        'Dashboard premium',
        'Relatórios avançados',
        'Múltiplas integrações',
        'Marketing automático',
        'API personalizada',
        'Treinamento exclusivo'
      ]
    }
  ];

  useEffect(() => {
    const clientAuth = localStorage.getItem('clientAuth');
    if (!clientAuth) {
      navigate('/client-login');
      return;
    }

    try {
      const userData = JSON.parse(clientAuth);
      setClientData(userData);
      // Here you would fetch the current plan from the database
      // For now, we'll assume bronze as default
      setCurrentPlan('bronze');
    } catch (error) {
      console.error('Error parsing client auth:', error);
      navigate('/client-login');
    }
  }, [navigate]);

  const handlePlanSelect = (planId: string) => {
    if (planId === currentPlan) return;
    setSelectedPlan(planId);
  };

  const handleSubmitRequest = async () => {
    if (!selectedPlan) {
      toast({
        title: "Erro",
        description: "Selecione um plano para continuar.",
        variant: "destructive"
      });
      return;
    }

    if (!justification.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, explique o motivo da solicitação.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create upgrade request for super admin approval
      const { error } = await supabase
        .from('plan_upgrade_requests')
        .insert({
          client_id: clientData.id,
          client_name: clientData.name,
          current_plan: currentPlan,
          requested_plan: selectedPlan,
          justification: justification,
          status: 'pending',
          request_date: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitação Enviada",
        description: "Sua solicitação de upgrade foi enviada para aprovação do administrador.",
      });

      navigate('/client-dashboard');
    } catch (error) {
      console.error('Error submitting upgrade request:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPlanInfo = () => {
    return plans.find(plan => plan.id === currentPlan);
  };

  const isUpgrade = (planId: string) => {
    const planOrder = { bronze: 1, prata: 2, gold: 3 };
    return planOrder[planId as keyof typeof planOrder] > planOrder[currentPlan as keyof typeof planOrder];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate('/client-dashboard')}
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upgrade de Plano
              </h1>
              <p className="text-gray-600">Escolha o plano ideal para suas necessidades</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Current Plan */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-blue-600" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={getCurrentPlanInfo()?.color}>
                {getCurrentPlanInfo()?.name}
              </Badge>
              <span className="text-gray-600">{getCurrentPlanInfo()?.price}</span>
            </div>
          </CardContent>
        </Card>

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all duration-200 bg-white/80 backdrop-blur-sm border-0 shadow-sm hover:shadow-md ${
                selectedPlan === plan.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
              } ${
                plan.id === currentPlan ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => plan.id !== currentPlan && handlePlanSelect(plan.id)}
            >
              <CardHeader className="relative">
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardTitle className="text-center">
                  <Badge className={plan.color} variant="outline">
                    <Crown className="h-4 w-4 mr-2" />
                    {plan.name}
                  </Badge>
                </CardTitle>
                <p className="text-center text-2xl font-bold text-gray-900 mt-2">
                  {plan.price}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {plan.id === currentPlan ? (
                  <Badge className="w-full justify-center bg-gray-100 text-gray-600">
                    Plano Atual
                  </Badge>
                ) : isUpgrade(plan.id) ? (
                  <div className="text-center">
                    {selectedPlan === plan.id ? (
                      <Badge className="bg-blue-100 text-blue-800 w-full justify-center">
                        <Check className="h-4 w-4 mr-1" />
                        Selecionado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-full justify-center border-blue-200 text-blue-600 hover:bg-blue-50">
                        Selecionar Upgrade
                      </Badge>
                    )}
                  </div>
                ) : (
                  <Badge variant="outline" className="w-full justify-center opacity-50">
                    Downgrade
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Justification Form */}
        {selectedPlan && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Solicitação de Upgrade</CardTitle>
              <p className="text-gray-600">
                Explique o motivo da solicitação para ajudar na aprovação
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="justification">Justificativa</Label>
                <Textarea
                  id="justification"
                  placeholder="Descreva por que você precisa fazer o upgrade para este plano..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlan('')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Solicitar Upgrade
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlanUpgrade;
