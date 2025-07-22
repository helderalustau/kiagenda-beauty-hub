
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { ArrowLeft, Check, Crown, Star, Zap, Scissors } from "lucide-react";

const PlanSelection = () => {
  const { toast } = useToast();
  const { createSalon, linkAdminToSalon } = useSupabaseData();
  const [selectedPlan, setSelectedPlan] = useState<'bronze' | 'prata' | 'gold'>('bronze');
  const [loading, setLoading] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    // Carregar dados do administrador criado
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      setAdminData(JSON.parse(storedAdminData));
    } else {
      // Se não há dados do administrador, redirecionar para home
      toast({
        title: "Erro",
        description: "Dados do administrador não encontrados",
        variant: "destructive"
      });
      window.location.href = '/';
    }
  }, []);

  const plans = [
    {
      id: 'bronze' as const,
      name: 'Bronze',
      price: 29.90,
      icon: Crown,
      color: 'from-amber-400 to-orange-500',
      features: [
        'Até 2 atendentes',
        'Agendamentos ilimitados',
        'Gestão de clientes',
        'Relatórios básicos'
      ]
    },
    {
      id: 'prata' as const,
      name: 'Prata',
      price: 59.90,
      icon: Star,
      color: 'from-gray-400 to-gray-600',
      popular: true,
      features: [
        'Até 5 atendentes',
        'Agendamentos ilimitados',
        'Gestão completa de clientes',
        'Relatórios avançados',
        'Notificações por WhatsApp'
      ]
    },
    {
      id: 'gold' as const,
      name: 'Gold',
      price: 99.90,
      icon: Zap,
      color: 'from-yellow-400 to-yellow-600',
      features: [
        'Atendentes ilimitados',
        'Agendamentos ilimitados',
        'Gestão completa de clientes',
        'Relatórios premium',
        'Integração completa WhatsApp',
        'Dashboard personalizado',
        'Suporte prioritário'
      ]
    }
  ];

  const handleConfirmPlan = async () => {
    if (!adminData) {
      toast({
        title: "Erro",
        description: "Dados do administrador não encontrados",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Criando estabelecimento com plano:', selectedPlan);
      
      // Criar estabelecimento com dados básicos
      const salonResult = await createSalon({
        name: `Estabelecimento de ${adminData.name}`,
        owner_name: adminData.name,
        phone: adminData.phone || '',
        email: adminData.email || '',
        plan: selectedPlan,
        address: '',
        setup_completed: false
      });

      if (salonResult.success && 'salon' in salonResult && salonResult.salon) {
        console.log('Estabelecimento criado com sucesso:', salonResult.salon.id);
        
        // Vincular administrador ao estabelecimento
        const linkResult = await linkAdminToSalon(adminData.id, salonResult.salon.id);
        
        if (linkResult.success) {
          toast({
            title: "Sucesso!",
            description: "Plano selecionado e estabelecimento criado! Agora configure os dados do seu negócio."
          });
          
          // Armazenar ID do estabelecimento para uso na configuração
          localStorage.setItem('selectedSalonId', salonResult.salon.id);
          
          // Redirecionar para configuração do negócio
          setTimeout(() => {
            window.location.href = '/business-setup';
          }, 2000);
        } else {
          throw new Error('Erro ao vincular administrador ao estabelecimento');
        }
      } else {
        const errorMessage = 'message' in salonResult ? salonResult.message : 'Erro desconhecido';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.location.href = '/';
  };

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Escolha seu Plano
            </h1>
            <p className="text-gray-600">
              Olá {adminData?.name}! Selecione o plano ideal para seu estabelecimento
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.id;
            
            return (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                    : 'hover:shadow-md hover:scale-102'
                } ${plan.popular ? 'border-2 border-blue-500' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Mais Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-gray-900">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                    <span className="text-sm text-gray-600 font-normal">/mês</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full mt-6 ${
                      isSelected 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {isSelected ? 'Plano Selecionado' : 'Selecionar Plano'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={handleConfirmPlan}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white px-8 py-3"
          >
            {loading ? 'Criando Estabelecimento...' : `Confirmar Plano ${plans.find(p => p.id === selectedPlan)?.name}`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;
