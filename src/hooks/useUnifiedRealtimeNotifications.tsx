
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

  // Função para buscar agendamentos pendentes com logs detalhados
  const fetchPendingAppointments = useCallback(async () => {
    if (!salonId) {
      console.log('❌ SalonId não fornecido para buscar agendamentos pendentes');
      return;
    }

    console.log('📋 Buscando agendamentos pendentes para salon:', salonId);

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
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar agendamentos pendentes:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          salonId
        });
        return;
      }

      console.log('✅ Agendamentos pendentes encontrados:', {
        count: data?.length || 0,
        appointments: data,
        salonId
      });

      if (data && data.length > 0) {
        const validAppointments = data.filter(apt => apt.service && apt.client);
        console.log('✅ Agendamentos válidos:', validAppointments.length);
        
        setPendingAppointments(validAppointments as Appointment[]);
        
        // Notificar sobre novos agendamentos encontrados
        validAppointments.forEach(appointment => {
          console.log('📝 Processando agendamento:', {
            id: appointment.id,
            serviceName: appointment.service?.name,
            clientName: appointment.client?.name || appointment.client?.username,
            status: appointment.status
          });
          
          if (onNewAppointment) {
            onNewAppointment(appointment as Appointment);
          }
        });
      } else {
        console.log('📋 Nenhum agendamento pendente encontrado');
        setPendingAppointments([]);
      }
    } catch (error) {
      console.error('❌ Erro na verificação de agendamentos:', error);
    }
  }, [salonId, onNewAppointment]);

  // Verificação manual de agendamentos
  const checkForNewAppointments = useCallback(async () => {
    console.log('🔍 Verificação manual iniciada para salon:', salonId);
    setIsCheckingManually(true);
    
    try {
      await fetchPendingAppointments();
      
      toast({
        title: "🔍 Verificação Concluída",
        description: `Encontrados ${pendingAppointments.length} agendamentos pendentes`,
        duration: 3000,
      });
    } catch (error) {
      console.error('❌ Erro na verificação manual:', error);
      toast({
        title: "❌ Erro na Verificação",
        description: "Não foi possível verificar novos agendamentos",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsCheckingManually(false);
    }
  }, [fetchPendingAppointments, pendingAppointments.length, toast, salonId]);

  // Tocar som de notificação
  const playNotificationSound = useCallback((soundType: string = 'default') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

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
      console.log('⚠️ SalonId inválido para notificações:', salonId);
      return;
    }

    console.log('🔔 Configurando notificações unificadas para salon:', salonId);
    console.log('🔔 Admin atual: Juliana');

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
              console.log('✅ Processando novo agendamento pendente:', {
                id: appointment.id,
                serviceName: appointment.service?.name,
                clientName: appointment.client?.name || appointment.client?.username,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time
              });
              
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
              console.log('✅ Processando agendamento atualizado:', {
                id: appointment.id,
                oldStatus: payload.old.status,
                newStatus: appointment.status
              });
              
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
        console.log('🔌 Status da conexão realtime:', status);
        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na conexão realtime');
        }
      });

    // Verificação periódica como fallback
    const interval = setInterval(() => {
      console.log('⏰ Verificação periódica de agendamentos pendentes');
      fetchPendingAppointments();
    }, 60000);

    return () => {
      console.log('🔌 Limpando conexão realtime e intervalo');
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [salonId, onNewAppointment, onAppointmentUpdate, toast, fetchPendingAppointments, playNotificationSound]);

  // Limpar notificação específica
  const clearNotification = useCallback((appointmentId: string) => {
    console.log('🗑️ Removendo notificação:', appointmentId);
    setPendingAppointments(prev => prev.filter(n => n.id !== appointmentId));
  }, []);

  // Limpar todas as notificações
  const clearAllNotifications = useCallback(() => {
    console.log('🗑️ Removendo todas as notificações');
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
