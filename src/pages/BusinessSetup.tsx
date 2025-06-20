
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSalonData } from '@/hooks/useSalonData';
import { ArrowLeft, ArrowRight, Building, MapPin, Clock, Camera } from "lucide-react";

interface BusinessData {
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  cnpj_cpf: string;
  description: string;
  address: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  complement: string;
  opening_hours: string;
  instagram: string;
  whatsapp: string;
  website: string;
}

const BusinessSetup = () => {
  const { toast } = useToast();
  const { updateSalon } = useSalonData();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    owner_name: '',
    phone: '',
    email: '',
    cnpj_cpf: '',
    description: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    complement: '',
    opening_hours: '',
    instagram: '',
    whatsapp: '',
    website: ''
  });

  useEffect(() => {
    // Load admin data from localStorage
    const adminData = localStorage.getItem('adminData');
    if (adminData) {
      const parsedData = JSON.parse(adminData);
      setBusinessData(prev => ({
        ...prev,
        owner_name: parsedData.name || '',
        phone: parsedData.phone || '',
        email: parsedData.email || ''
      }));
    }
  }, []);

  const handleInputChange = (field: keyof BusinessData, value: string) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const salonId = localStorage.getItem('selectedSalonId');
      if (!salonId) {
        throw new Error('ID do estabelecimento não encontrado');
      }

      const result = await updateSalon(salonId, businessData);
      
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Configuração do negócio concluída com sucesso!"
        });
        
        // Clean up localStorage
        localStorage.removeItem('adminData');
        localStorage.removeItem('selectedSalonId');
        
        // Redirect to admin dashboard
        window.location.href = '/admin-dashboard';
      } else {
        throw new Error('message' in result ? result.message : 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Dados Gerais do Estabelecimento</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Salão *</Label>
                <Input
                  id="name"
                  value={businessData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Digite o nome do salão"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner_name">Nome do Proprietário *</Label>
                <Input
                  id="owner_name"
                  value={businessData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  placeholder="Nome do proprietário"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={businessData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail de Contato</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contato@salao.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cnpj_cpf">CNPJ ou CPF</Label>
                <Input
                  id="cnpj_cpf"
                  value={businessData.cnpj_cpf}
                  onChange={(e) => handleInputChange('cnpj_cpf', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição do Salão</Label>
              <Textarea
                id="description"
                value={businessData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descreva seu salão, especialidades, diferenciais..."
                rows={3}
              />
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Endereço</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Rua/Avenida *</Label>
                <Input
                  id="address"
                  value={businessData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nome da rua ou avenida"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  value={businessData.number}
                  onChange={(e) => handleInputChange('number', e.target.value)}
                  placeholder="123"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={businessData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={businessData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={businessData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="SP"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={businessData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={businessData.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
                placeholder="Apartamento, sala, andar..."
              />
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Funcionamento</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="opening_hours">Horários de Atendimento</Label>
              <Textarea
                id="opening_hours"
                value={businessData.opening_hours}
                onChange={(e) => handleInputChange('opening_hours', e.target.value)}
                placeholder="Segunda a Sexta: 8h às 18h&#10;Sábado: 8h às 16h&#10;Domingo: Fechado"
                rows={4}
              />
              <p className="text-sm text-gray-500">
                Informe os dias e horários de funcionamento do seu salão
              </p>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Contatos Digitais</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={businessData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  placeholder="@seusalao"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={businessData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={businessData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="www.seusalao.com.br"
                />
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.href = '/'}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Início
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuração do Negócio
            </h1>
            <p className="text-gray-600">
              Configure os dados do seu estabelecimento
            </p>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Etapa {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / totalSteps) * 100)}% concluído
              </span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">
              Etapa {currentStep}: {
                currentStep === 1 ? 'Dados Gerais' :
                currentStep === 2 ? 'Endereço' :
                currentStep === 3 ? 'Funcionamento' :
                'Contatos Digitais'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                >
                  {loading ? 'Salvando...' : 'Finalizar Configuração'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessSetup;
