
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Salon } from '@/types/supabase-entities';

interface NotificationSettingsCardProps {
  salon: Salon;
}

const NotificationSettingsCard = ({ salon }: NotificationSettingsCardProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    sound: salon.notification_sound || 'default',
    enableNotifications: true,
    emailNotifications: true
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('salons')
        .update({ notification_sound: settings.sound })
        .eq('id', salon.id);

      if (error) throw error;

      toast({
        title: "✅ Configurações salvas!",
        description: "As configurações de notificação foram atualizadas."
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="notification-sound">Som de Notificação</Label>
        <Select
          value={settings.sound}
          onValueChange={(value) => setSettings(prev => ({ ...prev, sound: value }))}
        >
          <SelectTrigger id="notification-sound">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Som Padrão</SelectItem>
            <SelectItem value="bell">Sino</SelectItem>
            <SelectItem value="chime">Carrilhão</SelectItem>
            <SelectItem value="ding">Ding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="enable-notifications">Notificações Ativas</Label>
            <p className="text-sm text-gray-500">Receber notificações de novos agendamentos</p>
          </div>
          <Switch
            id="enable-notifications"
            checked={settings.enableNotifications}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNotifications: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <p className="text-sm text-gray-500">Receber emails sobre agendamentos</p>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.emailNotifications}
            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </>
        )}
      </Button>
    </div>
  );
};

export default NotificationSettingsCard;
