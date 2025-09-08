
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';
import { Save, MapPin, Phone, User, Instagram } from "lucide-react";

interface SalonInfoCardProps {
  salon: Salon;
  onUpdate: () => Promise<void>;
}

const SalonInfoCard = ({ salon, onUpdate }: SalonInfoCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: salon.name || '',
    owner_name: salon.owner_name || '',
    phone: salon.phone || '',
    contact_phone: salon.contact_phone || '',
    address: salon.address || '',
    city: salon.city || '',
    state: salon.state || '',
    plan: salon.plan || 'bronze' as 'bronze' | 'prata' | 'gold',
    instagram_username: salon.instagram_username || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('salons')
        .update({
          name: formData.name,
          owner_name: formData.owner_name,
          phone: formData.phone,
          contact_phone: formData.contact_phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          plan: formData.plan,
          instagram_username: formData.instagram_username,
          updated_at: new Date().toISOString()
        })
        .eq('id', salon.id);

      if (error) throw error;

      toast({
        title: "✅ Informações atualizadas!",
        description: "As informações do estabelecimento foram salvas com sucesso."
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating salon info:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao atualizar as informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
          </div>

          <div>
            <Label htmlFor="name">Nome do Estabelecimento *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Digite o nome do seu estabelecimento"
              required
            />
          </div>

          <div>
            <Label htmlFor="owner_name">Nome do Proprietário *</Label>
            <Input
              id="owner_name"
              value={formData.owner_name}
              onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
              placeholder="Nome do proprietário"
              required
            />
          </div>

          <div>
            <Label htmlFor="plan">Plano Atual</Label>
            <Select
              value={formData.plan}
              onValueChange={(value: 'bronze' | 'prata' | 'gold') => setFormData(prev => ({ ...prev, plan: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="prata">Prata</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ===== CAMPO INSTAGRAM ADICIONADO AQUI ===== */}
          <div>
            <Label htmlFor="instagram_username" className="flex items-center space-x-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              <span>Instagram</span>
            </Label>
            <Input
              id="instagram_username"
              value={formData.instagram_username}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram_username: e.target.value }))}
              placeholder="seuperfil (sem @)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite apenas o nome do usuário do Instagram (sem o @). Ex: salaobeleza
            </p>
          </div>
        </div>

        {/* Contato e Localização */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Contato e Localização</h3>
          </div>

          <div>
            <Label htmlFor="phone">Telefone Principal *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <Label htmlFor="contact_phone">Telefone Adicional</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço Completo *</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Rua, número, bairro, complemento..."
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder="Cidade"
                required
              />
            </div>
            <div>
              <Label htmlFor="state">Estado *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder="UF"
                maxLength={2}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default SalonInfoCard;
