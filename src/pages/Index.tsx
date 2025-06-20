import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Mail, Calendar, Clock, Star, Building2, Scissors, ShieldCheck, Users, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { useSalonData } from '@/hooks/useSalonData';

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { createSalon } = useSalonData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phone: '',
    address: '',
    plan: 'bronze' as 'bronze' | 'prata' | 'gold'
  });

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push('Nome do estabelecimento é obrigatório');
    }
    if (!formData.ownerName.trim()) {
      errors.push('Nome do responsável é obrigatório');
    }
    if (!formData.phone.trim()) {
      errors.push('Telefone é obrigatório');
    }
    if (!formData.address.trim()) {
      errors.push('Endereço é obrigatório');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: "Erro de Validação",
        description: validationErrors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createSalon({
        name: formData.name.trim(),
        owner_name: formData.ownerName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        plan: formData.plan
      });

      if (result.success && 'salon' in result && result.salon) {
        toast({
          title: "Sucesso",
          description: "Estabelecimento criado com sucesso! Você será redirecionado para a seleção de planos."
        });
        
        localStorage.setItem('selectedSalonId', result.salon.id);
        
        setFormData({
          name: '',
          ownerName: '',
          phone: '',
          address: '',
          plan: 'bronze'
        });
        
        setTimeout(() => {
          navigate('/plan-selection');
        }, 2000);
      } else {
        // Handle error case - check if message exists
        const errorMessage = 'message' in result && result.message 
          ? result.message 
          : 'Erro desconhecido';
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar estabelecimento",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const navigateToAdminDashboard = () => {
    navigate('/admin-dashboard');
  };

  const navigateToSuperAdminDashboard = () => {
    navigate('/super-admin-dashboard');
  };

  const navigateToAdminRegistration = () => {
    navigate('/admin-registration');
  };

  const navigateToClientBooking = () => {
    navigate('/client-booking');
  };

  const handleQuickCreateSalon = async () => {
    setIsSubmitting(true);
    
    try {
      const timestamp = Date.now();
      const randomName = `Salão Demo ${timestamp}`;
      
      const result = await createSalon({
        name: randomName,
        owner_name: 'Administrador Demo',
        phone: '(11) 99999-9999',
        address: 'Rua Demo, 123 - Centro',
        plan: 'bronze'
      });

      if (result.success && 'salon' in result && result.salon) {
        localStorage.setItem('selectedSalonId', result.salon.id);
        toast({
          title: "Sucesso",
          description: `Estabelecimento "${randomName}" criado! Redirecionando...`
        });
        
        setTimeout(() => {
          navigate('/admin-registration');
        }, 1500);
      } else {
        // Handle error case - check if message exists
        const errorMessage = 'message' in result && result.message 
          ? result.message 
          : 'Erro desconhecido';
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar estabelecimento de demonstração",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-pink-600 rounded-lg p-2">
                <Scissors className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent">
                BeautyFlow
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={navigateToAdminDashboard}
                variant="outline" 
                size="sm"
                className="hidden md:inline-flex"
              >
                Admin Dashboard
              </Button>
              <Button 
                onClick={navigateToSuperAdminDashboard}
                variant="outline" 
                size="sm"
                className="hidden md:inline-flex"
              >
                Super Admin
              </Button>
              <Button 
                onClick={navigateToClientBooking}
                variant="outline" 
                size="sm"
              >
                Área do Cliente
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Transforme seu Salão com 
            <span className="bg-gradient-to-r from-blue-600 to-pink-600 bg-clip-text text-transparent"> Tecnologia</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo de gestão para salões de beleza, barbearias e clínicas estéticas. 
            Agende, gerencie e cresça seu negócio com nossa plataforma intuitiva.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={navigateToAdminRegistration}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Começar Agora - Grátis
            </Button>
            <Button 
              onClick={handleQuickCreateSalon}
              disabled={isSubmitting}
              variant="outline" 
              size="lg"
              className="px-8 py-3 rounded-full text-lg font-semibold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-all duration-300"
            >
              {isSubmitting ? 'Criando...' : 'Demo Rápida'}
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Agendamento Inteligente</CardTitle>
              <CardDescription>
                Sistema automatizado de agendamentos com confirmações por WhatsApp e notificações em tempo real.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Gestão de Clientes</CardTitle>
              <CardDescription>
                Cadastro completo de clientes com histórico de serviços, preferências e dados de contato organizados.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl">Planos Flexíveis</CardTitle>
              <CardDescription>
                Escolha o plano ideal para seu negócio, desde freelancers até grandes estabelecimentos.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Planos que Crescem com Você</h3>
            <p className="text-lg text-gray-600">Escolha o plano perfeito para seu estabelecimento</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Bronze Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Bronze</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 49</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Ideal para profissionais autônomos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>1 Atendente</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Agendamentos Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Notificações WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Básicos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Silver Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-gray-300 shadow-lg hover:shadow-xl transition-all duration-300 transform scale-105">
              <CardHeader className="text-center pb-6">
                <Badge className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-3 py-1 text-sm font-semibold mb-2">
                  MAIS POPULAR
                </Badge>
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Prata</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 99</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Perfeito para salões pequenos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Até 3 Atendentes</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Agendamentos Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Notificações WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Avançados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Gestão de Estoque</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gold Plan */}
            <Card className="bg-white/80 backdrop-blur-sm border-2 border-yellow-300 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Ouro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">R$ 199</span>
                  <span className="text-gray-600">/mês</span>
                </div>
                <CardDescription>Para grandes estabelecimentos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Atendentes Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Agendamentos Ilimitados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Notificações WhatsApp</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Relatórios Completos</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Gestão de Estoque</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                    <span>Suporte Prioritário</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Registration Form */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Cadastre seu Estabelecimento</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Comece a usar nossa plataforma em poucos minutos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Estabelecimento</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Salão Beautiful"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nome do Responsável</Label>
                    <Input
                      id="ownerName"
                      placeholder="Seu nome completo"
                      value={formData.ownerName}
                      onChange={(e) => handleInputChange('ownerName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Textarea
                    id="address"
                    placeholder="Rua, número, bairro, cidade - CEP"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan">Plano Desejado</Label>
                  <Select value={formData.plan} onValueChange={(value) => handleInputChange('plan', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano"  />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bronze">Bronze - R$ 49/mês</SelectItem>
                      <SelectItem value="prata">Prata - R$ 99/mês</SelectItem>
                      <SelectItem value="gold">Ouro - R$ 199/mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Cadastrando...' : 'Cadastrar Estabelecimento'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
