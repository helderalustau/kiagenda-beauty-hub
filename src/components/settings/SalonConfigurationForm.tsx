import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Salon } from '@/types/supabase-entities';
import SalonBannerManager from '@/components/SalonBannerManager';

interface SalonConfigurationFormProps {
  salon: Salon;
  onSalonChange: (updatedSalon: Salon) => Promise<void>;
}

// Função para formatar telefone internacional brasileiro
const formatBrazilianPhone = (value: string): string => {
  let numbers = value.replace(/\D/g, '');
  
  // Remove o código do país se já estiver presente
  if (numbers.startsWith('55') && numbers.length > 11) {
    numbers = numbers.substring(2);
  }
  
  // Limita a 11 dígitos
  numbers = numbers.substring(0, 11);
  
  if (numbers.length === 0) return '';
  if (numbers.length <= 2) return `+55 (${numbers}`;
  if (numbers.length <= 6) return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  if (numbers.length <= 10) return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  return `+55 (${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

// Função para extrair apenas números
const extractNumbers = (phone: string): string => {
  return phone.replace(/\D/g, '');
};

// Função para validar telefone
const validatePhone = (phone: string): boolean => {
  const numbers = extractNumbers(phone);
  return numbers.length >= 10 && numbers.length <= 11;
};

const SalonConfigurationForm = ({ salon, onSalonChange }: SalonConfigurationFormProps) => {
  const { updateSalon } = useSupabaseData();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: salon.name || '',
    owner_name: salon.owner_name || '',
    phone: formatBrazilianPhone(salon.phone || ''),
    contact_phone: formatBrazilianPhone(salon.contact_phone || ''),
    address: salon.address || '',
    city: salon.city || '',
    state: salon.state || '',
    street_number: salon.street_number || '',
    instagram_username: salon.instagram_username || '',
    is_open: salon.is_open || false,
    notification_sound: salon.notification_sound || 'default'
  });
  
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    if (field === 'phone' || field === 'contact_phone') {
      // Aplicar formatação de telefone brasileiro
      const formattedValue = formatBrazilianPhone(value as string);
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar telefones
    if (formData.phone && !validatePhone(formData.phone)) {
      toast({
        title: "Erro de Validação",
        description: "Telefone principal deve ter 10 ou 11 dígitos",
        variant: "destructive"
      });
      return;
    }

    if (formData.contact_phone && !validatePhone(formData.contact_phone)) {
      toast({
        title: "Erro de Validação", 
        description: "Telefone de contato deve ter 10 ou 11 dígitos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Extrair apenas números dos telefones para salvar
      const updateData = {
        ...formData,
        phone: extractNumbers(formData.phone),
        contact_phone: formData.contact_phone ? extractNumbers(formData.contact_phone) : null
      };

      // Garantir que o plan mantenha o tipo correto
      const validPlan = (salon.plan === 'bronze' || salon.plan === 'prata' || salon.plan === 'gold') 
        ? salon.plan 
        : 'bronze' as const;

      // Criar objeto de atualização sem o plan (mantemos o original)
      const salonUpdateData = {
        id: salon.id,
        ...updateData
      };

      const result = await updateSalon(salonUpdateData);
      
      if (result.success && result.salon) {
        // Criar salon atualizado mantendo o plan correto
        const updatedSalonWithPlan: Salon = {
          ...result.salon,
          plan: validPlan
        };

        toast({
          title: "Sucesso",
          description: "Configurações atualizadas com sucesso!"
        });
        
        await onSalonChange(updatedSalonWithPlan);
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar configurações",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating salon:', error);
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Manager */}
      <SalonBannerManager
        salonId={salon.id}
        currentBannerUrl={salon.banner_image_url}
        onBannerUpdate={() => onSalonChange(salon)}
      />

      {/* Formulário de Configurações */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados principais do estabelecimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Estabelecimento *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="owner_name">Nome do Responsável *</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="plan">Plano Atual</Label>
              <Input
                id="plan"
                value={salon.plan === 'bronze' ? 'Bronze' : salon.plan === 'prata' ? 'Prata' : 'Gold'}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">Para alterar o plano, entre em contato com o suporte</p>
            </div>
          </CardContent>
        </Card>

        {/* ===== SEÇÃO INSTAGRAM - NOVA IMPLEMENTAÇÃO ===== */}
        <Card className="border-2 border-pink-200 bg-pink-50/50">
          <CardHeader>
            <CardTitle className="text-pink-700">📱 Instagram</CardTitle>
            <CardDescription>Configure seu perfil do Instagram para aparecer no booking dos clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="instagram_username" className="font-semibold">Usuário do Instagram</Label>
              <Input
                id="instagram_username"
                value={formData.instagram_username}
                onChange={(e) => handleInputChange('instagram_username', e.target.value)}
                placeholder="exemplo: seusalon (sem @)"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">⚠️ Digite apenas o usuário do Instagram (sem o símbolo @)</p>
              <p className="text-xs text-pink-600 mt-1">💡 Quando preenchido, aparecerá um link para o Instagram na tela de agendamento</p>
            </div>
          </CardContent>
        </Card>

        {/* Contato e Localização */}
        <Card>
          <CardHeader>
            <CardTitle>Contato e Localização</CardTitle>
            <CardDescription>Informações de contato e endereço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone Principal *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+55 (XX) XXXXX-XXXX"
                  required
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">Apenas números válidos</p>
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Telefone de Contato</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="+55 (XX) XXXXX-XXXX"
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">Apenas números válidos</p>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="state">Estado (Sigla)</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                  maxLength={2}
                  placeholder="SP"
                />
              </div>
              
              <div>
                <Label htmlFor="street_number">Número</Label>
                <Input
                  id="street_number"
                  value={formData.street_number}
                  onChange={(e) => handleInputChange('street_number', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configurações Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Avançadas</CardTitle>
            <CardDescription>Status e preferências do estabelecimento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_open">Status do Estabelecimento</Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.is_open ? 'Aceitando agendamentos' : 'Não aceitando agendamentos'}
                  </p>
                </div>
                <Switch
                  id="is_open"
                  checked={formData.is_open}
                  onCheckedChange={(checked) => handleInputChange('is_open', checked)}
                />
              </div>

              <div>
                <Label htmlFor="notification_sound">Som de Notificação</Label>
                <Select
                  value={formData.notification_sound}
                  onValueChange={(value) => handleInputChange('notification_sound', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Padrão</SelectItem>
                    <SelectItem value="bell">Sino</SelectItem>
                    <SelectItem value="chime">Campainha</SelectItem>
                    <SelectItem value="alert">Alerta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            'Salvar Configurações'
          )}
        </Button>
      </form>
    </div>
  );
};

export default SalonConfigurationForm;
