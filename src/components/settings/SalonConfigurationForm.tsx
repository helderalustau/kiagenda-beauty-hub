
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { StateSelect } from "@/components/ui/state-select";
import { Store, MapPin, Phone, Clock, Bell } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface SalonConfigurationFormProps {
  salon: Salon;
  onUpdate: (data: Partial<Salon>) => Promise<{ success: boolean; message?: string }>;
}

const SalonConfigurationForm = ({ salon, onUpdate }: SalonConfigurationFormProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: salon.name || '',
    owner_name: salon.owner_name || '',
    phone: salon.phone || '',
    contact_phone: salon.contact_phone || '',
    street_number: salon.street_number || '',
    city: salon.city || '',
    state: salon.state || '',
    address: salon.address || '',
    notification_sound: salon.notification_sound || 'default',
    opening_hours: salon.opening_hours || {
      monday: { open: '08:00', close: '18:00', closed: false },
      tuesday: { open: '08:00', close: '18:00', closed: false },
      wednesday: { open: '08:00', close: '18:00', closed: false },
      thursday: { open: '08:00', close: '18:00', closed: false },
      friday: { open: '08:00', close: '18:00', closed: false },
      saturday: { open: '08:00', close: '16:00', closed: false },
      sunday: { open: '08:00', close: '16:00', closed: true }
    }
  });

  const days = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const notificationSounds = [
    { value: 'default', label: 'Padrão' },
    { value: 'bell', label: 'Sino' },
    { value: 'chime', label: 'Carrilhão' },
    { value: 'notification', label: 'Notificação' }
  ];

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone' || field === 'contact_phone') {
      value = formatPhone(value);
    } else if (['name', 'owner_name', 'city', 'state'].includes(field)) {
      value = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do estabelecimento é obrigatório",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      const updateData = {
        ...formData,
        address: `${formData.street_number}, ${formData.city}, ${formData.state}`.replace(/^, |, $/, '')
      };

      const result = await onUpdate(updateData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Configurações salvas com sucesso"
        });
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao salvar configurações",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Estabelecimento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do estabelecimento"
              />
            </div>
            <div>
              <Label htmlFor="owner_name">Nome do Responsável</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Endereço</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="street_number">Endereço e Número</Label>
              <Input
                id="street_number"
                value={formData.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
                placeholder="Rua, nº 123"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <StateSelect
                value={formData.state}
                onValueChange={(value) => handleInputChange('state', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Contato</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone Principal</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="contact_phone">Telefone de Contato</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horário de Funcionamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {days.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-4 p-3 border rounded-lg">
              <div className="w-32">
                <span className="font-medium">{label}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`${key}-closed`}
                  checked={formData.opening_hours[key]?.closed || false}
                  onCheckedChange={(checked) => handleHoursChange(key, 'closed', checked)}
                />
                <Label htmlFor={`${key}-closed`} className="text-sm">
                  Fechado
                </Label>
              </div>
              
              {!formData.opening_hours[key]?.closed && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={formData.opening_hours[key]?.open || '08:00'}
                    onChange={(e) => handleHoursChange(key, 'open', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-gray-600">às</span>
                  <Input
                    type="time"
                    value={formData.opening_hours[key]?.close || '18:00'}
                    onChange={(e) => handleHoursChange(key, 'close', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Configurações de Notificação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                {notificationSounds.map(sound => (
                  <SelectItem key={sound.value} value={sound.value}>
                    {sound.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="px-8"
        >
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default SalonConfigurationForm;
