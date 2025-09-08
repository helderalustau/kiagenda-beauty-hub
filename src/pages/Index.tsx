
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Shield, Crown, Star, Check, User, Store } from "lucide-react";
import { usePlanConfigurations } from '@/hooks/usePlanConfigurations';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { getAllPlansInfo, loading } = usePlanConfigurations();
  
  const plans = getAllPlansInfo();

  const handleSuperAdminAccess = () => {
    navigate('/super-admin-login');
  };

  const features = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamentos com notificações em tempo real"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Gestão de Clientes",
      description: "Cadastro completo de clientes com histórico de atendimentos"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Segurança Total",
      description: "Dados protegidos com criptografia e backup automático"
    }
  ];

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'bronze':
        return '🥉';
      case 'prata':
        return '🥈';
      case 'gold':
        return '🥇';
      default:
        return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => navigate('/client-login')}
                variant="outline" 
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                {isMobile ? (
                  <User className="h-4 w-4" />
                ) : (
                  "Acesso do Cliente"
                )}
              </Button>
              <Button 
                onClick={() => navigate('/admin-login')}
                className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700"
              >
                {isMobile ? (
                  <Store className="h-4 w-4" />
                ) : (
                  "Área Administrativa"
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Transforme seu <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Negócio</span> em uma <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Experiência Digital</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Gerencie agendamentos, clientes e serviços com a mais moderna plataforma de gestão para salões de beleza
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                onClick={() => navigate('/plan-selection')}
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-lg px-8 py-3"
              >
                Começar Agora
              </Button>
              <Button 
                onClick={() => navigate('/salon-selection')}
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
              >
                Ver Estabelecimentos
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tudo que você precisa em uma plataforma
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center text-white">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Planos que se adaptam ao seu negócio
          </h3>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Escolha o plano ideal para o seu salão e comece a transformar sua gestão hoje mesmo
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card key={plan.id} className={`relative hover:shadow-xl transition-shadow ${index === 1 ? 'border-blue-600 shadow-lg' : ''}`}>
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-blue-600 to-pink-600 text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{getPlanIcon(plan.plan_type)}</div>
                    <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      {plan.price}
                      <span className="text-sm text-gray-500 font-normal">/mês</span>
                    </div>
                    <p className="text-gray-600 text-sm">{plan.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => navigate('/plan-selection')}
                      className={`w-full ${index === 1 ? 'bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700' : 'bg-gray-900 hover:bg-gray-800'}`}
                    >
                      Escolher {plan.name}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold">Kiagenda</h4>
              </div>
              <p className="text-gray-400">
                A plataforma completa para gestão de salões de beleza
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Recursos</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Agendamento Online</li>
                <li>Gestão de Clientes</li>
                <li>Controle Financeiro</li>
                <li>Relatórios</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Tutoriais</li>
                <li>Contato</li>
                <li>WhatsApp</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold mb-4">Empresa</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Planos</li>
                <li>Privacidade</li>
                <li>Termos</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex justify-between items-center">
            <p className="text-gray-400">
              © 2024 Kiagenda. Todos os direitos reservados.
            </p>
            <button 
              onClick={handleSuperAdminAccess}
              className="text-gray-400 hover:text-yellow-400 transition-colors"
              title="Acesso Super Admin"
            >
              <Crown className="h-5 w-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
