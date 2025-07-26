
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, ArrowLeft, Crown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { useSecureSuperAdminAuth } from '@/hooks/useSecureSuperAdminAuth';

const SuperAdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const { authenticate } = useSecureSuperAdminAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await authenticate(credentials.username, credentials.password);
      
      if (result.success) {
        // Also set in main auth context for compatibility
        const userData = {
          id: 'super-admin',
          name: credentials.username,
          role: 'super_admin',
          isFirstAccess: false,
          loginTime: new Date().toISOString()
        };

        login(userData);
        
        toast({
          title: "Acesso Autorizado",
          description: `Bem-vindo, Super Administrador ${credentials.username}!`
        });

        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/super-admin-dashboard';
        }, 1000);

      } else {
        toast({
          title: "Acesso Negado",
          description: result.message || "Credenciais inválidas",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Erro no Sistema",
        description: "Erro interno no sistema de autenticação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center">
            <Crown className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900 mb-2">
            Super Administrador
          </CardTitle>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Área Segura</span>
            </div>
            <p className="text-xs text-red-700">
              Autenticação criptografada com auditoria completa
            </p>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700">
                Usuário Autorizado
              </Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Nome de usuário"
                required
                className="border-red-200 focus:border-red-500"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Senha Segura
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Senha"
                  required
                  className="border-red-200 focus:border-red-500 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-medium"
              >
                {loading ? "Verificando Segurança..." : "Acesso Seguro"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToHome}
                className="w-full border-red-200 text-red-700 hover:bg-red-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Início
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-red-100">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center mb-1">
                <AlertTriangle className="h-3 w-3 text-yellow-600 mr-1" />
                <span className="text-xs font-medium text-yellow-800">Segurança Avançada</span>
              </div>
              <p className="text-xs text-yellow-700">
                • Senha criptografada com bcrypt<br/>
                • Tentativas de acesso auditadas<br/>
                • Sessão com expiração automática<br/>
                • Validação contínua de permissões
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminLogin;
