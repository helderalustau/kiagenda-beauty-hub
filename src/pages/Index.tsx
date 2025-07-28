
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Calendar, Users, Crown } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleSuperAdminClick = () => {
    navigate('/super-admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-4xl w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <Scissors className="h-12 w-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">SalonSync</h1>
            </div>
            <p className="text-xl text-gray-600">
              Sistema completo de agendamento para salões de beleza
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Agendamento Online</CardTitle>
                <CardDescription>
                  Seus clientes podem agendar serviços 24/7
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Gestão de Clientes</CardTitle>
                <CardDescription>
                  Controle completo dos seus clientes e histórico
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scissors className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Gestão de Serviços</CardTitle>
                <CardDescription>
                  Configure seus serviços, preços e horários
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/client-login')}
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                Agendar Serviço
              </Button>
              <p className="text-sm text-gray-500">Para clientes</p>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={() => navigate('/admin-login')}
                variant="outline" 
                size="lg"
                className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                Área do Estabelecimento
              </Button>
              <p className="text-sm text-gray-500">Para proprietários e funcionários</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Scissors className="h-5 w-5 text-blue-600" />
              <span className="text-gray-600">© 2024 SalonSync. Todos os direitos reservados.</span>
            </div>
            
            <button
              onClick={handleSuperAdminClick}
              className="text-gray-400 hover:text-yellow-500 transition-colors"
              title="Acesso administrativo"
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
