
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Lock, Phone, Mail, MapPin, Building } from "lucide-react";
import { useClientLoginLogic } from '@/hooks/useClientLoginLogic';
import { StateSelect } from "@/components/ui/state-select";
import { CitySelect } from "@/components/ui/city-select";
import { usePhoneValidation } from '@/hooks/usePhoneValidation';
import { ForgotPasswordModal } from "@/components/auth/ForgotPasswordModal";
import { SimplePasswordResetModal } from "@/components/auth/SimplePasswordResetModal";

const ClientAuthForm = () => {
  const { handleLogin, handleRegister, loading } = useClientLoginLogic();
  const { formatPhone, validatePhone, getPhoneDigits } = usePhoneValidation();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    password: '',
    phone: '',
    email: '',
    city: '',
    state: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const onLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('LOGIN FORM - Submitting login with:', loginData);
    await handleLogin(loginData.username, loginData.password);
  };

  const onRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('REGISTER FORM - Submitting registration with:', registerData);
    await handleRegister(
      registerData.username, 
      registerData.password, 
      getPhoneDigits(registerData.phone), // Enviar apenas os dígitos
      registerData.email,
      registerData.city,
      registerData.state
    );
  };

  const handleRegisterInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      // Aplicar formatação no telefone
      const formattedPhone = formatPhone(value);
      setRegisterData(prev => ({ ...prev, [field]: formattedPhone }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }
    
    // Clear city when state changes
    if (field === 'state') {
      setRegisterData(prev => ({ ...prev, city: '' }));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-gray-800">Área do Cliente</CardTitle>
          <p className="text-gray-600">Faça login ou crie sua conta</p>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar Conta</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={onLoginSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-username">Nome de usuário</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-username"
                      value={loginData.username}
                      onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                      placeholder="Seu nome de usuário"
                      className="pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      placeholder="Sua senha"
                      className="pl-10 pr-10"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={onRegisterSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-username">Nome de usuário *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-username"
                      value={registerData.username}
                      onChange={(e) => handleRegisterInputChange('username', e.target.value)}
                      placeholder="Escolha um nome de usuário"
                      className="pl-10"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Senha *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="pl-10 pr-10"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Telefone *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-phone"
                      value={registerData.phone}
                      onChange={(e) => handleRegisterInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className={`pl-10 ${!validatePhone(registerData.phone) && registerData.phone ? 'border-red-500' : ''}`}
                      disabled={loading}
                      required
                    />
                  </div>
                  {registerData.phone && !validatePhone(registerData.phone) && (
                    <p className="text-sm text-red-500">Telefone deve ter 10 ou 11 dígitos</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="register-state">Estado</Label>
                    <StateSelect
                      value={registerData.state}
                      onValueChange={(value) => handleRegisterInputChange('state', value)}
                      placeholder="Selecione"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-city">Cidade</Label>
                    <CitySelect
                      value={registerData.city}
                      onValueChange={(value) => handleRegisterInputChange('city', value)}
                      state={registerData.state}
                      placeholder="Digite a cidade"
                      disabled={!registerData.state || loading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Criando conta...' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Modal de Recuperação de Senha */}
      <SimplePasswordResetModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        userType="client"
      />
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientAuthForm;
