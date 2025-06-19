
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Scissors, Users, Star } from "lucide-react";

const Index = () => {
  const [userType, setUserType] = useState<'login' | 'register'>('login');
  const [clientForm, setClientForm] = useState({ nome: '', telefone: '' });
  const [adminForm, setAdminForm] = useState({ 
    responsavel: '', 
    salao: '', 
    telefone: '', 
    endereco: '', 
    login: '', 
    senha: '' 
  });

  const handleClientLogin = () => {
    // Simular login - em produção conectaria com backend
    localStorage.setItem('userType', 'client');
    localStorage.setItem('clientData', JSON.stringify(clientForm));
    window.location.href = '/client-dashboard';
  };

  const handleAdminLogin = () => {
    // Simular login - em produção conectaria com backend
    localStorage.setItem('userType', 'admin');
    localStorage.setItem('adminData', JSON.stringify(adminForm));
    window.location.href = '/admin-dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-pink-500 p-2 rounded-lg">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
                Kiagenda
              </h1>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-gray-600">
              <span className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>Agendamentos</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Salões Parceiros</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star className="h-4 w-4" />
                <span>Avaliações</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Agende seus serviços de beleza
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-500">
              de forma simples e rápida
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Conectamos você aos melhores salões de beleza da cidade. 
            Agende quando quiser, de onde estiver.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">
                {userType === 'login' ? 'Fazer Login' : 'Criar Conta'}
              </CardTitle>
              <CardDescription>
                {userType === 'login' 
                  ? 'Acesse sua conta para continuar' 
                  : 'Cadastre-se para começar a usar'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="client" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="client" className="text-sm">
                    👤 Cliente
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="text-sm">
                    🏪 Administrador
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="client" className="space-y-4">
                  {userType === 'login' ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-phone">Telefone</Label>
                        <Input
                          id="client-phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={clientForm.telefone}
                          onChange={(e) => setClientForm({...clientForm, telefone: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleClientLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        Entrar como Cliente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="client-name">Nome Completo</Label>
                        <Input
                          id="client-name"
                          placeholder="Seu nome completo"
                          value={clientForm.nome}
                          onChange={(e) => setClientForm({...clientForm, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="client-phone-reg">Telefone</Label>
                        <Input
                          id="client-phone-reg"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={clientForm.telefone}
                          onChange={(e) => setClientForm({...clientForm, telefone: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleClientLogin}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      >
                        Cadastrar como Cliente
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  {userType === 'login' ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-login">Login</Label>
                        <Input
                          id="admin-login"
                          placeholder="Seu login"
                          value={adminForm.login}
                          onChange={(e) => setAdminForm({...adminForm, login: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Senha</Label>
                        <Input
                          id="admin-password"
                          type="password"
                          placeholder="Sua senha"
                          value={adminForm.senha}
                          onChange={(e) => setAdminForm({...adminForm, senha: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={handleAdminLogin}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                      >
                        Entrar como Administrador
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-name">Nome do Responsável</Label>
                        <Input
                          id="admin-name"
                          placeholder="Nome do responsável"
                          value={adminForm.responsavel}
                          onChange={(e) => setAdminForm({...adminForm, responsavel: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="salon-name">Nome do Salão</Label>
                        <Input
                          id="salon-name"
                          placeholder="Nome do seu salão"
                          value={adminForm.salao}
                          onChange={(e) => setAdminForm({...adminForm, salao: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-phone">Telefone</Label>
                        <Input
                          id="admin-phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={adminForm.telefone}
                          onChange={(e) => setAdminForm({...adminForm, telefone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="salon-address">Endereço</Label>
                        <Input
                          id="salon-address"
                          placeholder="Endereço completo do salão"
                          value={adminForm.endereco}
                          onChange={(e) => setAdminForm({...adminForm, endereco: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-login-reg">Login</Label>
                        <Input
                          id="admin-login-reg"
                          placeholder="Escolha um login único"
                          value={adminForm.login}
                          onChange={(e) => setAdminForm({...adminForm, login: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password-reg">Senha</Label>
                        <Input
                          id="admin-password-reg"
                          type="password"
                          placeholder="Escolha uma senha segura"
                          value={adminForm.senha}
                          onChange={(e) => setAdminForm({...adminForm, senha: e.target.value})}
                        />
                      </div>
                      <Button 
                        onClick={() => window.location.href = '/plan-selection'}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                      >
                        Cadastrar Salão
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

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-lg bg-white/60 backdrop-blur-sm">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Agendamento Fácil</h3>
            <p className="text-gray-600 text-sm">
              Agende seus serviços em poucos cliques, 24 horas por dia
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/60 backdrop-blur-sm">
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Melhores Salões</h3>
            <p className="text-gray-600 text-sm">
              Acesso aos salões mais bem avaliados da sua cidade
            </p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/60 backdrop-blur-sm">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Gestão Completa</h3>
            <p className="text-gray-600 text-sm">
              Para salões: gerencie agendamentos e clientes facilmente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
