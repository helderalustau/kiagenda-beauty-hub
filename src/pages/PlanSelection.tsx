import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSalonData } from '@/hooks/useSalonData';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useHierarchyData } from '@/hooks/useHierarchyData';

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
  const [pendingAdmin, setPendingAdmin] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createSalon } = useSalonData();
  const { linkAdminToSalon } = useAdminAuth();
  const { createHierarchyLink } = useHierarchyData();

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

  // Carregar dados do administrador pendente
  useEffect(() => {
    const adminData = localStorage.getItem('pendingAdminData');
    if (adminData) {
      try {
        setPendingAdmin(JSON.parse(adminData));
      } catch (error) {
        console.error('Erro ao carregar dados do administrador:', error);
        toast({
          title: "Erro",
          description: "Dados do administrador não encontrados. Redirecionando...",
          variant: "destructive"
        });
        setTimeout(() => {
          window.location.href = '/admin-registration';
        }, 2000);
      }
    } else {
      toast({
        title: "Erro",
        description: "Nenhum administrador pendente encontrado. Redirecionando...",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = '/admin-registration';
      }, 2000);
    }
  }, []);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setShowConfirmation(true);
  };

  const generateSequentialSalonName = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `EST-${timestamp}-${random}`;
  };

  const handleConfirmPlan = async () => {
    if (!pendingAdmin) {
      toast({
        title: "Erro",
        description: "Dados do administrador não encontrados",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      console.log('Criando estabelecimento com plano:', selectedPlan);
      
      // Criar estabelecimento temporário
      const temporarySalonData = {
        name: generateSequentialSalonName(),
        owner_name: pendingAdmin.name,
        phone: pendingAdmin.phone || '(00) 00000-0000',
        address: 'Endereço será preenchido na configuração',
        plan: selectedPlan
      };

      const salonResult = await createSalon(temporarySalonData);
      
      if (!salonResult.success) {
        throw new Error('Erro ao criar estabelecimento: ' + ('message' in salonResult ? salonResult.message : 'Erro desconhecido'));
      }

      if (!('salon' in salonResult) || !salonResult.salon) {
        throw new Error('Erro ao criar estabelecimento: dados não retornados');
      }

      console.log('Estabelecimento criado, vinculando administrador...');
      
      // Vincular administrador ao estabelecimento
      const linkResult = await linkAdminToSalon(pendingAdmin.id, salonResult.salon.id);
      
      if (!linkResult.success) {
        throw new Error('Erro ao vincular administrador: ' + linkResult.message);
      }

      console.log('Administrador vinculado, criando vínculos hierárquicos...');
      
      // Criar vínculos hierárquicos
      const hierarchyResult = await createHierarchyLink(
        salonResult.salon.id,
        pendingAdmin.id,
        salonResult.salon.name,
        pendingAdmin.name
      );

      if (!hierarchyResult.success) {
        console.warn('Erro ao criar vínculos hierárquicos:', hierarchyResult.message);
      }

      // Armazenar dados para configuração
      localStorage.setItem('adminData', JSON.stringify({
        ...linkResult.admin,
        salon_id: salonResult.salon.id,
        hierarchy_codes: hierarchyResult.data
      }));
      localStorage.setItem('selectedSalonId', salonResult.salon.id);
      
      // Limpar dados pendentes
      localStorage.removeItem('pendingAdminData');
      
      toast({
        title: "Sucesso!",
        description: "Plano selecionado! Redirecionando para configuração do estabelecimento..."
      });
      
      setShowConfirmation(false);
      
      // Redirecionar para configuração do estabelecimento
      setTimeout(() => {
        window.location.href = '/salon-setup';
      }, 2000);
      
    } catch (error) {
      console.error('Erro no processo de seleção de plano:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePlanSelection = async (planType: string) => {
    setSelectedPlan(planType);
    setLoading(true);

    try {
      // Verificar se existe admin pendente
      const pendingAdminData = localStorage.getItem('pendingAdminData');
      
      if (pendingAdminData) {
        const adminData = JSON.parse(pendingAdminData);
        
        // Criar estabelecimento para o admin
        const temporarySalonData = {
          name: `Estabelecimento-${Date.now()}`,
          owner_name: adminData.name,
          phone: adminData.phone || '0000000000',
          address: 'Endereço será preenchido na configuração',
          plan: planType
        };

        const salonResult = await createSalon(temporarySalonData);
        
        if (!salonResult.success) {
          throw new Error('Erro ao criar estabelecimento');
        }

        if (!('salon' in salonResult) || !salonResult.salon) {
          throw new Error('Dados do estabelecimento não retornados');
        }

        // Vincular admin ao estabelecimento
        const linkResult = await linkAdminToSalon(adminData.id, salonResult.salon.id);
        
        if (!linkResult.success) {
          throw new Error('Erro ao vincular administrador ao estabelecimento');
        }

        // Criar vínculos hierárquicos
        const hierarchyResult = await createHierarchyLink(
          salonResult.salon.id,
          adminData.id,
          salonResult.salon.name,
          adminData.name
        );

        if (!hierarchyResult.success) {
          console.error('Erro ao criar vínculos hierárquicos:', hierarchyResult.message);
        }

        // Armazenar dados para a configuração
        localStorage.setItem('selectedSalonId', salonResult.salon.id);
        localStorage.setItem('adminData', JSON.stringify({
          ...linkResult.admin,
          salon_id: salonResult.salon.id,
          hierarchy_codes: hierarchyResult.data
        }));

        toast({
          title: "Plano Selecionado!",
          description: `Plano ${planType} selecionado com sucesso. Redirecionando para configuração...`
        });

        // Redirecionar para BusinessSetup
        setTimeout(() => {
          window.location.href = '/business-setup';
        }, 2000);

      } else {
        // Se não há admin pendente, redirecionar para criação de conta
        setTimeout(() => {
          window.location.href = `/admin-signup?plan=${planType}`;
        }, 1000);
      }

    } catch (error) {
      console.error('Erro ao processar seleção de plano:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar seleção de plano",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!pendingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header - Responsivo */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-1.5 sm:p-2 rounded-lg">
                <Crown className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  Escolha seu Plano
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  Olá, {pendingAdmin.name}! Selecione o plano ideal para seu estabelecimento
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/admin-registration'}
              size="sm"
            >
              Voltar
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Planos que crescem com seu negócio
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Escolha o plano perfeito para as necessidades do seu estabelecimento. 
            Você pode fazer upgrade a qualquer momento.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-blue-500 md:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-pink-500 text-white text-center py-2 text-sm font-medium">
                  Mais Popular
                </div>
              )}
              
              <CardHeader className={`bg-gradient-to-r ${plan.color} text-white ${plan.popular ? 'pt-12' : 'pt-6'} p-4 sm:p-8`}>
                <div className="text-center">
                  <Crown className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                  <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-2xl sm:text-3xl font-bold mt-2">{plan.price}</div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-8">
                <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">Limitações:</p>
                  <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {plan.limitations}
                  </p>
                </div>

                <Button 
                  className="w-full text-sm sm:text-base"
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

        {/* Comparação de Recursos - Responsiva */}
        <div className="mt-12 sm:mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-lg sm:text-xl">Comparação Detalhada</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 sm:p-4 font-medium">Recursos</th>
                      <th className="text-center p-3 sm:p-4 font-medium">Bronze</th>
                      <th className="text-center p-3 sm:p-4 font-medium">Prata</th>
                      <th className="text-center p-3 sm:p-4 font-medium">Gold</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs sm:text-sm">
                    <tr className="border-b">
                      <td className="p-3 sm:p-4">Serviços cadastrados</td>
                      <td className="text-center p-3 sm:p-4">4</td>
                      <td className="text-center p-3 sm:p-4">10</td>
                      <td className="text-center p-3 sm:p-4">Ilimitado</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 sm:p-4">Atendentes</td>
                      <td className="text-center p-3 sm:p-4">1</td>
                      <td className="text-center p-3 sm:p-4">2</td>
                      <td className="text-center p-3 sm:p-4">50</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 sm:p-4">Atendimentos mensais</td>
                      <td className="text-center p-3 sm:p-4">50</td>
                      <td className="text-center p-3 sm:p-4">300</td>
                      <td className="text-center p-3 sm:p-4">Ilimitado</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-3 sm:p-4">Relatórios</td>
                      <td className="text-center p-3 sm:p-4">Básico</td>
                      <td className="text-center p-3 sm:p-4">Detalhado</td>
                      <td className="text-center p-3 sm:p-4">Avançado</td>
                    </tr>
                    <tr>
                      <td className="p-3 sm:p-4">Suporte</td>
                      <td className="text-center p-3 sm:p-4">Básico</td>
                      <td className="text-center p-3 sm:p-4">Prioritário</td>
                      <td className="text-center p-3 sm:p-4">Premium 24/7</td>
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
        <DialogContent className="mx-4 max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Plano</DialogTitle>
            <DialogDescription>
              Você selecionou o plano {plans.find(p => p.id === selectedPlan)?.name}. 
              Após confirmar, você será direcionado para configurar seu estabelecimento.
            </DialogDescription>
          </DialogHeader>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPlan}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? "Processando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanSelection;
