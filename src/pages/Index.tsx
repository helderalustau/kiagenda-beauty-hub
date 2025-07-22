
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Scissors, Star, Shield, Crown } from "lucide-react";

const Index = () => {
  const handleAdminLogin = () => {
    window.location.href = '/admin-login';
  };

  const handleClientLogin = () => {
    window.location.href = '/client-login';
  };

  const handleSuperAdminLogin = () => {
    window.location.href = '/super-admin-login';
  };

  const features = [
    {
      icon: Calendar,
      title: "Agendamento Online",
      description: "Sistema completo de agendamentos com horários disponíveis em tempo real"
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description: "Cadastro e histórico completo de todos os seus clientes"
    },
    {
      icon: Scissors,
      title: "Catálogo de Serviços",
      description: "Organize todos os serviços oferecidos com preços e durações"
    },
    {
      icon: Star,
      title: "Planos Flexíveis",
      description: "Escolha o plano ideal para o seu estabelecimento"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                SalonManager
              </h1>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={handleClientLogin}
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Área do Cliente
              </Button>
              <Button 
                onClick={handleAdminLogin}
                className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
              >
                <Shield className="h-4 w-4 mr-2" />
                Área Administrativa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 hover:bg-blue-100">
            Sistema de Gestão Completo
          </Badge>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gerencie seu Salão de Beleza com
            <span className="bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent block">
              Eficiência e Modernidade
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para salões de beleza, barbearias e clínicas estéticas. 
            Gerencie agendamentos, clientes, serviços e muito mais em um só lugar.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleAdminLogin}
              className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600 text-lg px-8 py-3"
            >
              <Shield className="h-5 w-5 mr-2" />
              Começar Agora
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleClientLogin}
              className="border-blue-200 text-blue-700 hover:bg-blue-50 text-lg px-8 py-3"
            >
              <Users className="h-5 w-5 mr-2" />
              Sou Cliente
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa em uma plataforma
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Recursos pensados especificamente para profissionais da beleza
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto bg-gradient-to-r from-blue-600 to-pink-500 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-4xl mx-auto border-0 shadow-2xl bg-gradient-to-r from-blue-600 to-pink-500 text-white">
            <CardContent className="py-16">
              <h3 className="text-4xl font-bold mb-6">
                Pronto para transformar seu negócio?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Junte-se a centenas de profissionais que já escolheram nossa plataforma
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleAdminLogin}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                <Shield className="h-5 w-5 mr-2" />
                Criar Conta Grátis
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">SalonManager</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSuperAdminLogin}
                className="text-gray-400 hover:text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Super Admin
              </Button>
              <div className="text-sm text-gray-400">
                © 2024 SalonManager. Todos os direitos reservados.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
