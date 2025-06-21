import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Building2, MapPin, Phone, Clock, Bell } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { useToast } from "@/components/ui/use-toast";

interface SalonConfigurationFormProps {
  salon: Salon;
  onUpdate: (data: Partial<Salon>) => Promise<any>;
  onChange?: () => void;
}

const SalonConfigurationForm = ({ salon, onUpdate, onChange }: SalonConfigurationFormProps) => {
  const [formData, setFormData] = useState({
    name: salon.name || '',
    owner_name: salon.owner_name || '',
    phone: salon.phone || '',
    contact_phone: salon.contact_phone || '',
    address: salon.address || '',
    street_number: salon.street_number || '',
    city: salon.city || '',
    state: salon.state || '',
    is_open: salon.is_open || false,
    notification_sound: salon.notification_sound || 'default',
    opening_hours: salon.opening_hours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    }
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (onChange) onChange();
  };

  const handleHoursChange = (day: string, field: string, value: any) => {
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
    if (onChange) onChange();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await onUpdate(formData);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Configurações atualizadas com sucesso!"
        });
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar configurações",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { key: 'monday', label: 'Segunda-feira' },
    { key: 'tuesday', label: 'Terça-feira' },
    { key: 'wednesday', label: 'Quarta-feira' },
    { key: 'thursday', label: 'Quinta-feira' },
    { key: 'friday', label: 'Sexta-feira' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' }
  ];

  const soundOptions = [
    { value: 'default', label: 'Padrão' },
    { value: 'chime', label: 'Sino' },
    { value: 'bell', label: 'Campainha' },
    { value: 'notification', label: 'Notificação' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome do Estabelecimento *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do seu estabelecimento"
                required
              />
            </div>
            <div>
              <Label htmlFor="owner_name">Nome do Responsável *</Label>
              <Input
                id="owner_name"
                value={formData.owner_name}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Telefone Principal *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
                required
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

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Endereço</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número, bairro"
              rows={2}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="street_number">Rua e Número</Label>
              <Input
                id="street_number"
                value={formData.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
                placeholder="Rua das Flores, 123"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="São Paulo"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="SP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status e Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Configurações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.is_open}
              onCheckedChange={(checked) => handleInputChange('is_open', checked)}
            />
            <div>
              <Label>Estabelecimento Aberto</Label>
              <p className="text-sm text-gray-500">
                Quando ativo, clientes podem fazer agendamentos
              </p>
            </div>
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
                {soundOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Horários de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Horários de Funcionamento</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {weekDays.map(day => (
            <div key={day.key} className="flex items-center space-x-4">
              <div className="w-24">
                <Label className="text-sm font-medium">{day.label}</Label>
              </div>
              <Switch
                checked={!formData.opening_hours[day.key]?.closed}
                onCheckedChange={(checked) => handleHoursChange(day.key, 'closed', !checked)}
              />
              {!formData.opening_hours[day.key]?.closed && (
                <div className="flex items-center space-x-2">
                  <Input
                    type="time"
                    value={formData.opening_hours[day.key]?.open || '09:00'}
                    onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-gray-500">às</span>
                  <Input
                    type="time"
                    value={formData.opening_hours[day.key]?.close || '18:00'}
                    onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                    className="w-24"
                  />
                </div>
              )}
              {formData.opening_hours[day.key]?.closed && (
                <span className="text-gray-500 text-sm">Fechado</span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </form>
  );
};

export default SalonConfigurationForm;
