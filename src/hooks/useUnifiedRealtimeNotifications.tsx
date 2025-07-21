import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Appointment } from '@/types/supabase-entities';

interface UseUnifiedRealtimeNotificationsProps {
  salonId: string;
  onNewAppointment?: (appointment: Appointment) => void;
  onAppointmentUpdate?: (appointment: Appointment) => void;
}

export const useUnifiedRealtimeNotifications = ({ 
  salonId, 
  onNewAppointment, 
  onAppointmentUpdate
}: UseUnifiedRealtimeNotificationsProps) => {
  const { toast } = useToast();
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [isCheckingManually, setIsCheckingManually] = useState(false);

  // Função para buscar agendamentos pendentes - OTIMIZADA
  const fetchPendingAppointments = useCallback(async () => {
    if (!salonId) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          salon:salons(id, name, address, phone),
          service:services(id, name, price, duration_minutes),
          client:client_auth(id, username, name, phone, email)
        `)
        .eq('salon_id', salonId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar agendamentos pendentes:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return;
      }

      if (data && data.length > 0) {
        setPendingAppointments(data as Appointment[]);
        
        // Notificar sobre novos agendamentos encontrados
        data.forEach(appointment => {
          if (onNewAppointment) {
            onNewAppointment(appointment as Appointment);
          }
        });
      } else {
        setPendingAppointments([]);
      }
    } catch (error) {
      console.error('❌ Erro na verificação de agendamentos:', error);
    }
  }, [salonId, onNewAppointment]);

  // Verificação manual de agendamentos
  const checkForNewAppointments = useCallback(async () => {
    setIsCheckingManually(true);
    
    try {
      await fetchPendingAppointments();
      
      toast({
        title: "🔍 Verificação Concluída",
        description: `Encontrados ${pendingAppointments.length} agendamentos pendentes`,
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Erro na Verificação",
        description: "Não foi possível verificar novos agendamentos",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsCheckingManually(false);
    }
  }, [fetchPendingAppointments, pendingAppointments.length, toast]);

  // Tocar som de notificação
  const playNotificationSound = useCallback((soundType: string = 'default') => {
    try {
      // Usar Web Audio API para criar som
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Diferentes frequências para diferentes tipos de som
      const frequencies = {
        default: 800,
        bell: 1000,
        chime: 600,
        alert: 400
      };

      oscillator.frequency.setValueAtTime(
        frequencies[soundType as keyof typeof frequencies] || frequencies.default, 
        audioContext.currentTime
      );
      oscillator.type = 'sine';

      // Envelope para suavizar o som
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('⚠️ Não foi possível reproduzir som de notificação:', error);
    }
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    if (!salonId || salonId.trim() === '') {
      return;
    }

    console.log('🔔 Configurando notificações unificadas para salon:', salonId);

    // Buscar agendamentos pendentes ao iniciar
    fetchPendingAppointments();

    // Setup realtime subscription
    const channel = supabase
      .channel(`unified-notifications-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('🔔 Novo agendamento recebido via realtime:', payload);
          
          try {
            // Buscar dados completos do agendamento
            const { data: appointment, error } = await supabase
              .from('appointments')
              .select(`
                *,
                salon:salons(id, name, address, phone),
                service:services(id, name, price, duration_minutes),
                client:client_auth(id, username, name, phone, email)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('❌ Erro ao buscar detalhes do agendamento:', error);
              return;
            }

            if (appointment && appointment.status === 'pending') {
              console.log('✅ Processando novo agendamento pendente:', appointment);
              
              // Adicionar à lista de pendentes
              setPendingAppointments(prev => [appointment as Appointment, ...prev]);
              
              // Tocar som de notificação
              playNotificationSound('default');
              
              // Mostrar toast notification
              toast({
                title: "🔔 Novo Agendamento Solicitado!",
                description: `${appointment.client?.username || appointment.client?.name} solicitou ${appointment.service?.name}`,
                duration: 10000,
              });

              // Chamar callback se fornecido
              if (onNewAppointment) {
                onNewAppointment(appointment as Appointment);
              }
            }
          } catch (error) {
            console.error('❌ Erro ao processar notificação de novo agendamento:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('📝 Agendamento atualizado via realtime:', payload);
          
          try {
            // Buscar dados completos do agendamento atualizado
            const { data: appointment, error } = await supabase
              .from('appointments')
              .select(`
                *,
                salon:salons(id, name, address, phone),
                service:services(id, name, price, duration_minutes),
                client:client_auth(id, username, name, phone, email)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('❌ Erro ao buscar agendamento atualizado:', error);
              return;
            }

            if (appointment) {
              console.log('✅ Processando agendamento atualizado:', appointment);
              
              // Remover da lista de pendentes se status mudou
              if (appointment.status !== 'pending') {
                setPendingAppointments(prev => 
                  prev.filter(apt => apt.id !== appointment.id)
                );
              }

              // Chamar callback de atualização
              if (onAppointmentUpdate) {
                onAppointmentUpdate(appointment as Appointment);
              }

              // Mostrar notificação de status se relevante
              if (appointment.status === 'confirmed') {
                toast({
                  title: "✅ Agendamento Confirmado",
                  description: `Agendamento confirmado para ${appointment.client?.name || appointment.client?.username}`,
                  duration: 5000,
                });
              }
            }
          } catch (error) {
            console.error('❌ Erro ao processar atualização de agendamento:', error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na conexão realtime');
        }
      });

    // Verificação periódica como fallback - REDUZIDA PARA MELHOR PERFORMANCE
    const interval = setInterval(() => {
      fetchPendingAppointments();
    }, 60000); // Reduzido para 1 minuto para melhor performance

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [salonId, onNewAppointment, onAppointmentUpdate, toast, fetchPendingAppointments, playNotificationSound]);

  // Limpar notificação específica
  const clearNotification = useCallback((appointmentId: string) => {
    setPendingAppointments(prev => prev.filter(n => n.id !== appointmentId));
  }, []);

  // Limpar todas as notificações
  const clearAllNotifications = useCallback(() => {
    setPendingAppointments([]);
  }, []);

  return {
    pendingAppointments,
    isCheckingManually,
    checkForNewAppointments,
    clearNotification,
    clearAllNotifications
  };
};