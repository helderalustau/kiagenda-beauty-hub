
import React, { useEffect } from 'react';
import { useSecureSuperAdminAuth } from '@/hooks/useSecureSuperAdminAuth';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ArrowLeft, Lock } from "lucide-react";

interface SuperAdminProtectionProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const SuperAdminProtection = ({ children, fallbackPath = '/' }: SuperAdminProtectionProps) => {
  const { isAuthorized, isLoading, user, logout } = useSecureSuperAdminAuth();

  // Auto-redirect if not authorized
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      const timer = setTimeout(() => {
        window.location.href = fallbackPath;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthorized, fallbackPath]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Validando Segurança
            </h2>
            <p className="text-gray-600">
              Verificando credenciais e permissões...
            </p>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-center text-sm text-blue-700">
                <Lock className="h-4 w-4 mr-2" />
                Autenticação criptografada ativa
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access denied state
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
                <span className="text-sm font-medium text-red-800">Área Ultra-Segura</span>
              </div>
              <p className="text-sm text-red-700">
                Esta área requer autenticação de Super Administrador com:
              </p>
              <ul className="text-xs text-red-600 mt-2 space-y-1">
                <li>• Credenciais validadas por criptografia</li>
                <li>• Sessão com verificação contínua</li>
                <li>• Auditoria completa de acessos</li>
              </ul>
            </div>
            <p className="text-gray-600 mb-6">
              Redirecionando automaticamente em alguns segundos...
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

  // Authorized access - render with security header
  return (
    <div>
      {/* Enhanced security header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 px-4 py-2">
        <div className="container mx-auto">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-green-800">
              <Shield className="h-4 w-4 mr-2" />
              <span className="font-medium">Acesso Seguro Ativo:</span>
              <span className="ml-2">{user?.name}</span>
              <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 rounded text-xs font-medium">
                Super Admin
              </span>
            </div>
            <div className="flex items-center space-x-4 text-green-600">
              <div className="flex items-center">
                <Lock className="h-3 w-3 mr-1" />
                <span className="text-xs">Sessão Criptografada</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-xs border-green-300 text-green-700 hover:bg-green-100"
              >
                Sair Seguro
              </Button>
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default SuperAdminProtection;
