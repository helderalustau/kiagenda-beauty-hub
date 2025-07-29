
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scissors, Calendar, Users, TrendingUp, Star, Crown, Zap, ArrowRight } from "lucide-react";
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { getAllPlansInfo } = usePlanConfigurations();
  const navigate = useNavigate();
  const availablePlans = getAllPlansInfo();

  const handlePlanSelection = (planType: string) => {
    // Navegar para cadastro de administrador com plano selecionado
    navigate('/admin-signup', { state: { selectedPlan: planType } });
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'bronze': return Crown;
      case 'prata': return Star;
      case 'gold': return Zap;
      default: return Crown;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/client-login')}>
                Área do Cliente
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin-login')}>
                Área do Admin
              </Button>
              <Button variant="outline" onClick={() => navigate('/super-admin-login')}>
                Super Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Transforme seu
            <span className="bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent"> salão</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Sistema completo de agendamento e gestão para salões de beleza. 
            Simplifique sua rotina e melhore a experiência dos seus clientes.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-white px-8 py-3"
              onClick={() => navigate('/admin-signup')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/client-login')}
            >
              Agendar Serviço
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Recursos Principais
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Agendamento Online</h4>
              <p className="text-gray-600">Seus clientes podem agendar serviços 24/7 através da plataforma</p>
            </div>
            <div className="text-center">
              <div className="bg-pink-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-pink-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Gestão de Clientes</h4>
              <p className="text-gray-600">Mantenha um histórico completo de todos os seus clientes</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-2">Relatórios</h4>
              <p className="text-gray-600">Acompanhe o desempenho do seu negócio com relatórios detalhados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Escolha o Plano Ideal
          </h3>
          <p className="text-center text-gray-600 mb-12">
            Selecione o plano que melhor se adequa ao seu negócio e comece já
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {availablePlans.map((plan) => {
              const Icon = getPlanIcon(plan.plan_type);
              const isPopular = plan.plan_type === 'prata';
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative hover:shadow-lg transition-shadow ${
                    isPopular ? 'border-2 border-blue-500 scale-105' : ''
                  }`}
                >
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${
                      plan.plan_type === 'bronze' ? 'from-amber-400 to-orange-500' :
                      plan.plan_type === 'prata' ? 'from-gray-400 to-gray-600' :
                      'from-yellow-400 to-yellow-600'
                    } flex items-center justify-center mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900">
                      {plan.price}
                      <span className="text-sm text-gray-600 font-normal">/mês</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className={`w-full ${
                        isPopular 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                      onClick={() => handlePlanSelection(plan.plan_type)}
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Kiagenda</h1>
          </div>
          <p className="text-gray-400">
            Transformando a gestão de salões de beleza
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
