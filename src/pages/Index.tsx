
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Scissors, Store, Users, Crown, Calendar, Clock, MapPin, Star, ArrowRight, CheckCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      title: "Agendamento Online",
      description: "Sistema completo de agendamento com horários disponíveis em tempo real"
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: "Gestão de Clientes",
      description: "Controle completo de clientes com histórico e preferências"
    },
    {
      icon: <Store className="h-8 w-8 text-purple-500" />,
      title: "Múltiplos Estabelecimentos",
      description: "Gerencie vários salões em uma única plataforma"
    },
    {
      icon: <Clock className="h-8 w-8 text-orange-500" />,
      title: "Horários Flexíveis",
      description: "Configure horários de funcionamento personalizados"
    },
    {
      icon: <MapPin className="h-8 w-8 text-red-500" />,
      title: "Localização",
      description: "Clientes podem encontrar estabelecimentos por localização"
    },
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "Avaliações",
      description: "Sistema de avaliações e feedback dos clientes"
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "R$ 29,90",
      period: "/mês",
      features: [
        "Até 100 agendamentos/mês",
        "1 estabelecimento",
        "Suporte básico",
        "Relatórios simples"
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 49,90",
      period: "/mês",
      features: [
        "Agendamentos ilimitados",
        "Até 3 estabelecimentos",
        "Suporte prioritário",
        "Relatórios avançados",
        "Integração WhatsApp"
      ],
      popular: true
    },
    {
      name: "Empresarial",
      price: "R$ 99,90",
      period: "/mês",
      features: [
        "Agendamentos ilimitados",
        "Estabelecimentos ilimitados",
        "Suporte 24/7",
        "Relatórios completos",
        "API personalizada",
        "Treinamento incluído"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
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
              <Button
                variant="ghost"
                onClick={() => navigate('/client-login')}
                className="text-gray-600 hover:text-gray-900"
              >
                Login Cliente
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-login')}
                className="text-gray-600 hover:text-gray-900"
              >
                Login Administrador
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/super-admin-login')}
                className="p-2"
                title="Acesso Super Admin"
              >
                <Crown className="h-5 w-5 text-yellow-500" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Transforme seu salão com o
              <span className="bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent"> Kiagenda</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              A plataforma completa para gestão de salões de beleza. Agendamentos online, 
              controle de clientes e muito mais em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => navigate('/salon-selection')}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-pink-500 text-white hover:from-blue-700 hover:to-pink-600 px-8 py-4 text-lg"
              >
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/client-login')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg"
              >
                Fazer Agendamento
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Recursos Incríveis
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para gerenciar seu salão de forma eficiente e profissional
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Planos que Cabem no seu Bolso
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio e comece a transformar seu salão hoje mesmo
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-500 shadow-xl' : 'border shadow-md'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <Button
                    onClick={() => navigate('/salon-selection')}
                    className={`w-full mt-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-pink-500 text-white hover:from-blue-700 hover:to-pink-600' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Começar Agora
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
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-6">
              Pronto para Revolucionar seu Salão?
            </h3>
            <p className="text-xl text-blue-100 mb-8">
              Junte-se a centenas de salões que já usam o Kiagenda para gerenciar seus negócios
            </p>
            <Button
              onClick={() => navigate('/salon-selection')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg"
            >
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
              <Scissors className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
              Kiagenda
            </h1>
          </div>
          <p className="text-gray-400 mb-8">
            A plataforma completa para gestão de salões de beleza
          </p>
          <div className="text-gray-500 text-sm">
            © 2024 Kiagenda. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
