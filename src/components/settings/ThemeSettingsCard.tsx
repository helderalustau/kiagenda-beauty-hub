
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Salon } from '@/types/supabase-entities';

interface ThemeSettingsCardProps {
  salon: Salon;
}

const ThemeSettingsCard = ({ salon }: ThemeSettingsCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    primaryColor: 'blue',
    accentColor: 'purple'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate saving theme settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "✅ Tema atualizado!",
        description: "As configurações de aparência foram salvas."
      });
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de tema.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="theme-select">Tema</Label>
        <Select
          value={settings.theme}
          onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}
        >
          <SelectTrigger id="theme-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Escuro</SelectItem>
            <SelectItem value="auto">Automático</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="primary-color">Cor Primária</Label>
        <Select
          value={settings.primaryColor}
          onValueChange={(value) => setSettings(prev => ({ ...prev, primaryColor: value }))}
        >
          <SelectTrigger id="primary-color">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="purple">Roxo</SelectItem>
            <SelectItem value="green">Verde</SelectItem>
            <SelectItem value="red">Vermelho</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="accent-color">Cor de Destaque</Label>
        <Select
          value={settings.accentColor}
          onValueChange={(value) => setSettings(prev => ({ ...prev, accentColor: value }))}
        >
          <SelectTrigger id="accent-color">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="purple">Roxo</SelectItem>
            <SelectItem value="blue">Azul</SelectItem>
            <SelectItem value="orange">Laranja</SelectItem>
            <SelectItem value="pink">Rosa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Aplicando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Aplicar Tema
          </>
        )}
      </Button>
    </div>
  );
};

export default ThemeSettingsCard;
