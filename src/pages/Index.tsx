
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Agendamento
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Gerencie seus agendamentos de forma simples e eficiente
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Client Access */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-900">
                Fazer Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Selecione um estabelecimento e agende seu serviço
              </p>
              <Button 
                onClick={() => navigate('/select-salon')}
                className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white"
              >
                Agendar Agora
              </Button>
            </CardContent>
          </Card>

          {/* Client Login */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-900">
                Área do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Acesse seus agendamentos e histórico
              </p>
              <Button 
                onClick={() => navigate('/client-login')}
                variant="outline"
                className="w-full"
              >
                Entrar
              </Button>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-xl text-gray-900">
                Área Administrativa
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Gerencie seu estabelecimento
              </p>
              <Button 
                onClick={() => navigate('/admin-login')}
                variant="secondary"
                className="w-full"
              >
                Acessar Painel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* New Admin Registration */}
        <div className="max-w-md mx-auto mt-12">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-gray-900">
                Novo Estabelecimento
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                Cadastre seu negócio na plataforma
              </p>
              <Button 
                onClick={() => navigate('/admin-registration')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Cadastrar Estabelecimento
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
