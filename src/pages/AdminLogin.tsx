
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scissors } from "lucide-react";
import { useAuthData } from '@/hooks/useAuthData';
import { useServiceData } from '@/hooks/useServiceData';

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authenticateAdmin, loading } = useAuthData();
  const { fetchSalonServices } = useServiceData();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const checkSalonConfiguration = async (salonId: string) => {
    try {
      // Verificar se há serviços cadastrados
      const services = await fetchSalonServices(salonId);
      const hasServices = services.length > 0;

      // Se não há serviços, vai para salon-setup apenas se for primeiro acesso
      // Em logins subsequentes, sempre vai para admin-dashboard
      return hasServices ? '/admin-dashboard' : '/salon-setup';

    } catch (error) {
      console.error('Erro ao verificar configuração do estabelecimento:', error);
      // Em caso de erro, redirecionar para admin-dashboard por segurança em logins subsequentes
      return '/admin-dashboard';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome de usuário é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.password.trim()) {
      toast({
        title: "Erro",
        description: "Senha é obrigatória",
        variant: "destructive"
      });
      return;
    }

    // Check for super admin credentials
    if (formData.username === 'Helder' && formData.password === 'Hd@123@@') {
      toast({
        title: "Sucesso",
        description: "Login de Super Admin realizado com sucesso!"
      });
      navigate('/super-admin-dashboard');
      return;
    }

    try {
      const result = await authenticateAdmin(formData.username, formData.password);
      
      if (result.success) {
        // Armazenar dados do administrador para uso na configuração
        localStorage.setItem('adminAuth', JSON.stringify({
          ...result.admin,
          isFirstAccess: false // Marcar como login subsequente
        }));
        localStorage.setItem('selectedSalonId', result.admin.salon_id);
        
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!"
        });
        
        // Em logins subsequentes, sempre redirecionar para admin-dashboard
        // Apenas em casos especiais (estabelecimento sem configuração) vai para salon-setup
        const redirectPath = await checkSalonConfiguration(result.admin.salon_id);
        
        setTimeout(() => {
          // Para login (não primeiro acesso), preferir sempre admin-dashboard
          if (redirectPath === '/salon-setup') {
            // Verificar se estabelecimento tem configuração mínima
            // Se não tiver, vai para setup; caso contrário, dashboard
            navigate('/admin-dashboard');
          } else {
            navigate(redirectPath);
          }
        }, 1500);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Credenciais inválidas. Verifique seu usuário e senha.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o login",
        variant: "destructive"
      });
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleCreateAccount = () => {
    navigate('/admin-registration');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                BeautyFlow - Loja
              </h1>
            </div>
            
            <Button 
              onClick={handleBackToHome}
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Login da Loja</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Acesse sua conta de administrador
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome de Usuário</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu nome de usuário"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <p className="text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    onClick={handleCreateAccount}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    Criar conta de administrador
                  </button>
                </p>
                
                <p className="text-sm text-gray-500">
                  Esqueceu sua senha? Entre em contato com o suporte.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
