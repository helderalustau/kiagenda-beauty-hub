
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, User, Save, Loader2 } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import OpeningHoursManager from './OpeningHoursManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface SalonConfigurationFormProps {
  salon: Salon;
  onSalonChange: (salon: Salon) => void;
}

const SalonConfigurationForm = ({ salon, onSalonChange }: SalonConfigurationFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: salon?.name || '',
    owner_name: salon?.owner_name || '',
    phone: salon?.phone || '',
    contact_phone: salon?.contact_phone || '',
    address: salon?.address || ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData({
      name: salon?.name || '',
      owner_name: salon?.owner_name || '',
      phone: salon?.phone || '',
      contact_phone: salon?.contact_phone || '',
      address: salon?.address || ''
    });
    setHasChanges(false);
  }, [salon]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!salon?.id || !hasChanges) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: formData.name,
          owner_name: formData.owner_name,
          phone: formData.phone,
          contact_phone: formData.contact_phone,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id);

      if (error) {
        console.error('Erro ao salvar configurações:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar configurações do estabelecimento",
          variant: "destructive"
        });
        return;
      }

      // Atualizar o estado local
      const updatedSalon = {
        ...salon,
        name: formData.name,
        owner_name: formData.owner_name,
        phone: formData.phone,
        contact_phone: formData.contact_phone,
        address: formData.address
      };

      onSalonChange(updatedSalon);
      setHasChanges(false);

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const planTypes = {
    bronze: { name: 'Bronze', color: 'bg-amber-600' },
    silver: { name: 'Prata', color: 'bg-gray-500' },
    gold: { name: 'Ouro', color: 'bg-yellow-500' }
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Informações Básicas</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salon-name">Nome do Estabelecimento</Label>
              <Input
                id="salon-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome do seu estabelecimento"
              />
            </div>
            <div>
              <Label htmlFor="owner-name">Nome do Responsável</Label>
              <Input
                id="owner-name"
                value={formData.owner_name}
                onChange={(e) => handleInputChange('owner_name', e.target.value)}
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="salon-plan">Plano Atual</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${planTypes[salon?.plan as keyof typeof planTypes]?.color || 'bg-gray-500'} text-white`}>
                {planTypes[salon?.plan as keyof typeof planTypes]?.name || 'Bronze'}
              </Badge>
              <span className="text-sm text-gray-600">
                Plano ativo do estabelecimento
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Contato */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Informações de Contato</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salon-phone">Telefone Principal</Label>
              <Input
                id="salon-phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone">Telefone de Contato</Label>
              <Input
                id="contact-phone"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                placeholder="(11) 88888-8888"
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
            <Label htmlFor="salon-address">Endereço Completo</Label>
            <Textarea
              id="salon-address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Rua, número, bairro, cidade, estado"
              rows={3}
            />
          </div>

          {/* Botão de salvar informações básicas */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Informações</span>
                </>
              )}
            </Button>
          </div>

          {hasChanges && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Você possui alterações não salvas nas informações básicas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horário de Funcionamento - Componente separado */}
      <OpeningHoursManager 
        salonId={salon?.id} 
        initialHours={salon?.opening_hours}
      />
    </div>
  );
};

export default SalonConfigurationForm;
