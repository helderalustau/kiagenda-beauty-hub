
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
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(salon);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const { updateSalon } = useSalonData();
  const { toast } = useToast();

  useEffect(() => {
    setCurrentSalon(salon);
  }, [salon]);

  const handleSalonChange = (updatedSalon: Salon) => {
    setCurrentSalon(updatedSalon);
    setHasChanges(true);
  };

  const handleSaveAllSettings = async () => {
    if (!currentSalon?.id) {
      toast({
        title: "Erro",
        description: "Estabelecimento não encontrado",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    try {
      const result = await updateSalon(currentSalon);
      
      if (result.success) {
        toast({
          title: "Sucesso",
          description: "Todas as configurações foram salvas!"
        });
        setHasChanges(false);
        onRefresh();
      } else {
        throw new Error(result.message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
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
    return planLimits[currentSalon?.plan as keyof typeof planLimits] || 2;
  };

  if (!currentSalon) {
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
            <strong>Responsável:</strong> {currentSalon.owner_name}
          </p>
        </div>
      </div>

      {/* Configuração Completa do Estabelecimento */}
      <SalonConfigurationForm 
        salon={currentSalon}
        onSalonChange={handleSalonChange}
      />

      {/* Gerenciar Usuários */}
      <SalonUsersManager
        salonId={currentSalon.id}
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
          {saving ? 'Salvando Configurações...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
