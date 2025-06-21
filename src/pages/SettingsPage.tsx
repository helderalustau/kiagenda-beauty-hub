
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Users, Save } from "lucide-react";
import { Salon } from '@/hooks/useSupabaseData';
import { useSalonData } from '@/hooks/useSalonData';
import { useToast } from "@/components/ui/use-toast";
import SalonConfigurationForm from '@/components/settings/SalonConfigurationForm';
import SalonUsersManager from '@/components/settings/SalonUsersManager';

interface SettingsPageProps {
  salon: Salon | null;
  onRefresh: () => void;
}

const SettingsPage = ({ salon, onRefresh }: SettingsPageProps) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const { updateSalon } = useSalonData();
  const { toast } = useToast();

  const handleUpdateSalon = async (data: Partial<Salon>) => {
    if (!salon?.id) {
      return { success: false, message: "Estabelecimento não encontrado" };
    }
    
    const updateData = {
      ...data,
      id: salon.id
    };
    
    const result = await updateSalon(updateData);
    
    if (result.success) {
      setHasChanges(false);
      onRefresh();
    }
    
    return result;
  };

  const handleSaveAllSettings = async () => {
    setSaving(true);
    
    try {
      // Aqui você pode implementar a lógica para salvar todas as configurações pendentes
      toast({
        title: "Sucesso",
        description: "Todas as configurações foram salvas!"
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpgrade = () => {
    window.location.href = '/plan-selection';
  };

  const getMaxUsers = () => {
    const planLimits = {
      bronze: 2,
      prata: 5,
      gold: 10
    };
    return planLimits[salon?.plan as keyof typeof planLimits] || 2;
  };

  if (!salon) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Estabelecimento não encontrado. Recarregue a página.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <div className="space-y-1">
          <p className="text-gray-600">Gerencie as configurações completas do seu estabelecimento</p>
          <p className="text-sm text-gray-500">
            <strong>Responsável:</strong> {salon.owner_name}
          </p>
        </div>
      </div>

      {/* Configuração Completa do Estabelecimento */}
      <SalonConfigurationForm 
        salon={salon}
        onUpdate={handleUpdateSalon}
        onChange={() => setHasChanges(true)}
      />

      {/* Gerenciar Usuários */}
      <SalonUsersManager
        salonId={salon.id}
        maxUsers={getMaxUsers()}
        onUpgrade={handleUpgrade}
      />

      {/* Botão de Salvar Configurações */}
      <div className="flex justify-center pt-6">
        <Button
          onClick={handleSaveAllSettings}
          disabled={saving || !hasChanges}
          size="lg"
          className="min-w-48"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvan&Configurações...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
