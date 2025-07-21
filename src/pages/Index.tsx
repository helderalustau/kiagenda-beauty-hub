import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Crown, Building2, ShieldCheck, Smartphone, UserCheck, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';

const Index = () => {
  const { getAllPlansInfo } = usePlanConfigurations();
  const plansInfo = getAllPlansInfo();
  const navigate = useNavigate();

  const navigateToAdminLogin = () => {
    navigate('/admin-login');
  };

  const navigateToClientLogin = () => {
    navigate('/client-login');
  };

  const navigateToAdminRegistration = () => {
    navigate('/admin-registration');
  };

  const navigateToAdminRegistrationWithPlan = (plan: string) => {
    navigate('/admin-registration', {
      state: {
        selectedPlan: plan
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-purple-600 uppercase tracking-wider">
                Kiagenda
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="hidden md:inline cursor-pointer hover:text-purple-600">Funcionalidades</span>
              <span className="hidden md:inline cursor-pointer hover:text-purple-600">Preço</span>
              <Button 
                onClick={navigateToAdminLogin}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="sm"
              >
                Acessar versão web
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Gerencie seus agendamentos em um só lugar
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Kiagenda é um aplicativo de agendamento para profissionais, que irá organizar a agenda e faturamento da sua empresa.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={navigateToAdminRegistration} 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-medium"
                >
                  Começar Teste Grátis
                </Button>
                <Button 
                  onClick={navigateToClientLogin} 
                  variant="outline" 
                  size="lg" 
                  className="border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg font-medium"
                >
                  Área do Cliente
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 text-purple-600 cursor-pointer">
                <span>📱</span>
                <span>Faça scroll e veja nossos recursos</span>
              </div>
            </div>
            
            {/* Purple Circle Background with Devices */}
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full mx-auto relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="transform rotate-12 space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-lg w-48 h-32 flex items-center justify-center">
                      <Smartphone className="h-16 w-16 text-purple-600" />
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-lg w-48 h-32 flex items-center justify-center transform -rotate-12">
                      <Calendar className="h-16 w-16 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Novo aplicativo de agendamento</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h6 className="text-lg font-semibold text-gray-900">Fácil de acessar</h6>
              <p className="text-gray-600">Esteja em qualquer lugar, Kiagenda é um app de agendamento online que funciona offline.</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <h6 className="text-lg font-semibold text-gray-900">Cadastre seus produtos/serviços</h6>
              <p className="text-gray-600">Permita que seus clientes vejam eles ou deixe invisível aos clientes. Com todos os detalhes.</p>
            </div>
            
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h6 className="text-lg font-semibold text-gray-900">Total controle</h6>
              <p className="text-gray-600">Assuma o controle total da sua agenda e dos seus funcionários em qualquer lugar a qualquer hora.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Control Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Assuma o controle do seu dia-a-dia</h3>
            <p className="text-lg text-gray-600 text-center mb-12">
              Aceite agendamentos online através da sua página. Seu cliente pode agendar sozinho, você receberá notificações e poderá focar mais tempo na sua empresa.
            </p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2">Funcionamos online</h6>
                  <p className="text-gray-600 text-sm">Nossa base de dados é 100% online.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2">Lembrete</h6>
                  <p className="text-gray-600 text-sm">Envie lembrete de agendamento para seus clientes.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2">Agendamento Online</h6>
                  <p className="text-gray-600 text-sm">Aceite agendamentos online através da sua página, que é criada junto com sua conta.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2">Agendamento recursivos</h6>
                  <p className="text-gray-600 text-sm">Faça agendamentos recursivos (diários, semanais, quinzenais, etc)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2">Multi agendas</h6>
                  <p className="text-gray-600 text-sm">Tenha multi agendas, cadastre todos os seus funcionários (sem pagar a mais por isso).</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                <div>
                  <h6 className="font-semibold text-gray-900 mb-2">Permissões</h6>
                  <p className="text-gray-600 text-sm">Defina permissões de acesso para cada funcionário.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-medium mb-2">nossos preços</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Escolha o plano certo para seu negócio</h3>
            <p className="text-lg text-gray-600">Comece o teste grátis de 30 dias, experimente nossa plataforma por um período, se gostar assine.</p>
          </div>

          {/* Single Plan Highlight - Similar to TuaAgenda */}
          <div className="max-w-md mx-auto mb-12">
            <Card className="bg-white border-2 border-purple-200 shadow-xl">
              <CardHeader className="text-center p-8">
                <div className="text-4xl font-bold text-purple-600 mb-2">R$19,90</div>
                <div className="text-gray-600 mb-4">Por mês</div>
                <p className="text-gray-700">Use o app sem limitações assinando mensalmente.</p>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <Button 
                  onClick={navigateToAdminRegistration} 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
                >
                  Gratuito por 30 dias
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* All Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plansInfo.map((plan) => {
              const isPopular = plan.plan_type === 'prata';
              
              return (
                <Card key={plan.id} className={`bg-white border-2 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isPopular ? 'border-purple-300 transform scale-105' : 'border-gray-200'
                }`}>
                  <CardHeader className="text-center p-6">
                    {isPopular && (
                      <Badge className="bg-purple-600 text-white px-3 py-1 text-sm font-semibold mb-3">
                        MAIS POPULAR
                      </Badge>
                    )}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      plan.plan_type === 'bronze' ? 'bg-amber-500' :
                      plan.plan_type === 'prata' ? 'bg-purple-600' :
                      'bg-yellow-500'
                    }`}>
                      {plan.plan_type === 'bronze' ? <Building2 className="h-8 w-8 text-white" /> :
                       plan.plan_type === 'prata' ? <Users className="h-8 w-8 text-white" /> :
                       <Crown className="h-8 w-8 text-white" />}
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    <CardDescription className="mt-2">
                      {plan.plan_type === 'bronze' ? 'Ideal para profissionais autônomos' :
                       plan.plan_type === 'prata' ? 'Perfeito para salões' :
                       'Para grandes estabelecimentos'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>
                          {plan.max_attendants === 1 ? '1 Atendente' :
                           plan.max_attendants > 10 ? 'Atendentes Ilimitados' :
                           `Até ${plan.max_attendants} Atendentes`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>
                          {plan.max_appointments > 1000 ? 'Agendamentos Ilimitados' :
                           `${plan.max_appointments} agendamentos por mês`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>
                          {plan.plan_type === 'bronze' ? 'Relatórios Básicos' :
                           plan.plan_type === 'prata' ? 'Relatórios Avançados' :
                           'Relatórios Completos'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigateToAdminRegistrationWithPlan(plan.plan_type)} 
                      className={`w-full mt-6 ${
                        isPopular 
                          ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                          : 'border-purple-600 text-purple-600 hover:bg-purple-50'
                      }`}
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Footer CTA Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Agenda web Organizada</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Usada por pessoas que procuram deixar as coisas mais simples. Permita que seus clientes agendem os próprios horários.
          </p>
          <Button 
            onClick={navigateToAdminRegistration}
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
          >
            Teste Grátis por 30 Dias
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;