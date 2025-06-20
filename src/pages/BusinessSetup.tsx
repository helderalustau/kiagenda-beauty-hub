
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useSalonData } from '@/hooks/useSalonData';
import { Building2, MapPin, Clock, Users, Globe, Camera, Check } from "lucide-react";

interface BusinessData {
  name: string;
  cnpj_cpf: string;
  phone: string;
  email: string;
  description: string;
  address: string;
  street_number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  complement: string;
  opening_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  instagram: string;
  whatsapp: string;
  website: string;
  banner_image_url: string;
}

const BusinessSetup = () => {
  const { toast } = useToast();
  const { updateSalon, loading } = useSalonData();
  const [currentStep, setCurrentStep] = useState(0);
  const [salonId, setSalonId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const [businessData, setBusinessData] = useState<BusinessData>({
    name: '',
    cnpj_cpf: '',
    phone: '',
    email: '',
    description: '',
    address: '',
    street_number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    complement: '',
    opening_hours: {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    },
    instagram: '',
    whatsapp: '',
    website: '',
    banner_image_url: ''
  });

  const steps = [
    { title: 'Dados Gerais', icon: Building2 },
    { title: 'Endereço', icon: MapPin },
    { title: 'Funcionamento', icon: Clock },
    { title: 'Contatos Digitais', icon: Globe },
    { title: 'Finalização', icon: Check }
  ];

  useEffect(() => {
    // Verificar se existe salon_id armazenado
    const storedSalonId = localStorage.getItem('selectedSalonId');
    if (storedSalonId) {
      setSalonId(storedSalonId);
    } else {
      toast({
        title: "Erro",
        description: "ID do estabelecimento não encontrado. Redirecionando...",
        variant: "destructive"
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }
  }, []);

  const updateBusinessData = (field: keyof BusinessData | string, value: any) => {
    setBusinessData(prev => {
      if (field.includes('.')) {
        const [parent, child, subChild] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof BusinessData],
            [child]: subChild ? {
              ...(prev[parent as keyof BusinessData] as any)[child],
              [subChild]: value
            } : value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      const result = await updateSalon(salonId, {
        name: businessData.name,
        phone: businessData.phone,
        address: `${businessData.address}, ${businessData.street_number}`,
        street_number: businessData.street_number,
        city: businessData.city,
        state: businessData.state,
        contact_phone: businessData.phone,
        opening_hours: businessData.opening_hours,
        banner_image_url: businessData.banner_image_url,
        setup_completed: true,
        is_open: true
      });

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Configuração do negócio concluída com sucesso!"
        });
        
        // Limpar dados temporários
        localStorage.removeItem('pendingAdminData');
        localStorage.removeItem('selectedSalonId');
        
        // Redirecionar para dashboard
        setTimeout(() => {
          window.location.href = '/admin-dashboard';
        }, 2000);
      } else {
        throw new Error(result.message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao finalizar configuração:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Dados Gerais
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Salão *</Label>
                <Input
                  id="name"
                  value={businessData.name}
                  onChange={(e) => updateBusinessData('name', e.target.value)}
                  placeholder="Nome do seu estabelecimento"
                />
              </div>
              <div>
                <Label htmlFor="cnpj_cpf">CNPJ ou CPF</Label>
                <Input
                  id="cnpj_cpf"
                  value={businessData.cnpj_cpf}
                  onChange={(e) => updateBusinessData('cnpj_cpf', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={businessData.phone}
                  onChange={(e) => updateBusinessData('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail de Contato</Label>
                <Input
                  id="email"
                  type="email"
                  value={businessData.email}
                  onChange={(e) => updateBusinessData('email', e.target.value)}
                  placeholder="contato@seusalao.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição/Bio do Estabelecimento</Label>
              <Textarea
                id="description"
                value={businessData.description}
                onChange={(e) => updateBusinessData('description', e.target.value)}
                placeholder="Conte um pouco sobre seu salão, serviços oferecidos, especialidades..."
                rows={3}
              />
            </div>
          </div>
        );
      
      case 1: // Endereço
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="address">Rua/Avenida *</Label>
                <Input
                  id="address"
                  value={businessData.address}
                  onChange={(e) => updateBusinessData('address', e.target.value)}
                  placeholder="Nome da rua ou avenida"
                />
              </div>
              <div>
                <Label htmlFor="street_number">Número *</Label>
                <Input
                  id="street_number"
                  value={businessData.street_number}
                  onChange={(e) => updateBusinessData('street_number', e.target.value)}
                  placeholder="123"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={businessData.neighborhood}
                  onChange={(e) => updateBusinessData('neighborhood', e.target.value)}
                  placeholder="Nome do bairro"
                />
              </div>
              <div>
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  value={businessData.zip_code}
                  onChange={(e) => updateBusinessData('zip_code', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={businessData.city}
                  onChange={(e) => updateBusinessData('city', e.target.value)}
                  placeholder="Nome da cidade"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  value={businessData.state}
                  onChange={(e) => updateBusinessData('state', e.target.value)}
                  placeholder="SP"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={businessData.complement}
                onChange={(e) => updateBusinessData('complement', e.target.value)}
                placeholder="Apartamento, sala, andar..."
              />
            </div>
          </div>
        );
      
      case 2: // Funcionamento
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Horários de Funcionamento</h3>
            {Object.entries(businessData.opening_hours).map(([day, hours]) => {
              const dayNames = {
                monday: 'Segunda-feira',
                tuesday: 'Terça-feira',
                wednesday: 'Quarta-feira',
                thursday: 'Quinta-feira',
                friday: 'Sexta-feira',
                saturday: 'Sábado',
                sunday: 'Domingo'
              };
              
              return (
                <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="w-32">
                    <Label className="font-medium">{dayNames[day as keyof typeof dayNames]}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => updateBusinessData(`opening_hours.${day}.closed`, !e.target.checked)}
                      className="mr-2"
                    />
                    <Label>Aberto</Label>
                  </div>
                  {!hours.closed && (
                    <>
                      <div>
                        <Label className="text-sm">Abertura</Label>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => updateBusinessData(`opening_hours.${day}.open`, e.target.value)}
                          className="w-24"
                        />
                      </div>
                      <div>
                        <Label className="text-sm">Fechamento</Label>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => updateBusinessData(`opening_hours.${day}.close`, e.target.value)}
                          className="w-24"
                        />
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      
      case 3: // Contatos Digitais
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={businessData.instagram}
                onChange={(e) => updateBusinessData('instagram', e.target.value)}
                placeholder="@seusalao"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={businessData.whatsapp}
                onChange={(e) => updateBusinessData('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="website">Site</Label>
              <Input
                id="website"
                value={businessData.website}
                onChange={(e) => updateBusinessData('website', e.target.value)}
                placeholder="https://www.seusalao.com"
              />
            </div>
            <div>
              <Label htmlFor="banner_image_url">URL da Foto de Capa/Logomarca</Label>
              <Input
                id="banner_image_url"
                value={businessData.banner_image_url}
                onChange={(e) => updateBusinessData('banner_image_url', e.target.value)}
                placeholder="https://exemplo.com/sua-logo.jpg"
              />
            </div>
          </div>
        );
      
      case 4: // Finalização
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Configuração Quase Concluída!
              </h3>
              <p className="text-gray-600">
                Revise suas informações e clique em "Finalizar" para completar a configuração do seu estabelecimento.
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold mb-2">Resumo das Informações:</h4>
              <ul className="space-y-1 text-sm">
                <li><strong>Nome:</strong> {businessData.name || 'Não informado'}</li>
                <li><strong>Telefone:</strong> {businessData.phone || 'Não informado'}</li>
                <li><strong>Endereço:</strong> {businessData.address ? `${businessData.address}, ${businessData.street_number}` : 'Não informado'}</li>
                <li><strong>Cidade:</strong> {businessData.city || 'Não informado'}</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const Icon = steps[currentStep].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Configuração do Seu Negócio
            </h1>
            <p className="text-gray-600">
              Configure as informações do seu estabelecimento para começar a usar o sistema
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <Progress value={progress} className="mb-4" />
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`rounded-full p-2 mb-2 ${index <= currentStep ? 'bg-blue-100' : 'bg-gray-100'}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-6 w-6" />
                {steps[currentStep].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStep()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </Button>
                
                {currentStep === steps.length - 1 ? (
                  <Button
                    onClick={handleFinish}
                    disabled={submitting || loading}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  >
                    {submitting ? "Finalizando..." : "Finalizar Configuração"}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-blue-600 to-pink-500 hover:from-blue-700 hover:to-pink-600"
                  >
                    Próximo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessSetup;
