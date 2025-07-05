
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StateSelect } from "@/components/ui/state-select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Lock, Phone, Mail, MapPin, Home } from "lucide-react";
import { useClientAuth } from '@/hooks/useClientAuth';

const ClientAuthForm = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    email: '',
    fullName: '',
    city: '',
    state: '',
    address: '',
    houseNumber: '',
    neighborhood: '',
    zipCode: ''
  });
  
  const { loading, authenticateClient, registerClient } = useClientAuth();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    const result = await authenticateClient(loginData.username, loginData.password);
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.username || !registerData.password || !registerData.phone) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios: nome de usuário, senha e telefone",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    if (registerData.password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    const result = await registerClient(
      registerData.username,
      registerData.password,
      registerData.phone,
      registerData.email || undefined
    );
    
    if (result.success) {
      toast({
        title: "Sucesso",
        description: "Cadastro realizado com sucesso! Faça login para continuar."
      });
      setActiveTab('login');
      setLoginData({ username: registerData.username, password: '' });
      setRegisterData({
        username: '',
        password: '',
        confirmPassword: '',
        phone: '',
        email: '',
        fullName: '',
        city: '',
        state: '',
        address: '',
        houseNumber: '',
        neighborhood: '',
        zipCode: ''
      });
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Área do Cliente
          </CardTitle>
          <p className="text-gray-600">
            Faça login ou cadastre-se para agendar seus serviços
          </p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username">Nome de usuário *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Seu nome de usuário"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="reg-username">Nome de usuário *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-username"
                      type="text"
                      placeholder="Escolha um nome de usuário"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-fullname">Nome completo</Label>
                  <Input
                    id="reg-fullname"
                    type="text"
                    placeholder="Seu nome completo"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="reg-phone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-phone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reg-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-city">Cidade</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reg-city"
                        type="text"
                        placeholder="Sua cidade"
                        value={registerData.city}
                        onChange={(e) => setRegisterData({...registerData, city: e.target.value})}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="reg-state">Estado</Label>
                    <StateSelect
                      value={registerData.state}
                      onValueChange={(value) => setRegisterData({...registerData, state: value})}
                      placeholder="UF"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="reg-address">Endereço</Label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-address"
                      type="text"
                      placeholder="Rua, avenida..."
                      value={registerData.address}
                      onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="reg-house">Número</Label>
                    <Input
                      id="reg-house"
                      type="text"
                      placeholder="123"
                      value={registerData.houseNumber}
                      onChange={(e) => setRegisterData({...registerData, houseNumber: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reg-neighborhood">Bairro</Label>
                    <Input
                      id="reg-neighborhood"
                      type="text"
                      placeholder="Bairro"
                      value={registerData.neighborhood}
                      onChange={(e) => setRegisterData({...registerData, neighborhood: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="reg-zip">CEP</Label>
                    <Input
                      id="reg-zip"
                      type="text"
                      placeholder="00000-000"
                      value={registerData.zipCode}
                      onChange={(e) => setRegisterData({...registerData, zipCode: e.target.value})}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reg-password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="reg-confirm">Confirmar senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="Digite a senha novamente"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              variant="ghost" 
              onClick={() => window.location.href = '/'}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              ← Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAuthForm;
