
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { User } from "lucide-react";
import { useAuthData } from '@/hooks/useAuthData';

const ClientLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authenticateClient, registerClient, loading } = useAuthData();
  
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    phone: '',
    email: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
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

    try {
      const result = await authenticateClient(formData.username, formData.password);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso! Redirecionando para estabelecimentos..."
        });
        
        // Redirecionar para dashboard do cliente onde verá os estabelecimentos
        setTimeout(() => {
          navigate('/client-dashboard');
        }, 1500);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Credenciais inválidas. Verifique seu usuário e senha ou crie uma nova conta.",
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
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

    if (!formData.phone.trim()) {
      toast({
        title: "Erro",
        description: "Telefone é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await registerClient(
        formData.username,
        formData.password,
        formData.phone,
        formData.email
      );
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Conta criada com sucesso! Fazendo login automaticamente..."
        });
        
        // Fazer login automático após registro
        setTimeout(async () => {
          const loginResult = await authenticateClient(formData.username, formData.password);
          if (loginResult.success) {
            navigate('/client-dashboard');
          }
        }, 1000);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao criar conta",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado durante o registro",
        variant: "destructive"
      });
    }
  };

  const handleForgotPassword = () => {
    toast({
      title: "Recuperar Senha",
      description: "Entre em contato com o estabelecimento onde você é cliente para recuperar sua senha.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <User className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                BeautyFlow - Cliente
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">
                {isRegistering ? 'Criar Conta' : 'Login do Cliente'}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {isRegistering ? 'Crie sua conta para agendar serviços' : 'Acesse sua conta para ver estabelecimentos disponíveis'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Nome {isRegistering ? 'Completo' : 'de Usuário'}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={isRegistering ? "Digite seu nome completo" : "Digite seu nome de usuário"}
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

                {isRegistering && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email (opcional)</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : (isRegistering ? 'Criar Conta' : 'Entrar')}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <p className="text-gray-600">
                  {isRegistering ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
                  <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline"
                  >
                    {isRegistering ? 'Fazer login' : 'Criar conta'}
                  </button>
                </p>
                
                {!isRegistering && (
                  <p className="text-sm text-gray-500">
                    <button
                      onClick={handleForgotPassword}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      Esqueceu sua senha?
                    </button>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ClientLogin;
