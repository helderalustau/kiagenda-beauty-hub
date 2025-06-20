
import React, { useEffect } from 'react';
import { useSuperAdminAuth } from '@/hooks/useSuperAdminAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";

interface SuperAdminProtectionProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const SuperAdminProtection = ({ children, fallbackPath = '/' }: SuperAdminProtectionProps) => {
  const { isAuthorized, isLoading, user } = useSuperAdminAuth();

  // Redirecionamento automático se não autorizado
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      const timer = setTimeout(() => {
        window.location.href = fallbackPath;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthorized, fallbackPath]);

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verificando Permissões
            </h2>
            <p className="text-gray-600">
              Validando acesso de Super Administrador...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Tela de acesso negado
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="p-8 text-center">
            <div className="bg-red-100 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Acesso Negado
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-red-800">Área Restrita</span>
              </div>
              <p className="text-sm text-red-700">
                Esta área é exclusiva para o Super Administrador do sistema. 
                Apenas usuários com permissões especiais podem acessar esta funcionalidade.
              </p>
            </div>
            <p className="text-gray-600 mb-6">
              Você será redirecionado automaticamente em alguns segundos...
            </p>
            <Button 
              onClick={() => window.location.href = fallbackPath}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se autorizado, renderizar o conteúdo
  return (
    <div>
      {/* Header de confirmação de acesso autorizado */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <div className="container mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-green-800">
              <Shield className="h-4 w-4 mr-2" />
              Acesso autorizado: Super Administrador ({user?.name})
            </div>
            <div className="text-green-600">
              Sessão segura ativa
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default SuperAdminProtection;
