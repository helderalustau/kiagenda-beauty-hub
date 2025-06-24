
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Appointment } from '@/types/supabase-entities';

interface UseRealtimeNotificationsProps {
  salonId: string;
  onNewAppointment?: (appointment: Appointment) => void;
  onAppointmentUpdate?: (appointment: Appointment) => void;
  onAppointmentStatusChange?: (appointment: Appointment) => void;
}

export const useRealtimeNotifications = ({ 
  salonId, 
  onNewAppointment, 
  onAppointmentUpdate,
  onAppointmentStatusChange
}: UseRealtimeNotificationsProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!salonId) {
      console.log('⚠️ No salon ID provided for realtime notifications');
      return;
    }

    console.log('🔔 Setting up realtime notifications for salon:', salonId);

    // Setup realtime subscription for appointments
    const channel = supabase
      .channel(`appointment-changes-${salonId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `salon_id=eq.${salonId}`
        },
        async (payload) => {
          console.log('🔔 New appointment received via realtime:', payload);
          
          try {
            // Fetch complete appointment data with relations
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
              console.error('❌ Error fetching appointment details:', error);
              return;
            }

            if (appointment && appointment.status === 'pending') {
              console.log('✅ Processing new pending appointment:', appointment);
              
              // Add to notifications list
              setNotifications(prev => [appointment as Appointment, ...prev]);
              
              // Show toast notification for admin
              toast({
                title: "🔔 Novo Agendamento Solicitado!",
                description: `${appointment.client?.username || appointment.client?.name} solicitou agendamento para ${appointment.service?.name}`,
                duration: 10000,
              });

              // Call callback if provided
              if (onNewAppointment) {
                onNewAppointment(appointment as Appointment);
              }
            }
          } catch (error) {
            console.error('❌ Error processing new appointment notification:', error);
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
          console.log('📝 Appointment updated via realtime:', payload);
          
          try {
            // Fetch complete appointment data with relations
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
              console.error('❌ Error fetching updated appointment:', error);
              return;
            }

            if (appointment) {
              console.log('✅ Processing updated appointment:', appointment);
              
              // Call both callbacks for updates
              if (onAppointmentUpdate) {
                onAppointmentUpdate(appointment as Appointment);
              }
              
              if (onAppointmentStatusChange) {
                onAppointmentStatusChange(appointment as Appointment);
              }

              // Show status change notifications
              if (appointment.status === 'confirmed') {
                toast({
                  title: "✅ Agendamento Confirmado",
                  description: `Agendamento confirmado para ${appointment.client?.name || appointment.client?.username}`,
                  duration: 5000,
                });
              } else if (appointment.status === 'completed') {
                toast({
                  title: "🎉 Atendimento Concluído",
                  description: `Atendimento finalizado para ${appointment.client?.name || appointment.client?.username}`,
                  duration: 5000,
                });
              }
            }
          } catch (error) {
            console.error('❌ Error processing appointment update notification:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('🔌 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up realtime subscription for salon:', salonId);
      supabase.removeChannel(channel);
    };
  }, [salonId, onNewAppointment, onAppointmentUpdate, onAppointmentStatusChange, toast]);

  const clearNotification = (appointmentId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== appointmentId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    clearNotification,
    clearAllNotifications
  };
};
