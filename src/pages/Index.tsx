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
      {/* Header - Responsivo */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-1.5 sm:p-2">
                <Scissors className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Button onClick={navigateToAdminLogin} variant="outline" size="sm" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Loja</span>
                <span className="sm:hidden">🏪</span>
              </Button>
              <Button onClick={navigateToClientLogin} variant="outline" size="sm" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Cliente</span>
                <span className="sm:hidden">👤</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-12">
        {/* Hero Section - Responsivo */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 px-2">
            Transforme seu Salão com 
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent"> Tecnologia</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Para quem transforma vidas todos os dias, chegou a tecnologia que transforma o seu negócio. Agende, gerencie e evolua com uma plataforma feita para você.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              onClick={navigateToAdminRegistration} 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 rounded-full text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Começar Agora - Grátis
            </Button>
          </div>
        </div>

        {/* Features Grid - Responsivo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 px-3 sm:px-0">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4 p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Agendamento Inteligente</CardTitle>
              <CardDescription className="text-sm sm:text-base">Sistema automatizado de agendamentos com confirmações em tempo real.</CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4 p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Gestão de Clientes</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Cadastro completo de clientes com histórico de serviços, preferências e dados de contato organizados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4 p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-lg sm:text-xl">Planos Flexíveis</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Escolha o plano ideal para seu negócio, desde freelancers até grandes estabelecimentos.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Section - Responsivo */}
        <div className="mb-12 sm:mb-16 px-3 sm:px-0">
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Planos que Crescem com Você</h3>
            <p className="text-base sm:text-lg text-gray-600 px-4">Escolha o plano perfeito para seu estabelecimento</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-6xl mx-auto">
            {/* Bronze Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Bronze</CardTitle>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">GRÁTIS</span>
                  <span className="text-sm sm:text-base text-gray-600">/limitado</span>
                </div>
                <CardDescription className="text-sm sm:text-base">Ideal para profissionais autônomos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">1 Atendente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">25 agendamentos por mês</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Relatórios Básicos</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigateToAdminRegistrationWithPlan('bronze')} 
                  className="w-full mt-4 sm:mt-6 text-sm sm:text-base" 
                  variant="outline"
                >
                  Escolher Bronze
                </Button>
              </CardContent>
            </Card>

            {/* Silver Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 sm:transform sm:scale-105">
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                <Badge className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-2 sm:px-3 py-1 text-xs sm:text-sm font-semibold mb-2">
                  MAIS POPULAR
                </Badge>
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Prata</CardTitle>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">R$ XX</span>
                  <span className="text-sm sm:text-base text-gray-600">/mês</span>
                </div>
                <CardDescription className="text-sm sm:text-base">Perfeito para salões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Até 3 Atendentes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">500 agendamentos por mês</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Relatórios Avançados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Relatórios Completos</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigateToAdminRegistrationWithPlan('prata')} 
                  className="w-full mt-4 sm:mt-6 text-sm sm:text-base"
                >
                  Escolher Prata
                </Button>
              </CardContent>
            </Card>

            {/* Gold Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-xl sm:text-2xl">Ouro</CardTitle>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">R$ XX</span>
                  <span className="text-sm sm:text-base text-gray-600">/mês</span>
                </div>
                <CardDescription className="text-sm sm:text-base">Para grandes estabelecimentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Atendentes Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Agendamentos Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Relatórios Completos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Suporte Prioritário</span>
                  </div>
                </div>
                <Button 
                  onClick={() => navigateToAdminRegistrationWithPlan('gold')} 
                  className="w-full mt-4 sm:mt-6 text-sm sm:text-base" 
                  variant="outline"
                >
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