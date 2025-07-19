
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';
import { Star, Crown, Diamond, ArrowUp } from "lucide-react";
import PlanUpgradeModal from './PlanUpgradeModal';

interface SalonInfoManagerProps {
  salon: Salon;
  onUpdate: () => void;
}

const SalonInfoManager = ({ salon, onUpdate }: SalonInfoManagerProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: salon.name || '',
    owner_name: salon.owner_name || '',
    phone: salon.phone || '',
    contact_phone: salon.contact_phone || '',
    address: salon.address || '',
    city: salon.city || '',
    state: salon.state || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('salons')
        .update(formData)
        .eq('id', salon.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Informações do estabelecimento atualizadas com sucesso!"
      });

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating salon:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as informações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: salon.name || '',
      owner_name: salon.owner_name || '',
      phone: salon.phone || '',
      contact_phone: salon.contact_phone || '',
      address: salon.address || '',
      city: salon.city || '',
      state: salon.state || ''
    });
    setIsEditing(false);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'bronze': return Star;
      case 'silver': return Crown;
      case 'gold': return Crown;
      case 'platinum': return Diamond;
      default: return Star;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'bronze': return 'text-amber-600 bg-amber-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  const getPlanName = (plan: string) => {
    const names = {
      bronze: 'Bronze',
      silver: 'Prata',
      gold: 'Ouro',
      platinum: 'Platinum'
    };
    return names[plan as keyof typeof names] || 'Bronze';
  };

  const PlanIcon = getPlanIcon(salon.plan);

  return (
    <div className="space-y-6">
      {/* Plano Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlanIcon className="h-5 w-5" />
            Plano Atual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${getPlanColor(salon.plan)}`}>
                <PlanIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-lg">{getPlanName(salon.plan)}</p>
                <p className="text-sm text-muted-foreground">Plano ativo</p>
              </div>
            </div>
            <Badge className={getPlanColor(salon.plan)}>
              {getPlanName(salon.plan)}
            </Badge>
          </div>
          
          <PlanUpgradeModal
            currentPlan={salon.plan}
            salonId={salon.id}
            salonName={salon.name}
            onUpgradeRequest={onUpdate}
          />
        </CardContent>
      </Card>

      {/* Informações do Estabelecimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Informações do Estabelecimento</CardTitle>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome do Estabelecimento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="owner_name">Nome do Proprietário</Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone Principal</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact_phone">Telefone de Contato</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalonInfoManager;
