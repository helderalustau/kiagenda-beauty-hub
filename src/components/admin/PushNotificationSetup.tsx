import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Bell, BellOff, Smartphone, TestTube, Settings, Moon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const PushNotificationSetup = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    settings,
    subscribe,
    unsubscribe,
    testNotification,
    updateSettings
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              As notificações push não são suportadas neste dispositivo ou navegador.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Para receber notificações, use um navegador moderno no celular ou desktop.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSilentHoursChange = (field: 'start' | 'end', value: string) => {
    updateSettings({
      silentHours: {
        ...settings.silentHours,
        [field]: value
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
          {isSubscribed && (
            <Badge variant="default" className="ml-auto">
              Ativado
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Receba notificações instantâneas no seu dispositivo quando houver novos agendamentos.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status e Ativação */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-base font-medium">
              Notificações Push
            </Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? 'Você receberá notificações no seu dispositivo' 
                : 'Ative para receber notificações instantâneas'
              }
            </p>
          </div>
          <div className="flex gap-2">
            {isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={testNotification}
                disabled={isLoading}
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testar
              </Button>
            )}
            <Button
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={isLoading}
              variant={isSubscribed ? "destructive" : "default"}
            >
              {isLoading ? (
                "Processando..."
              ) : isSubscribed ? (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Desativar
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Ativar
                </>
              )}
            </Button>
          </div>
        </div>

        {isSubscribed && (
          <>
            <Separator />
            
            {/* Configurações de Tipos de Notificação */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <Label className="text-base font-medium">Tipos de Notificação</Label>
              </div>
              
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="new-appointments" className="cursor-pointer">
                    Novos agendamentos
                  </Label>
                  <Switch
                    id="new-appointments"
                    checked={settings.newAppointments}
                    onCheckedChange={(checked) => updateSettings({ newAppointments: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="appointment-updates" className="cursor-pointer">
                    Alterações em agendamentos
                  </Label>
                  <Switch
                    id="appointment-updates"
                    checked={settings.appointmentUpdates}
                    onCheckedChange={(checked) => updateSettings({ appointmentUpdates: checked })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="cancelled-appointments" className="cursor-pointer">
                    Cancelamentos
                  </Label>
                  <Switch
                    id="cancelled-appointments"
                    checked={settings.cancelledAppointments}
                    onCheckedChange={(checked) => updateSettings({ cancelledAppointments: checked })}
                  />
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Horário de Silêncio */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  <Label className="text-base font-medium">Horário de Silêncio</Label>
                </div>
                <Switch
                  checked={settings.silentHours.enabled}
                  onCheckedChange={(checked) => updateSettings({ 
                    silentHours: { ...settings.silentHours, enabled: checked }
                  })}
                />
              </div>
              
              {settings.silentHours.enabled && (
                <div className="pl-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Durante este período, você não receberá notificações push.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="silent-start">Início</Label>
                      <Input
                        id="silent-start"
                        type="time"
                        value={settings.silentHours.start}
                        onChange={(e) => handleSilentHoursChange('start', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="silent-end">Fim</Label>
                      <Input
                        id="silent-end"
                        type="time"
                        value={settings.silentHours.end}
                        onChange={(e) => handleSilentHoursChange('end', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Informações PWA */}
        {!isSubscribed && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 Dica</h4>
            <p className="text-sm text-muted-foreground">
              Para melhor experiência, você pode "instalar" este aplicativo no seu dispositivo. 
              Procure pela opção "Adicionar à tela inicial" ou "Instalar app" no menu do seu navegador.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PushNotificationSetup;