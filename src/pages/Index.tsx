import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Scissors, Users, Eye, EyeOff } from "lucide-react";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import AdminSignupForm from '@/components/AdminSignupForm';

const Index = () => {
  const [userType, setUserType] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [clientForm, setClientForm] = useState({ nome: '', senha: '', telefone: '', email: '' });
  const [adminForm, setAdminForm] = useState({ nome: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [showAdminSignup, setShowAdminSignup] = useState(false);

  const { authenticateClient, authenticateAdmin, registerClient, createSalon } = useSupabaseData();
  const { toast } = useToast();

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
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });
      window.location.href = '/salon-selection';
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
      toast({
        title: "Sucesso",
        description: "Cadastro realizado com sucesso!"
      });
      window.location.href = '/salon-selection';
    } else {
      toast({
        title: "Erro",
        description: result.message,
        variant: "destructive"
      });
    }
  };

  const createTemporarySalon = async (adminData: any) => {
    const temporarySalonData = {
      name: 'Estabelecimento Temporário',
      owner_name: adminData.name,
      phone: adminData.phone || '(00) 00000-0000',
      address: 'Endereço a ser configurado',
      plan: 'bronze',
      is_open: false,
      setup_completed: false
    };

    console.log('Criando estabelecimento temporário para admin:', adminData.id);
    const salonResult = await createSalon(temporarySalonData);
    
    if (salonResult.success && salonResult.salon) {
      console.log('Estabelecimento temporário criado:', salonResult.salon.id);
      
      // Atualizar o admin com o salon_id
      const { updateAdminUser } = useSupabaseData();
      const updateResult = await updateAdminUser({
        id: adminData.id,
        salon_id: salonResult.salon.id
      });
      
      if (updateResult.success) {
        console.log('Admin atualizado com salon_id');
        // Atualizar localStorage com os dados atualizados
        const updatedAdminData = {
          ...adminData,
          salon_id: salonResult.salon.id
        };
        localStorage.setItem('adminData', JSON.stringify(updatedAdminData));
        localStorage.setItem('selectedSalonId', salonResult.salon.id);
        return salonResult.salon.id;
      }
    }
    
    return null;
  };

  const handleAdminLogin = async () => {
    if (!adminForm.nome || !adminForm.senha) {
      toast({
        title: "Erro",
        description: "Preencha nome e senha",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const result = await authenticateAdmin(adminForm.nome, adminForm.senha);
    setLoading(false);

    if (result.success && result.admin) {
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('adminData', JSON.stringify(result.admin));
      
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!"
      });

      // Verificar se é super admin
      if (result.admin.role === 'super_admin') {
        window.location.href = '/super-admin-dashboard';
        return;
      }

      // Verificar se o admin possui estabelecimento
      if (!result.admin.salon_id) {
        console.log('Admin sem estabelecimento, criando estabelecimento temporário...');
        
        // Criar estabelecimento temporário
        const temporarySalonId = await createTemporarySalon(result.admin);
        
        if (temporarySalonId) {
          toast({
            title: "Configuração Necessária",
            description: "Complete a configuração do seu estabelecimento para continuar."
          });
          window.location.href = '/salon-setup';
        } else {
          toast({
            title: "Erro",
            description: "Erro ao criar estabelecimento. Tente novamente.",
            variant: "destructive"
          });
        }
      } else {
        // Admin já possui estabelecimento, ir para dashboard
        localStorage.setItem('selectedSalonId', result.admin.salon_id);
        window.location.href = '/admin-dashboard';
      }
    } else {
      toast({
        title: "Erro de Login",
        description: "Nome ou senha incorretos. Se você ainda não possui uma conta de administrador, clique em 'Não tem conta? Cadastre-se' para criar sua conta.",
        variant: "destructive"
      });
    }
  };

  const handleAdminSignupSuccess = (adminData: any) => {
    console.log('Admin cadastrado com sucesso:', adminData);
    setShowAdminSignup(false);
    setUserType('login');
    toast({
      title: "Conta Criada!",
      description: "Agora você pode fazer login com suas credenciais."
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const result = await createSalon(formData);
      
      if (result.success && result.salon) {
        toast({
          title: "Sucesso",
          description: "Estabelecimento criado com sucesso!"
        });
        
        // Armazenar dados do salão
        localStorage.setItem('selectedSalonId', result.salon.id);
        
        // Resetar formulário
        setFormData({
          name: '',
          owner_name: '',
          phone: '',
          address: '',
          plan: 'bronze'
        });
        
        // Redirecionar para dashboard
        setTimeout(() => {
          window.location.href = '/admin-dashboard';
        }, 2000);
      } else {
        throw new Error(result.message || 'Erro desconhecido ao criar estabelecimento');
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    address: '',
    plan: 'bronze'
  });
  const [submitting, setSubmitting] = useState(false);

  // Se estiver mostrando o formulário de cadastro de admin, renderizar apenas ele
  if (showAdminSignup) {
    return (
      <AdminSignupForm
        onSuccess={handleAdminSignupSuccess}
        onCancel={() => setShowAdminSignup(false)}
      />
    );
  }

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
            Conectamos você, com os melhores salões de beleza da cidade. 
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
                        {loading ? 'Entrando...' : 'Entrar como Cliente'}
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
                          placeholder="(11) 99999-9999"
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
                        {loading ? 'Cadastrando...' : 'Cadastrar como Cliente'}
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="admin" className="space-y-4">
                  {userType === 'login' ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="admin-name">Nome</Label>
                        <Input
                          id="admin-name"
                          placeholder="Seu nome"
                          value={adminForm.nome}
                          onChange={(e) => setAdminForm({...adminForm, nome: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="admin-password">Senha</Label>
                        <div className="relative">
                          <Input
                            id="admin-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Sua senha"
                            value={adminForm.senha}
                            onChange={(e) => setAdminForm({...adminForm, senha: e.target.value})}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <Button 
                        onClick={handleAdminLogin}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                      >
                        {loading ? 'Entrando...' : 'Entrar como Administrador'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-6 rounded-xl border border-pink-100">
                        <h3 className="text-lg font-semibold text-pink-800 mb-2">
                          Criar Conta Administrativa
                        </h3>
                        <p className="text-pink-700 text-sm mb-4">
                          Complete seu cadastro com todos os dados necessários para acessar o painel administrativo
                        </p>
                        
                        <Button 
                          onClick={() => setShowAdminSignup(true)}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
                        >
                          Começar Cadastro Completo
                        </Button>
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Cadastro completo com todos os dados necessários</p>
                        <p>• Vinculação automática ao estabelecimento</p>
                        <p>• Controle total do painel administrativo</p>
                      </div>
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
