import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PushNotificationSettings {
  enabled: boolean;
  newAppointments: boolean;
  appointmentUpdates: boolean;
  cancelledAppointments: boolean;
  silentHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<PushNotificationSettings>({
    enabled: false,
    newAppointments: true,
    appointmentUpdates: true,
    cancelledAppointments: true,
    silentHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  });
  
  const { toast } = useToast();

  // Verificar suporte a push notifications
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'PushManager' in window && 
                       'Notification' in window;
      
      setIsSupported(supported);
      
      if (!supported) {
        console.warn('Push notifications não suportadas neste dispositivo');
      }
    };

    checkSupport();
  }, []);

  // Registrar service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers não suportados');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registrado:', registration);
      
      // Aguardar ativação
      await navigator.serviceWorker.ready;
      
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      throw error;
    }
  }, []);

  // Solicitar permissão para notificações
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Notificações não suportadas');
    }

    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      throw new Error('Permissão para notificações negada');
    }

    return permission;
  }, []);

  // Obter chave pública VAPID (você precisa gerar isso)
  const getVapidPublicKey = () => {
    // Esta chave deve ser gerada e configurada no seu backend
    // Para teste, usando uma chave exemplo (SUBSTITUA pela sua chave real)
    return 'BEl62iUYgUivxIkv69yViEuiBIa40HI80NE_9gDwU0mw9VqxtlSRoMiHDk-jG8Z5OdKiUJpR4zJ-2eO4zY8x_Vo';
  };

  // Converter chave VAPID para Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Subscrever para push notifications
  const subscribe = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // 1. Registrar service worker
      const registration = await registerServiceWorker();
      
      // 2. Solicitar permissão
      await requestPermission();
      
      // 3. Criar subscription
      const vapidPublicKey = getVapidPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      // 4. Salvar subscription no banco
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const salonData = JSON.parse(localStorage.getItem('salonData') || '{}');

      if (!adminData.id || !salonData.id) {
        throw new Error('Dados do admin ou salão não encontrados');
      }

      const { error } = await supabase
        .from('push_notification_tokens')
        .upsert({
          admin_id: adminData.id,
          salon_id: salonData.id,
          subscription_data: pushSubscription.toJSON(),
          settings: settings,
          active: true
        }, {
          onConflict: 'admin_id,salon_id'
        });

      if (error) throw error;

      setSubscription(pushSubscription);
      setIsSubscribed(true);
      
      toast({
        title: "Notificações ativadas!",
        description: "Você receberá notificações de novos agendamentos no seu dispositivo.",
      });

    } catch (error) {
      console.error('Erro ao ativar notificações:', error);
      toast({
        title: "Erro ao ativar notificações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [settings, toast, registerServiceWorker, requestPermission]);

  // Desinscrever de push notifications
  const unsubscribe = useCallback(async () => {
    setIsLoading(true);

    try {
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remover do banco
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const salonData = JSON.parse(localStorage.getItem('salonData') || '{}');

      if (adminData.id && salonData.id) {
        const { error } = await supabase
          .from('push_notification_tokens')
          .update({ active: false })
          .eq('admin_id', adminData.id)
          .eq('salon_id', salonData.id);

        if (error) throw error;
      }

      setSubscription(null);
      setIsSubscribed(false);
      
      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais notificações push.",
      });

    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast({
        title: "Erro ao desativar notificações",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [subscription, toast]);

  // Verificar subscription existente
  useEffect(() => {
    const checkExistingSubscription = async () => {
      if (!isSupported) return;

      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (!registration) return;

        const pushSubscription = await registration.pushManager.getSubscription();
        
        if (pushSubscription) {
          setSubscription(pushSubscription);
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Erro ao verificar subscription:', error);
      }
    };

    checkExistingSubscription();
  }, [isSupported]);

  // Testar notificação
  const testNotification = useCallback(async () => {
    try {
      const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
      const salonData = JSON.parse(localStorage.getItem('salonData') || '{}');

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          adminId: adminData.id,
          salonId: salonData.id,
          title: 'Teste de Notificação',
          body: 'Esta é uma notificação de teste do Ki Agenda!',
          data: {
            type: 'test',
            url: '/admin'
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Notificação de teste enviada!",
        description: "Verifique se recebeu a notificação no seu dispositivo.",
      });

    } catch (error) {
      console.error('Erro ao enviar teste:', error);
      toast({
        title: "Erro ao enviar teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Atualizar configurações
  const updateSettings = useCallback(async (newSettings: Partial<PushNotificationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (isSubscribed) {
      try {
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        const salonData = JSON.parse(localStorage.getItem('salonData') || '{}');

        const { error } = await supabase
          .from('push_notification_tokens')
          .update({ settings: updatedSettings })
          .eq('admin_id', adminData.id)
          .eq('salon_id', salonData.id);

        if (error) throw error;

        toast({
          title: "Configurações atualizadas",
          description: "Suas preferências de notificação foram salvas.",
        });

      } catch (error) {
        console.error('Erro ao atualizar configurações:', error);
        toast({
          title: "Erro ao salvar configurações",
          description: error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive"
        });
      }
    }
  }, [settings, isSubscribed, toast]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    settings,
    subscription,
    subscribe,
    unsubscribe,
    testNotification,
    updateSettings
  };
};