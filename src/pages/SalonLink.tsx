
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Scissors, MapPin, Phone } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

const SalonLink = () => {
  const { slug } = useParams<{ slug: string }>();
  const [salon, setSalon] = useState<any>(null);
  const [userType, setUserType] = useState<'login' | 'register'>('login');
  const [clientForm, setClientForm] = useState({ nome: '', senha: '', telefone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [salonLoading, setSalonLoading] = useState(true);

  const { authenticateClient, registerClient, salons, fetchAllSalons } = useSupabaseData();
  const { toast } = useToast();

  useEffect(() => {
    const loadSalon = async () => {
      try {
        setSalonLoading(true);
        await fetchAllSalons();
      } catch (error) {
        console.error('Erro ao carregar estabelecimentos:', error);
      } finally {
        setSalonLoading(false);
      }
    };

    loadSalon();
  }, []);

  useEffect(() => {
    if (salons.length > 0 && slug) {
      const foundSalon = salons.find(s => s.unique_slug === slug);
      if (foundSalon) {
        setSalon(foundSalon);
      }
    }
  }, [salons, slug]);

  const handleClientLogin = async () => {
    if (!clientForm.nome || !clientForm.senha) {
      toast({
        title: "Erro",
        description: "Preencha nome e senha",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await authenticateClient(clientForm.nome, clientForm.senha);
    setLoading(false);

    if (result.success && result.client) {
      localStorage.setItem('userType', 'client');
      localStorage.setItem('clientData', JSON.stringify(result.client));
      localStorage.setItem('selectedSalonId', salon.id);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
      window.location.href = '/client-dashboard';
    } else {
      toast({
        title: "Erro de Login",
        description: "Nome ou senha incorretos. Verifique suas credenciais ou cadastre-se se ainda não possui uma conta.",
        variant: "destructive"
      });
    }
  };

  const handleClientRegister = async () => {
    if (!clientForm.nome || !clientForm.senha || !clientForm.telefone) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await registerClient(clientForm.nome, clientForm.senha, clientForm.telefone, clientForm.email);
    setLoading(false);

    if (result.success && result.client) {
      localStorage.setItem('userType', 'client');
      localStorage.setItem('clientData', JSON.stringify(result.client));
      localStorage.setItem('selectedSalonId', salon.id);
      toast({
        title: "Sucesso",
        description: "Cadastro realizado com sucesso!"
      });
      window.location.href = '/client-dashboard';
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const handleGoBack = () => {
    window.location.href = '/';
  };

  if (salonLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estabelecimento...</p>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-8">
            <Scissors className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Estabelecimento não encontrado
            </h1>
            <p className="text-gray-600 mb-6">
              O link que você acessou não corresponde a nenhum estabelecimento ativo.
            </p>
            <Button onClick={handleGoBack} className="w-full">
              Voltar à página inicial
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleGoBack}
                className="flex items-center space-x-2"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                  <Scissors className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                  Kiagenda
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Salon Info */}
        <div className="text-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {salon.name}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {salon.owner_name}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{salon.address}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>{salon.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {userType === 'login' ? 'Fazer Login' : 'Criar Conta'}
              </CardTitle>
              <CardDescription>
                {userType === 'login' 
                  ? 'Acesse sua conta para agendar' 
                  : 'Cadastre-se para agendar seus serviços'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value="client" className="w-full">
                <TabsList className="grid w-full grid-cols-1 mb-6">
                  <TabsTrigger value="client" className="text-sm">
                    👤 Acessar como Cliente
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="client" className="space-y-4">
                  {userType === 'login' ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-name">Nome</Label>
                        <Input
                          id="client-name"
                          placeholder="Seu nome"
                          value={clientForm.nome}
                          onChange={(e) => setClientForm({...clientForm, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-password">Senha</Label>
                        <Input
                          id="client-password"
                          type="password"
                          placeholder="Sua senha"
                          value={clientForm.senha}
                          onChange={(e) => setClientForm({...clientForm, senha: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleClientLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        {loading ? 'Entrando...' : 'Entrar e Agendar'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-name-reg">Nome *</Label>
                        <Input
                          id="client-name-reg"
                          placeholder="Seu nome"
                          value={clientForm.nome}
                          onChange={(e) => setClientForm({...clientForm, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-password-reg">Senha *</Label>
                        <Input
                          id="client-password-reg"
                          type="password"
                          placeholder="Escolha uma senha"
                          value={clientForm.senha}
                          onChange={(e) => setClientForm({...clientForm, senha: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-phone-reg">Telefone *</Label>
                        <Input
                          id="client-phone-reg"
                          type="tel"
                          placeholder="+55 (11) 99999-9999"
                          value={clientForm.telefone}
                          onChange={(e) => setClientForm({...clientForm, telefone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-email-reg">Email</Label>
                        <Input
                          id="client-email-reg"
                          type="email"
                          placeholder="seu@email.com"
                          value={clientForm.email}
                          onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleClientRegister}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        {loading ? 'Cadastrando...' : 'Cadastrar e Agendar'}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => setUserType(userType === 'login' ? 'register' : 'login')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {userType === 'login' 
                    ? 'Não tem conta? Cadastre-se' 
                    : 'Já tem conta? Fazer login'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalonLink;
