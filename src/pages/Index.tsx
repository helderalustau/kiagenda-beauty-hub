
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  Clock, 
  Star, 
  CheckCircle, 
  Smartphone, 
  Crown,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Zap,
  Shield,
  Headphones
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Bronze",
      price: "R$ 39,90",
      period: "/mês",
      description: "Ideal para pequenos negócios",
      features: [
        "Até 50 agendamentos/mês",
        "1 usuário administrador",
        "Notificações básicas",
        "Suporte por email"
      ],
      popular: false,
      color: "from-amber-500 to-orange-500"
    },
    {
      name: "Prata",
      price: "R$ 79,90",
      period: "/mês",
      description: "Para negócios em crescimento",
      features: [
        "Até 200 agendamentos/mês",
        "3 usuários administradores",
        "Notificações avançadas",
        "Relatórios detalhados",
        "Suporte prioritário"
      ],
      popular: true,
      color: "from-gray-400 to-gray-600"
    },
    {
      name: "Gold",
      price: "R$ 129,90",
      period: "/mês",
      description: "Para grandes estabelecimentos",
      features: [
        "Agendamentos ilimitados",
        "Usuários ilimitados",
        "Todas as funcionalidades",
        "Suporte 24/7",
        "Integração com APIs",
        "Relatórios avançados"
      ],
      popular: false,
      color: "from-yellow-400 to-yellow-600"
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Inteligente",
      description: "Sistema completo de agendamento com controle de horários e disponibilidade"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro e histórico completo dos seus clientes"
    },
    {
      icon: Clock,
      title: "Controle de Horários",
      description: "Defina seus horários de funcionamento e intervalos"
    },
    {
      icon: Smartphone,
      title: "Acesso Mobile",
      description: "Interface responsiva para uso em qualquer dispositivo"
    },
    {
      icon: Zap,
      title: "Notificações em Tempo Real",
      description: "Receba notificações instantâneas de novos agendamentos"
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Seus dados protegidos com criptografia de ponta"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-pink-500 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  KiAgenda
                </h1>
                <p className="text-xs text-gray-600">Sistema de Agendamento</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/client-login')}
                className="hidden sm:flex"
              >
                Área do Cliente
              </Button>
              <Button 
                onClick={() => navigate('/admin-login')}
                className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
              >
                Área Administrativa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
            Transforme seu negócio com o KiAgenda
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A solução completa para gerenciar agendamentos, clientes e sua agenda de forma inteligente e eficiente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-lg px-8 py-3"
              onClick={() => navigate('/admin-login')}
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/client-login')}
            >
              Acessar como Cliente
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Funcionalidades Poderosas
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar seu negócio em um só lugar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
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

      {/* Plans Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-800">
              Escolha o Plano Ideal
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Planos flexíveis para cada tipo de negócio
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative hover:shadow-xl transition-all duration-300 ${plan.popular ? 'scale-105 border-2 border-blue-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-pink-500 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${plan.color} mx-auto mb-4 flex items-center justify-center`}>
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-800">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600' : ''}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => navigate('/admin-login')}
                  >
                    Escolher {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-pink-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Pronto para revolucionar seu negócio?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresários que já transformaram seu negócio com o KiAgenda
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
            onClick={() => navigate('/admin-login')}
          >
            Começar Gratuitamente
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">KiAgenda</span>
              </div>
              <p className="text-gray-400 mb-4">
                A solução completa para gerenciar agendamentos e transformar seu negócio.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Planos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Segurança</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>(11) 9999-9999</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contato@kiagenda.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>São Paulo, SP</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 KiAgenda. Todos os direitos reservados.
            </p>
            <button 
              onClick={() => navigate('/super-admin')}
              className="text-gray-400 hover:text-white transition-colors mt-4 md:mt-0"
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
