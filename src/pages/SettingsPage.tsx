
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Salon } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, Upload, Volume2 } from "lucide-react";

interface SettingsPageProps {
  salon: Salon | null;
  onRefresh: () => Promise<void>;
}

const SettingsPage = ({ salon, onRefresh }: SettingsPageProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    contact_phone: '',
    is_open: false,
    notification_sound: 'default',
    banner_image_url: ''
  });

  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || '',
        address: salon.address || '',
        phone: salon.phone || '',
        contact_phone: salon.contact_phone || '',
        is_open: salon.is_open || false,
        notification_sound: salon.notification_sound || 'default',
        banner_image_url: salon.banner_image_url || ''
      });
    }
  }, [salon]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!salon) {
      toast({
        title: "Erro",
        description: "Nenhum estabelecimento encontrado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          contact_phone: formData.contact_phone,
          is_open: formData.is_open,
          notification_sound: formData.notification_sound,
          banner_image_url: formData.banner_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id);

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar configurações",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Configurações salvas com sucesso!",
      });

      // Refresh data to get updated values
      await onRefresh();
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!salon) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <Settings className="h-6 w-6 mr-2" />
          Configurações do Estabelecimento
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Gerencie as configurações do seu estabelecimento
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Estabelecimento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do seu estabelecimento"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Endereço completo"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone Principal</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_phone">Telefone de Contato</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="(11) 88888-8888"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_open">Estabelecimento Aberto</Label>
                <p className="text-sm text-gray-500">
                  Controla se o estabelecimento está aceitando agendamentos
                </p>
              </div>
              <Switch
                id="is_open"
                checked={formData.is_open}
                onCheckedChange={(checked) => handleInputChange('is_open', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification_sound">Som de Notificação</Label>
              <Select
                value={formData.notification_sound}
                onValueChange={(value) => handleInputChange('notification_sound', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o som" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão</SelectItem>
                  <SelectItem value="bell">Sino</SelectItem>
                  <SelectItem value="chime">Carrilhão</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Som que será reproduzido quando chegarem novos agendamentos
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_image_url">URL da Imagem de Banner</Label>
              <Input
                id="banner_image_url"
                value={formData.banner_image_url}
                onChange={(e) => handleInputChange('banner_image_url', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-sm text-gray-500">
                Imagem que aparecerá na página pública do estabelecimento
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Save className="h-5 w-5 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
