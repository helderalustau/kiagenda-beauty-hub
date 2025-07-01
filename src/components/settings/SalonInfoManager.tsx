
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { formatPhone, unformatPhone } from '@/utils/phoneFormatter';
import { Phone, MapPin, User, Save, CheckCircle } from "lucide-react";

interface SalonInfoManagerProps {
  salon: any;
  onUpdate: (updatedSalon: any) => void;
}

const SalonInfoManager = ({ salon, onUpdate }: SalonInfoManagerProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    contact_phone: '',
    address: '',
    street_number: '',
    city: '',
    state: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (salon) {
      setFormData({
        name: salon.name || '',
        owner_name: salon.owner_name || '',
        phone: salon.phone || '',
        contact_phone: salon.contact_phone || '',
        address: salon.address || '',
        street_number: salon.street_number || '',
        city: salon.city || '',
        state: salon.state || ''
      });
    }
  }, [salon]);

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    
    // Formatação automática para campos de telefone
    if (field === 'phone' || field === 'contact_phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 11) {
        processedValue = digits;
      } else {
        return; // Não permite mais de 11 dígitos
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
    
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!salon?.id) {
      toast({
        title: "Erro",
        description: "ID do estabelecimento não encontrado",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        ...formData,
        // Salvar telefones sem formatação no banco
        phone: unformatPhone(formData.phone),
        contact_phone: formData.contact_phone ? unformatPhone(formData.contact_phone) : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('salons')
        .update(updateData)
        .eq('id', salon.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Atualizar o estado local imediatamente
      const updatedSalon = { ...salon, ...data };
      onUpdate(updatedSalon);
      setHasChanges(false);

      toast({
        title: "✅ Informações Atualizadas!",
        description: "As informações do estabelecimento foram salvas com sucesso.",
        duration: 3000
      });

    } catch (error) {
      console.error('Error updating salon info:', error);
      toast({
        title: "Erro ao Atualizar",
        description: "Não foi possível salvar as informações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!salon) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Informações do Estabelecimento</span>
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Alterações pendentes
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="owner_name">Nome do Proprietário *</Label>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Telefone Principal *</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <Input
                  id="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(00)00000-0000"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="contact_phone">Telefone de Contato</Label>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <Input
                  id="contact_phone"
                  value={formatPhone(formData.contact_phone)}
                  onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                  placeholder="(00)0000-0000"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço Completo *</Label>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, bairro"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="street_number">Número</Label>
              <Input
                id="street_number"
                value={formData.street_number}
                onChange={(e) => handleInputChange('street_number', e.target.value)}
                placeholder="123"
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
                maxLength={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              disabled={!hasChanges || isUpdating}
              className="flex items-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SalonInfoManager;
