import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Calendar, Clock, Star, Building2, Scissors, ShieldCheck, Users, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
const Index = () => {
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
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">Kiagenda</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={navigateToAdminLogin} variant="outline" size="sm" className="hidden md:inline-flex">
                Loja
              </Button>
              <Button onClick={navigateToClientLogin} variant="outline" size="sm">
                Cliente
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme seu Salão com 
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent"> Tecnologia</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo de gestão para salões de beleza, barbearias e clínicas estéticas. 
            Agende, gerencie e cresça seu negócio com nossa plataforma intuitiva.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button onClick={navigateToAdminRegistration} size="lg" className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Começar Agora - Grátis
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Agendamento Inteligente</CardTitle>
              <CardDescription>
                Sistema automatizado de agendamentos com confirmações por WhatsApp e notificações em tempo real.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Gestão de Clientes</CardTitle>
              <CardDescription>
                Cadastro completo de clientes com histórico de serviços, preferências e dados de contato organizados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Planos Flexíveis</CardTitle>
              <CardDescription>
                Escolha o plano ideal para seu negócio, desde freelancers até grandes estabelecimentos.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Planos que Crescem com Você</h3>
            <p className="text-lg text-gray-600">Escolha o plano perfeito para seu estabelecimento</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Bronze Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Bronze</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">GRÁTIS</span>
                  <span className="text-gray-600">/limitado</span>
                </div>
                <CardDescription>Ideal para profissionais autônomos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>1 Atendente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>25 agendamentos por mês</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Básicos</span>
                  </div>
                </div>
                <Button onClick={() => navigateToAdminRegistrationWithPlan('bronze')} className="w-full mt-6" variant="outline">
                  Escolher Bronze
                </Button>
              </CardContent>
            </Card>

            {/* Silver Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform scale-105">
              <CardHeader className="text-center pb-6">
                <Badge className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-1 text-sm font-semibold mb-2">
                  MAIS POPULAR
                </Badge>
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Prata</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 50</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Perfeito para salões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Até 3 Atendentes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>500 agendamentos por mês</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Avançados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Completos</span>
                  </div>
                </div>
                <Button onClick={() => navigateToAdminRegistrationWithPlan('prata')} className="w-full mt-6">
                  Escolher Prata
                </Button>
              </CardContent>
            </Card>

            {/* Gold Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Ouro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 199</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Para grandes estabelecimentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Atendentes Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Agendamentos Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Completos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Suporte Prioritário</span>
                  </div>
                </div>
                <Button onClick={() => navigateToAdminRegistrationWithPlan('gold')} className="w-full mt-6" variant="outline">
                  Escolher Ouro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;