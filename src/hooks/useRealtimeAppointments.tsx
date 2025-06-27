
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/hooks/useSupabaseData';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeAppointments = (salonId: string | undefined) => {
  const { toast } = useToast();
  const [newAppointments, setNewAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!salonId) return;

    console.log('🔄 Setting up realtime subscription for salon:', salonId);

    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        (payload) => {
          console.log('🆕 New appointment received:', payload);
          
          const newAppointment = payload.new as Appointment;
          
          if (newAppointment.status === 'pending') {
            // Buscar dados completos do agendamento
            supabase
              .from('appointments')
              .select(`
                *,
                salon:salons(id, name, address, phone),
                service:services(id, name, price, duration_minutes),
                client:client_auth(id, username, name, phone, email)
              `)
              .eq('id', newAppointment.id)
              .single()
              .then(({ data, error }) => {
                if (error) {
                  console.error('Error fetching appointment details:', error);
                  return;
                }

                if (data) {
                  setNewAppointments(prev => [data, ...prev]);
                  
                  // Mostrar notificação
                  toast({
                    title: "🔔 Nova Solicitação de Agendamento!",
                    description: `${data.client?.name} solicitou ${data.service?.name} para ${new Date(data.appointment_date).toLocaleDateString('pt-BR')} às ${data.appointment_time}`,
                    duration: 10000,
                  });

                  // Reproduzir som de notificação se disponível
                  try {
                    const audio = new Audio('/notification.mp3');
                    audio.play().catch(() => {
                      // Ignorar erro se não conseguir reproduzir o som
                    });
                  } catch (error) {
                    // Ignorar erro de áudio
                  }
                }
              });
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
        (payload) => {
          console.log('📝 Appointment updated:', payload);
          
          const updatedAppointment = payload.new as Appointment;
          
          // Remover da lista de novos agendamentos se o status mudou
          if (updatedAppointment.status !== 'pending') {
            setNewAppointments(prev => 
              prev.filter(apt => apt.id !== updatedAppointment.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔌 Unsubscribing from realtime appointments');
      supabase.removeChannel(channel);
    };
  }, [salonId, toast]);

  const clearNewAppointment = (appointmentId: string) => {
    setNewAppointments(prev => prev.filter(apt => apt.id !== appointmentId));
  };

  const clearAllNewAppointments = () => {
    setNewAppointments([]);
  };

  return {
    newAppointments,
    clearNewAppointment,
    clearAllNewAppointments
  };
};
